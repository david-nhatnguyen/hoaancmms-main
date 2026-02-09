import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '@/database/prisma.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { EquipmentQueryDto } from './dto/equipment-query.dto';
import { Prisma, EquipmentStatus } from '@prisma/generated/prisma';
import { QUEUE_NAMES } from '@/common/constants';

import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

import { EquipmentsQrService } from './equipments.qr.service';

@Injectable()
export class EquipmentsService {
  private readonly UPLOAD_DIR = './uploads/images/equipments';
  private readonly UPLOAD_DOCS_DIR = './uploads/documents/equipments';

  constructor(
    private prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.EXCEL_IMPORT) private importQueue: Queue,
    private qrService: EquipmentsQrService,
  ) {
    this.ensureDirectory();
  }

  private ensureDirectory() {
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
    }
    if (!fs.existsSync(this.UPLOAD_DOCS_DIR)) {
      fs.mkdirSync(this.UPLOAD_DOCS_DIR, { recursive: true });
    }
  }

  private async saveEquipmentImage(file: Express.Multer.File): Promise<string> {
    const fileName = `${Date.now()}_${uuidv4()}.webp`;
    const savePath = path.join(this.UPLOAD_DIR, fileName);

    await sharp(file.buffer)
      .resize({ width: 1000, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(savePath);

    return `/uploads/images/equipments/${fileName}`;
  }

  private async saveEquipmentDocument(
    file: Express.Multer.File,
  ): Promise<{ path: string; name: string; size: number; type: string }> {
    // Generate safe filename to avoid overwrites but keep original extension
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8'); // Handle UTF-8 chars if needed
    const ext = path.extname(originalName);
    const safeName = `${Date.now()}_${uuidv4()}${ext}`;
    const savePath = path.join(this.UPLOAD_DOCS_DIR, safeName);

    // Write file directly
    await fs.promises.writeFile(savePath, file.buffer);

    return {
      path: `/uploads/documents/equipments/${safeName}`, // Public URL path
      name: originalName,
      size: file.size,
      type: file.mimetype,
    };
  }

  /**
   * Safe asset removal (images, QR codes, documents)
   */
  private async removeEquipmentAssets(equipment: {
    code: string;
    image?: string | null;
    documents?: { path: string }[];
  }) {
    // 1. Delete QR Code via QR Service
    try {
      if (equipment.code) {
        await this.qrService.deleteQrCode(equipment.code);
      }
    } catch (error) {
      console.error(`Failed to delete QR code for ${equipment.code}:`, error);
    }

    // 2. Delete Machine Image
    if (equipment.image && equipment.image.startsWith('/uploads/')) {
      try {
        const filePath = path.join(process.cwd(), equipment.image);
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      } catch (error) {
        console.error(`Failed to delete image at ${equipment.image}:`, error);
      }
    }

    // 3. Delete Documents
    if (equipment.documents && equipment.documents.length > 0) {
      for (const doc of equipment.documents) {
        try {
          const filePath = path.join(process.cwd(), doc.path);
          if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
          }
        } catch (error) {
          console.error(`Failed to delete document at ${doc.path}:`, error);
        }
      }
    }
  }

  async uploadDocument(equipmentId: string, file: Express.Multer.File) {
    const equipment = await this.prisma.client.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${equipmentId} not found`);
    }

    const fileInfo = await this.saveEquipmentDocument(file);

    return this.prisma.client.equipmentDocument.create({
      data: {
        ...fileInfo,
        equipmentId,
      },
    });
  }

  async deleteDocument(documentId: string) {
    const doc = await this.prisma.client.equipmentDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Delete physical file
    try {
      const filePath = path.join(process.cwd(), doc.path);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error(`Failed to delete document file at ${doc.path}:`, error);
    }

    // Delete DB record
    return this.prisma.client.equipmentDocument.delete({
      where: { id: documentId },
    });
  }

  // ... rest of class starts here
  async importExcel(filePath: string) {
    // 1. Calculate Total Records
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    let totalRecords = 0;
    if (worksheet) {
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1 && row.actualCellCount > 0) {
          totalRecords++;
        }
      });
    }

    // 2. Create Import History Record
    const importHistory = await this.prisma.client.importHistory.create({
      data: {
        fileName: filePath.split('/').pop() || 'unknown.xlsx',
        fileSize: fs.statSync(filePath).size,
        totalRecords: totalRecords,
        status: 'PENDING',
      },
    });

    // 3. Estimate Time
    const totalImages = worksheet ? worksheet.getImages().length : 0;
    // Calculation: (Records * 1ms) + (Images * 5ms) + 1000ms (buffer)
    const estimatedDuration = totalRecords * 1 + totalImages * 5 + 1000;

    // 4. Push to Queue
    await this.importQueue.add(
      'import-equipments',
      {
        filePath,
        importHistoryId: importHistory.id,
      },
      { removeOnComplete: true, removeOnFail: false },
    );

    return {
      id: importHistory.id, // Case 1: Generic id
      importId: importHistory.id, // Case 2: Named importId
      totalRecords,
      estimatedDuration,
      message: 'Import job started',
    };
  }

  async getImportStatus(id: string) {
    const history = await this.prisma.client.importHistory.findUnique({
      where: { id },
    });

    if (!history) {
      throw new NotFoundException(`Import job ${id} not found`);
    }

    return history;
  }

  async create(createEquipmentDto: CreateEquipmentDto, file?: Express.Multer.File) {
    const existing = await this.prisma.client.equipment.findUnique({
      where: { code: createEquipmentDto.code },
    });

    if (existing) {
      throw new ConflictException(`Equipment with code ${createEquipmentDto.code} already exists`);
    }

    if (createEquipmentDto.factoryId) {
      const factoryExists = await this.prisma.client.factory.findUnique({
        where: { id: createEquipmentDto.factoryId },
      });

      if (!factoryExists) {
        throw new NotFoundException(`Factory with ID ${createEquipmentDto.factoryId} not found`);
      }
    }

    const data: any = { ...createEquipmentDto };

    // Safety check: if image is an object/empty from body, but file exists, prioritze file path
    if (file) {
      data.image = await this.saveEquipmentImage(file);
    } else {
      if (typeof data.image === 'string') {
        if (
          data.image.includes('[object Object]') ||
          data.image === 'undefined' ||
          data.image === 'null'
        ) {
          data.image = undefined;
        }
      } else {
        data.image = undefined;
      }
    }

    // Generate QR Code
    data.qrCode = await this.qrService.generateQrCode(data.code);

    return this.prisma.client.equipment.create({
      data: data as any,
    });
  }

  async findAll(query: EquipmentQueryDto) {
    const { skip, take, sortBy, sortOrder, search, factoryId, factoryCode, status } = query;

    const where: Prisma.EquipmentWhereInput = {
      ...(factoryId ? { factoryId: { in: factoryId } } : {}),
      ...(factoryCode ? { factory: { code: { in: factoryCode } } } : {}),
      ...(status ? { status: { in: status } } : {}),
    };

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { origin: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.client.equipment.findMany({
        where,
        skip,
        take,
        orderBy: {
          [sortBy || 'createdAt']: sortOrder || 'desc',
        },
        include: {
          factory: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.client.equipment.count({ where }),
    ]);

    return {
      data: data.map((item) => ({
        ...item,
        factoryName: item.factory?.name,
      })),
      meta: {
        total,
        page: query.page || 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const equipment = await this.prisma.client.equipment.findUnique({
      where: { id },
      include: {
        factory: true,
        documents: true,
      },
    });

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    return equipment;
  }

  async findOneByCode(code: string) {
    const equipment = await this.prisma.client.equipment.findUnique({
      where: { code },
      include: {
        factory: true,
        documents: true,
      },
    });

    if (!equipment) {
      throw new NotFoundException(`Equipment with code ${code} not found`);
    }

    return equipment;
  }

  async update(id: string, updateEquipmentDto: UpdateEquipmentDto, file?: Express.Multer.File) {
    const equipment = await this.prisma.client.equipment.findUnique({
      where: { id },
    });

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    if (updateEquipmentDto.code) {
      const existing = await this.prisma.client.equipment.findFirst({
        where: {
          code: updateEquipmentDto.code,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Equipment with code ${updateEquipmentDto.code} already exists`,
        );
      }
    }

    const data: any = { ...updateEquipmentDto };

    // Safety check: prioritze physical file over anything in the body's image field
    if (file) {
      data.image = await this.saveEquipmentImage(file);
    } else {
      if (typeof data.image === 'string') {
        if (
          data.image.includes('[object Object]') ||
          data.image === 'undefined' ||
          data.image === 'null'
        ) {
          data.image = undefined;
        }
      } else if (typeof data.image === 'object' && data.image !== null) {
        data.image = undefined;
      }
    }

    // If code changes, regenerate QR code
    if (updateEquipmentDto.code && updateEquipmentDto.code !== equipment.code) {
      // Delete old QR code file
      await this.qrService.deleteQrCode(equipment.code);
      // Generate new QR code
      data.qrCode = await this.qrService.generateQrCode(updateEquipmentDto.code);
    }

    return this.prisma.client.equipment.update({
      where: { id },
      data: data as any,
    });
  }

  async remove(id: string) {
    const equipment = await this.prisma.client.equipment.findUnique({
      where: { id },
      include: { documents: true },
    });

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    // Delete Assets (Image & QR)
    await this.removeEquipmentAssets(equipment);

    await this.prisma.client.equipment.delete({
      where: { id },
    });

    return { message: 'Equipment deleted successfully' };
  }

  async removeMany(ids: string[]) {
    // 1. Get all equipments to get their image/code before deletion
    const equipments = await this.prisma.client.equipment.findMany({
      where: { id: { in: ids } },
      select: { id: true, code: true, image: true, documents: { select: { path: true } } },
    });

    if (equipments.length === 0) {
      return { message: 'No equipments found to delete', count: 0 };
    }

    // 2. Use transaction for DB deletion
    const result = await this.prisma.client.$transaction([
      this.prisma.client.equipment.deleteMany({
        where: { id: { in: ids } },
      }),
    ]);

    // 3. Cleanup files in background (don't block response)
    // We use allSettled to ensure all cleanup attempts finish regardless of individual errors
    Promise.allSettled(equipments.map((eq) => this.removeEquipmentAssets(eq))).then((results) => {
      const failedCount = results.filter((r) => r.status === 'rejected').length;
      if (failedCount > 0) {
        console.error(`Bulk cleanup finished with ${failedCount} failures`);
      }
    });

    return {
      message: `Successfully deleted ${result[0].count} equipments`,
      count: result[0].count,
    };
  }

  async getStats() {
    const [totalEquipments, statusCounts] = await Promise.all([
      this.prisma.client.equipment.count(),
      this.prisma.client.equipment.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),
    ]);

    const stats = {
      totalEquipments,
      active: 0,
      maintenance: 0,
      inactive: 0,
    };

    statusCounts.forEach((item) => {
      if (item.status === EquipmentStatus.ACTIVE) stats.active = item._count.status;
      if (item.status === EquipmentStatus.MAINTENANCE) stats.maintenance = item._count.status;
      if (item.status === EquipmentStatus.INACTIVE) stats.inactive = item._count.status;
    });

    return stats;
  }
}
