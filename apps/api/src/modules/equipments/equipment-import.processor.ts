import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { QUEUE_NAMES } from '@/common/constants';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '@/database/prisma.service';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { EquipmentStatus } from '@prisma/generated/prisma';
import * as sharp from 'sharp';

import { EquipmentsQrService } from './equipments.qr.service';

interface RowData {
  index: number;
  data: any;
  dto: CreateEquipmentDto;
}

@Processor(QUEUE_NAMES.EXCEL_IMPORT)
export class EquipmentImportProcessor extends WorkerHost {
  private readonly logger = new Logger(EquipmentImportProcessor.name);
  private readonly UPLOAD_DIR = './uploads/images/equipments';
  private readonly ERROR_DIR = './uploads/imports/errors';

  constructor(
    private readonly prisma: PrismaService,
    private readonly qrService: EquipmentsQrService,
  ) {
    super();
    this.ensureDirectories();
  }

  private ensureDirectories() {
    [this.UPLOAD_DIR, this.ERROR_DIR].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { filePath, importHistoryId } = job.data;
    this.logger.log(`🔍 [Import] Xử lý Job: ${job.id} | History ID: ${importHistoryId}`);

    try {
      await this.updateHistoryStatus(importHistoryId, 'PROCESSING');

      if (!fs.existsSync(filePath)) throw new Error('Không tìm thấy file upload');

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) throw new Error('Không tìm thấy Worksheet dữ liệu');

      // 1. Phân tích dữ liệu và Validation cơ bản
      const { rows, rowErrors, recordCount } = await this.parseAndValidateRows(worksheet, job);

      // 2. Kiểm tra tính duy nhất (Uniqueness)
      if (rows.length > 0) {
        await this.checkUniqueness(rows, rowErrors);
      }

      // 3. Xử lý kết quả
      let errorFileUrl = null;
      let successCount = 0;

      if (rowErrors.size > 0) {
        errorFileUrl = await this.handleImportFailure(
          workbook,
          worksheet,
          rowErrors,
          importHistoryId,
        );
      } else {
        // 3. Resolve Factory Codes to IDs
        await this.resolveFactoryIds(rows, rowErrors);

        if (rowErrors.size > 0) {
          errorFileUrl = await this.handleImportFailure(
            workbook,
            worksheet,
            rowErrors,
            importHistoryId,
          );
        } else {
          // 4. Chỉ xử lý ảnh khi dữ liệu hoàn toàn hợp lệ
          await this.processImages(workbook, worksheet, rows);
          successCount = await this.handleImportSuccess(rows);
        }
      }

      // 4. Hoàn tất
      await this.finalizeImport(
        importHistoryId,
        recordCount,
        successCount,
        rowErrors.size,
        errorFileUrl,
      );

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await job.updateProgress(100);

      return { success: rowErrors.size === 0 };
    } catch (err) {
      await this.handleGlobalError(importHistoryId, filePath, err);
      throw err;
    }
  }

  private async parseAndValidateRows(worksheet: ExcelJS.Worksheet, job: Job) {
    const rows: RowData[] = [];
    const rowErrors = new Map<number, string>();
    const totalRows = worksheet.rowCount;
    let recordCount = 0;

    for (let i = 2; i <= totalRows; i++) {
      const row = worksheet.getRow(i);
      if (!row || row.actualCellCount === 0) continue;

      recordCount++;
      const rowData = this.mapRowToData(row);
      const dtoInstance = plainToInstance(CreateEquipmentDto, rowData);
      const errors = await validate(dtoInstance);

      if (errors.length > 0) {
        rowErrors.set(i, this.formatValidationErrors(errors));
      } else {
        rows.push({ index: i, data: rowData, dto: dtoInstance });
      }

      if (i % 20 === 0) {
        await job.updateProgress(10 + Math.round((i / totalRows) * 40));
      }
    }

    return { rows, rowErrors, recordCount };
  }

  private mapRowToData(row: ExcelJS.Row): any {
    const statusRaw = row.getCell(5).text?.toUpperCase()?.trim();
    const quantityRaw = row.getCell(6).value;
    const modelYearRaw = row.getCell(9).value;
    const urlImageUrl = row.getCell(11).text?.trim();

    return {
      code: row.getCell(1).text?.trim(),
      name: row.getCell(2).text?.trim(),
      category: row.getCell(3).text?.trim(),
      status: (['ACTIVE', 'MAINTENANCE', 'INACTIVE'].includes(statusRaw)
        ? statusRaw
        : 'ACTIVE') as EquipmentStatus,
      quantity: Number(quantityRaw) || 1,
      brand: row.getCell(7).text?.trim() || undefined,
      origin: row.getCell(8).text?.trim() || undefined,
      modelYear: modelYearRaw ? Number(modelYearRaw) : undefined,
      dimension: row.getCell(10).text?.trim() || undefined,
      image: urlImageUrl?.startsWith('http') ? urlImageUrl : undefined,
      factoryCode: row.getCell(4).text?.trim()?.toUpperCase() || undefined,
    };
  }

  private async resolveFactoryIds(rows: RowData[], rowErrors: Map<number, string>) {
    const factoryCodes = new Set<string>();
    rows.forEach((row) => {
      if ((row.data as any).factoryCode) {
        factoryCodes.add((row.data as any).factoryCode);
      }
    });

    if (factoryCodes.size === 0) return;

    // Bulk lookup factories
    const factories =
      (await this.prisma.client.factory.findMany({
        where: { code: { in: Array.from(factoryCodes), mode: 'insensitive' } },
        select: { id: true, code: true },
      })) || [];

    const factoryMap = new Map(factories.map((f) => [f.code.toUpperCase(), f.id]));

    // Assign IDs back to DTOs
    rows.forEach((row) => {
      const code = (row.data as any).factoryCode;
      if (code) {
        const id = factoryMap.get(code);
        if (id) {
          row.dto.factoryId = id;
        } else {
          rowErrors.set(row.index, `Không tìm thấy nhà máy với mã '${code}'`);
        }
      }
    });
  }

  private async checkUniqueness(rows: RowData[], rowErrors: Map<number, string>) {
    const codesInFile = new Set<string>();
    const codesToCheck = rows.map((r) => r.dto.code);

    // Kiểm tra trùng lặp trong file
    rows.forEach((row) => {
      if (codesInFile.has(row.dto.code)) {
        rowErrors.set(row.index, `Mã thiết bị '${row.dto.code}' bị trùng lặp trong file`);
      }
      codesInFile.add(row.dto.code);
    });

    // Kiểm tra trùng lặp trong DB
    const existingEquipments = await this.prisma.client.equipment.findMany({
      where: { code: { in: codesToCheck } },
      select: { code: true },
    });

    const dbCodes = new Set((existingEquipments || []).map((e) => e.code));
    rows.forEach((row) => {
      if (dbCodes.has(row.dto.code)) {
        rowErrors.set(row.index, `Mã thiết bị '${row.dto.code}' đã tồn tại trong hệ thống`);
      }
    });

    // Loại bỏ các rows bị lỗi uniqueness
    // Lưu ý: Chúng ta không cần xóa rows ở đây vì handleImportFailure sẽ dùng rowErrors để lọc
  }

  private async processImages(
    workbook: ExcelJS.Workbook,
    worksheet: ExcelJS.Worksheet,
    rows: RowData[],
  ) {
    const images = worksheet.getImages();
    if (images.length === 0) return;

    const rowImageMap = new Map<number, string>();

    for (const image of images) {
      try {
        const rowIndex = image.range.tl.nativeRow + 1;
        const media = workbook.model.media.find((m: any) => m.index === Number(image.imageId));

        if (media && media.buffer) {
          const fileName = `${Date.now()}_${uuidv4()}.webp`;
          const savePath = path.join(this.UPLOAD_DIR, fileName);

          // Nén ảnh bằng Sharp
          await sharp(media.buffer)
            .resize({ width: 1000, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(savePath);

          rowImageMap.set(rowIndex, `/uploads/images/equipments/${fileName}`);
        }
      } catch (e) {
        this.logger.warn(`Lỗi xử lý ảnh tại dòng ${image.range.tl.nativeRow + 1}: ${e.message}`);
      }
    }

    // Gán ảnh vào DTO tương ứng
    rows.forEach((row) => {
      if (rowImageMap.has(row.index)) {
        row.dto.image = rowImageMap.get(row.index);
      }
    });
  }

  private async handleImportSuccess(rows: RowData[]) {
    // Generate QR codes and clean up non-model fields
    const dataToInsert = rows.map((r) => {
      const dto = { ...r.dto } as any;
      // Remove temporary fields used for processing but not in DB
      delete dto.factoryCode;
      return dto;
    });

    for (const data of dataToInsert) {
      data.qrCode = await this.qrService.generateQrCode(data.code);
    }

    const result = await this.prisma.client.equipment.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });
    return result.count;
  }

  private async handleImportFailure(
    workbook: ExcelJS.Workbook,
    worksheet: ExcelJS.Worksheet,
    rowErrors: Map<number, string>,
    importHistoryId: string,
  ) {
    const history = await this.prisma.client.importHistory.findUnique({
      where: { id: importHistoryId },
    });
    const originalName = history?.fileName || 'import';
    const baseName = path.parse(originalName).name;

    const headerRow = worksheet.getRow(1);
    const errorColIndex = worksheet.actualColumnCount + 1;

    headerRow.getCell(errorColIndex).value = 'Lỗi Dữ Liệu';
    headerRow.getCell(errorColIndex).font = { bold: true, color: { argb: 'FFFF0000' } };

    rowErrors.forEach((msg, rowIdx) => {
      const cell = worksheet.getRow(rowIdx).getCell(errorColIndex);
      cell.value = msg;
      cell.font = { color: { argb: 'FFFF0000' } };
    });

    const errorFileName = `${this.sanitizeFilename(baseName)}_errors_${Date.now()}.xlsx`;
    const errorFilePath = path.join(this.ERROR_DIR, errorFileName);
    await workbook.xlsx.writeFile(errorFilePath);

    return `/api/uploads/imports/errors/${errorFileName}`;
  }

  private async finalizeImport(
    id: string,
    total: number,
    success: number,
    failed: number,
    errorUrl: string | null,
  ) {
    if (!id) return;
    await this.prisma.client.importHistory.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        totalRecords: total,
        processedRecords: total,
        successCount: success,
        failedCount: failed,
        errorFileUrl: errorUrl,
        finishedAt: new Date(),
      },
    });
  }

  private async updateHistoryStatus(id: string, status: any) {
    if (!id) return;
    await this.prisma.client.importHistory.update({
      where: { id },
      data: { status, startedAt: status === 'PROCESSING' ? new Date() : undefined },
    });
  }

  private async handleGlobalError(id: string, filePath: string, err: Error) {
    this.logger.error(`💥 Lỗi Import: ${err.message}`);
    if (id) {
      await this.prisma.client.importHistory.update({
        where: { id },
        data: { status: 'FAILED', finishedAt: new Date() },
      });
    }
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private formatValidationErrors(errors: ValidationError[]): string {
    return errors
      .map((err) =>
        err.constraints
          ? Object.values(err.constraints).join(', ')
          : this.formatValidationErrors(err.children || []),
      )
      .join(' | ');
  }
}
