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

@Processor(QUEUE_NAMES.EXCEL_IMPORT)
export class EquipmentImportProcessor extends WorkerHost {
  private readonly logger = new Logger(EquipmentImportProcessor.name);
  private readonly UPLOAD_DIR = './uploads/images/equipments';
  private readonly ERROR_DIR = './uploads/imports/errors';

  constructor(private readonly prisma: PrismaService) {
    super();
    // Đảm bảo các thư mục cần thiết tồn tại
    [this.UPLOAD_DIR, this.ERROR_DIR].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Làm sạch và chuẩn hóa tên file (remove accents, lowercase, replace special chars with -)
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .toLowerCase()
      .normalize('NFD') // Tách tổ hợp ký tự có dấu
      .replace(/[\u0300-\u036f]/g, '') // Xoá dấu
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .replace(/[^a-z0-9]/g, '-') // Thay thế ký tự đặc biệt bằng -
      .replace(/-+/g, '-') // Xoá dấu - lặp lại
      .replace(/^-|-$/g, ''); // Xoá dấu - ở đầu và cuối
  }

  /**
   * Định dạng lại các lỗi từ class-validator thành chuỗi text để ghi vào Excel
   */
  private formatValidationErrors(errors: ValidationError[]): string {
    return errors
      .map((err) => {
        if (err.constraints) {
          return Object.values(err.constraints).join(', ');
        }
        if (err.children && err.children.length > 0) {
          return this.formatValidationErrors(err.children);
        }
        return `Dữ liệu tại '${err.property}' không hợp lệ`;
      })
      .join(' | ');
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { filePath, importHistoryId } = job.data;
    this.logger.log(`🔍 [Import] Xử lý Job: ${job.id} | History ID: ${importHistoryId}`);

    // Cập nhật trạng thái sang PROCESSING
    if (importHistoryId) {
      await this.prisma.client.importHistory.update({
        where: { id: importHistoryId },
        data: { status: 'PROCESSING', startedAt: new Date() },
      });
    }

    // Lấy thông tin file gốc để đặt tên cho file báo lỗi nếu cần
    const history = await this.prisma.client.importHistory.findUnique({
      where: { id: importHistoryId },
    });
    const originalName = history?.fileName || 'import';
    const baseName = path.parse(originalName).name;

    // Tiền xử lý giả lập (Simulation) - Giữ 10s để đồng bộ với UI
    const SIMULATION_DURATION = 10;
    for (let i = 0; i < SIMULATION_DURATION; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await job.updateProgress(Math.round(((i + 1) / SIMULATION_DURATION) * 20)); // 20% đầu cho simulation
    }

    try {
      if (!fs.existsSync(filePath)) throw new Error('Không tìm thấy file upload');

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) throw new Error('Không tìm thấy Worksheet dữ liệu');

      // --- BƯỚC 1: TRÍCH XUẤT HÌNH ẢNH NHÚNG (EMBEDDED IMAGES) ---
      const rowImageMap = new Map<number, string>();
      const images = worksheet.getImages();
      for (const image of images) {
        try {
          const rowIndex = image.range.tl.nativeRow + 1;
          const media = workbook.model.media.find((m: any) => m.index === Number(image.imageId));
          if (media) {
            const fileName = `${Date.now()}_${uuidv4()}.${media.extension || 'png'}`;
            const savePath = path.join(this.UPLOAD_DIR, fileName);
            fs.writeFileSync(savePath, Buffer.from(media.buffer));
            rowImageMap.set(rowIndex, `/uploads/images/equipments/${fileName}`);
          }
        } catch (e) {
          this.logger.warn(`Bỏ qua lỗi ảnh dòng ${image.range.tl.nativeRow + 1}`);
        }
      }

      // --- BƯỚC 2: KIỂM TRA DỮ LIỆU (PRE-VALIDATION PHASE) ---
      const validDtos: any[] = [];
      const rowErrors = new Map<number, string>();
      const totalRows = worksheet.rowCount;
      let recordCount = 0;

      for (let i = 2; i <= totalRows; i++) {
        const row = worksheet.getRow(i);
        if (!row || row.actualCellCount === 0) continue; // Bỏ qua dòng trống

        recordCount++;

        // Thu thập dữ liệu theo đúng cột template
        const statusRaw = row.getCell(5).text?.toUpperCase()?.trim();
        const quantityRaw = row.getCell(6).value;
        const modelYearRaw = row.getCell(9).value;
        const urlImageUrl = row.getCell(11).text?.trim();

        const rowData = {
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
          image: rowImageMap.get(i) || (urlImageUrl?.startsWith('http') ? urlImageUrl : undefined),
        };

        // Chạy validate qua DTO
        const dtoInstance = plainToInstance(CreateEquipmentDto, rowData);
        const errors = await validate(dtoInstance);

        if (errors.length > 0) {
          rowErrors.set(i, this.formatValidationErrors(errors));
        } else {
          validDtos.push(rowData);
        }

        // Cập nhật progress BullMQ (20% -> 80%)
        if (i % 20 === 0) {
          await job.updateProgress(20 + Math.round((i / totalRows) * 60));
        }
      }

      // --- BƯỚC 3: XỬ LÝ KẾT QUẢ (ATOMIC MODE) ---
      let errorFileUrl = null;
      let successCount = 0;

      if (rowErrors.size > 0) {
        // CÓ LỖI: Tạo báo cáo và HUỶ ghi DB
        this.logger.error(`🚫 Phát hiện ${rowErrors.size} dòng lỗi. Huỷ ghi DB và tạo báo cáo.`);

        const headerRow = worksheet.getRow(1);
        const errorColIndex = worksheet.actualColumnCount + 1;

        // Header báo lỗi
        const hCell = headerRow.getCell(errorColIndex);
        hCell.value = 'Lỗi Dữ Liệu (Vui lòng kiểm tra)';
        hCell.font = { bold: true, color: { argb: 'FFFF0000' } };
        hCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBD7' } };

        // Ghi lỗi vào từng dòng
        rowErrors.forEach((msg, rowIdx) => {
          const r = worksheet.getRow(rowIdx);
          const c = r.getCell(errorColIndex);
          c.value = msg;
          c.font = { color: { argb: 'FFFF0000' } };
        });

        const sanitizedBase = this.sanitizeFilename(baseName);
        const errorFileName = `${sanitizedBase}_errors_${Date.now()}.xlsx`;
        const errorFilePath = path.join(this.ERROR_DIR, errorFileName);
        await workbook.xlsx.writeFile(errorFilePath);
        errorFileUrl = `/api/uploads/imports/errors/${errorFileName}`;
      } else {
        // KHÔNG LỖI: Ghi DB hàng loạt
        this.logger.log(`✅ Dữ liệu sạch (0 lỗi). Đang lưu ${validDtos.length} bản ghi.`);
        if (validDtos.length > 0) {
          const result = await this.prisma.client.equipment.createMany({
            data: validDtos,
            skipDuplicates: true,
          });
          successCount = result.count;
        }
      }

      // --- BƯỚC 4: CẬP NHẬT KẾT QUẢ CUỐI CÙNG ---
      if (importHistoryId) {
        await this.prisma.client.importHistory.update({
          where: { id: importHistoryId },
          data: {
            status: 'COMPLETED',
            totalRecords: recordCount,
            processedRecords: recordCount,
            successCount: successCount,
            failedCount: rowErrors.size,
            errorFileUrl: errorFileUrl,
            finishedAt: new Date(),
          },
        });
      }

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await job.updateProgress(100);
      return { success: rowErrors.size === 0 };
    } catch (err) {
      this.logger.error(`💥 Lỗi Import: ${err.message}`);
      if (importHistoryId) {
        await this.prisma.client.importHistory.update({
          where: { id: importHistoryId },
          data: { status: 'FAILED', finishedAt: new Date() },
        });
      }
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      throw err;
    }
  }
}
