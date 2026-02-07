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

@Injectable()
export class EquipmentsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.EXCEL_IMPORT) private importQueue: Queue,
  ) {}

  // ... rest of class starts here
  async importExcel(filePath: string) {
    // 1. Calculate Total Records
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    const totalRecords = worksheet && worksheet.rowCount > 1 ? worksheet.rowCount - 1 : 0;

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
    // Updated to mock 60s for testing
    const estimatedDuration = 10000;

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

  async create(createEquipmentDto: CreateEquipmentDto) {
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

    return this.prisma.client.equipment.create({
      data: createEquipmentDto as any,
    });
  }

  async findAll(query: EquipmentQueryDto) {
    const { skip, take, sortBy, sortOrder, search, factoryId, status } = query;

    const where: Prisma.EquipmentWhereInput = {
      ...(factoryId ? { factoryId } : {}),
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
      },
    });

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    return equipment;
  }

  async update(id: string, updateEquipmentDto: UpdateEquipmentDto) {
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

    return this.prisma.client.equipment.update({
      where: { id },
      data: updateEquipmentDto,
    });
  }

  async remove(id: string) {
    const equipment = await this.prisma.client.equipment.findUnique({
      where: { id },
    });

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    await this.prisma.client.equipment.delete({
      where: { id },
    });

    return { message: 'Equipment deleted successfully' };
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
