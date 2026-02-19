import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { QUEUE_NAMES } from '@/common/constants';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '@/database/prisma.service';
import { ChecklistCycle, ChecklistStatus } from '@prisma/generated/prisma';

// ─────────────────────────────────────────────────────────────────────────────
// Column constants
// ─────────────────────────────────────────────────────────────────────────────

/** Column C (index 3) — error column for metadata rows 1–4 */
const META_ERROR_COL = 3;

/** Column I (index 9) — error column for item rows 7+ */
const ITEM_ERROR_COL = 9;

// ─────────────────────────────────────────────────────────────────────────────
// Internal Types
// ─────────────────────────────────────────────────────────────────────────────

interface ParsedItem {
  order: number;
  maintenanceTask: string;
  judgmentStandard: string;
  inspectionMethod: string;
  maintenanceContent: string;
  expectedResult: string;
  isRequired: boolean;
  requiresImage: boolean;
}

/** Per-row error for item rows: rowNumber → error message */
type ItemErrorMap = Map<number, string>;

/** Per-row error for metadata rows: rowNumber → error message */
type MetadataErrorMap = Map<number, string>;

interface ParsedTemplate {
  sheetName: string;
  /** Metadata validation errors (row number → message) */
  metadataErrors: MetadataErrorMap;
  name: string;
  description?: string;
  equipmentCode: string;
  equipmentId?: string;
  department?: string;
  cycle: ChecklistCycle;
  status: ChecklistStatus;
  notes?: string;
  items: ParsedItem[];
  /** Per-item-row validation errors (row number → message) */
  itemErrors: ItemErrorMap;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cycle mapping — Vietnamese labels ↔ enum
// ─────────────────────────────────────────────────────────────────────────────

const CYCLE_MAP: Record<string, ChecklistCycle> = {
  DAILY: ChecklistCycle.DAILY,
  WEEKLY: ChecklistCycle.WEEKLY,
  MONTHLY: ChecklistCycle.MONTHLY,
  QUARTERLY: ChecklistCycle.QUARTERLY,
  SEMI_ANNUALLY: ChecklistCycle.SEMI_ANNUALLY,
  YEARLY: ChecklistCycle.YEARLY,
  'HẰNG NGÀY': ChecklistCycle.DAILY,
  'HẰNG TUẦN': ChecklistCycle.WEEKLY,
  'HẰNG THÁNG': ChecklistCycle.MONTHLY,
  'HÀNG QUÝ': ChecklistCycle.QUARTERLY,
  '6 THÁNG/LẦN': ChecklistCycle.SEMI_ANNUALLY,
  'HẰNG NĂM': ChecklistCycle.YEARLY,
};

// ─────────────────────────────────────────────────────────────────────────────
// Processor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ChecklistImportProcessor
 *
 * Multi-sheet format: each worksheet = one checklist template.
 * Validates ALL fields in ALL sheets (no early exit).
 */
@Processor(QUEUE_NAMES.CHECKLIST_IMPORT)
export class ChecklistImportProcessor extends WorkerHost {
  private readonly logger = new Logger(ChecklistImportProcessor.name);
  private readonly ERROR_DIR = './uploads/imports/errors';

  constructor(private readonly prisma: PrismaService) {
    super();
    this.ensureDirectories();
  }

  private ensureDirectories() {
    if (!fs.existsSync(this.ERROR_DIR)) {
      fs.mkdirSync(this.ERROR_DIR, { recursive: true });
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Main Entry Point
  // ──────────────────────────────────────────────────────────────────────────

  async process(job: Job<any, any, string>): Promise<any> {
    const { filePath, importHistoryId } = job.data;
    this.logger.log(`🔍 [Checklist Import] Job: ${job.id} | History: ${importHistoryId}`);

    try {
      await this.updateStatus(importHistoryId, 'PROCESSING');

      if (!fs.existsSync(filePath)) {
        throw new Error('Không tìm thấy file upload');
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      if (workbook.worksheets.length === 0) {
        throw new Error('File không có sheet dữ liệu nào');
      }

      await job.updateProgress(10);

      // 1. Parse every sheet → one ParsedTemplate per sheet
      const templates: ParsedTemplate[] = [];
      for (const sheet of workbook.worksheets) {
        templates.push(this.parseSheet(sheet));
      }

      const recordCount = templates.length;
      await job.updateProgress(30);

      // 2. Resolve equipment codes → IDs (adds errors to metadataErrors if not found)
      await this.resolveEquipmentIds(templates);
      await job.updateProgress(60);

      // 3. Insert ONLY fully valid sheets
      const fullyValid = templates.filter(
        (t) => t.metadataErrors.size === 0 && t.equipmentId && t.itemErrors.size === 0,
      );
      let successCount = 0;
      if (fullyValid.length > 0) {
        successCount = await this.insertTemplates(fullyValid);
      }

      await job.updateProgress(90);

      // 4. Build error report if ANY errors exist anywhere
      const hasErrors = templates.some((t) => t.metadataErrors.size > 0 || t.itemErrors.size > 0);

      let errorFileUrl: string | null = null;
      if (hasErrors) {
        errorFileUrl = await this.buildErrorReport(workbook, templates, importHistoryId);
      }

      const failedCount = templates.filter(
        (t) => t.metadataErrors.size > 0 || t.itemErrors.size > 0,
      ).length;

      // 5. Finalize
      await this.finalizeImport(
        importHistoryId,
        recordCount,
        successCount,
        failedCount,
        errorFileUrl,
      );

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await job.updateProgress(100);

      return { success: failedCount === 0 };
    } catch (err) {
      await this.handleGlobalError(importHistoryId, filePath, err);
      throw err;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Parsing
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Parse one worksheet into a ParsedTemplate.
   * DOES NOT stop on errors. Collects ALL errors.
   */
  private parseSheet(sheet: ExcelJS.Worksheet): ParsedTemplate {
    const getCellB = (rowNum: number) => sheet.getRow(rowNum).getCell(2).text?.trim() ?? '';

    const name = getCellB(1);
    const department = getCellB(2) || undefined;
    const equipmentCode = getCellB(3)?.toUpperCase();
    const cycleRaw = getCellB(4)?.toUpperCase().trim();

    const metadataErrors: MetadataErrorMap = new Map();

    // ── Metadata validation ────────────────────────────────────────────────
    if (!name) {
      metadataErrors.set(1, 'Tên checklist không được để trống');
    }

    if (!equipmentCode) {
      metadataErrors.set(3, 'Thiết bị áp dụng không được để trống');
    }

    const cycle = this.parseCycle(cycleRaw);
    if (!cycle) {
      metadataErrors.set(
        4,
        `Chu kỳ bảo dưỡng không hợp lệ: "${getCellB(4)}". Chọn: Hằng ngày / Hằng tuần / Hằng tháng / Hàng quý / 6 tháng/lần / Hằng năm`,
      );
    }

    const base: ParsedTemplate = {
      sheetName: sheet.name,
      name: name || sheet.name,
      equipmentCode: equipmentCode ?? '',
      department,
      cycle: cycle ?? ChecklistCycle.MONTHLY, // Default to avoid null, error already recorded
      status: ChecklistStatus.ACTIVE,
      items: [],
      itemErrors: new Map(),
      metadataErrors,
    };

    // ── Parse items (rows 7+) ──────────────────────────────────────────────
    const items: ParsedItem[] = [];
    const itemErrors: ItemErrorMap = new Map();
    const totalRows = sheet.rowCount;

    for (let i = 7; i <= totalRows; i++) {
      const row = sheet.getRow(i);
      if (!row) continue;

      // Data row detection: ANY cell A-H has content
      const cellValues = Array.from({ length: 8 }, (_, c) => row.getCell(c + 1).text?.trim());
      const hasAnyData = cellValues.some((v) => v);
      if (!hasAnyData) continue;

      const maintenanceTask = cellValues[1]; // col B
      const judgmentStandard = cellValues[2]; // col C
      const inspectionMethod = cellValues[3]; // col D
      const maintenanceContent = cellValues[4]; // col E
      const expectedResult = cellValues[5]; // col F

      // ── Per-field required checks ────────────────────────────────────────
      const fieldErrors: string[] = [];
      if (!maintenanceTask) fieldErrors.push('Không được bỏ trống "Hạng mục bảo dưỡng"');
      if (!judgmentStandard) fieldErrors.push('Không được bỏ trống "Tiêu chuẩn phán định"');
      if (!inspectionMethod) fieldErrors.push('Không được bỏ trống "Phương pháp kiểm tra"');
      if (!maintenanceContent)
        fieldErrors.push('Không được bỏ trống "Nội dung chi tiết bảo dưỡng"');
      if (!expectedResult) fieldErrors.push('Không được bỏ trống "Kết quả mong đợi"');

      if (fieldErrors.length > 0) {
        itemErrors.set(i, fieldErrors.join('\n'));
        continue;
      }

      const orderRaw = row.getCell(1).value;
      items.push({
        order: Number(orderRaw) || items.length + 1,
        maintenanceTask: maintenanceTask!,
        judgmentStandard: judgmentStandard!,
        inspectionMethod: inspectionMethod!,
        maintenanceContent: maintenanceContent!,
        expectedResult: expectedResult!,
        isRequired: ['YES', '1', 'TRUE', 'CÓ'].includes(
          row.getCell(7).text?.trim()?.toUpperCase() ?? '',
        ),
        requiresImage: ['YES', '1', 'TRUE', 'CÓ'].includes(
          row.getCell(8).text?.trim()?.toUpperCase() ?? '',
        ),
      });
    }

    // ── "At least 1 item" validation ───────────────────────────────────────
    // Check if we have no items AND no item errors
    if (items.length === 0 && itemErrors.size === 0) {
      metadataErrors.set(
        5,
        `"Dánh sách hạng mục kiểm tra" không được để trống, phải có ít nhất 1 hạng mục`,
      );
    }

    return { ...base, items, itemErrors };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Resolution
  // ──────────────────────────────────────────────────────────────────────────

  private async resolveEquipmentIds(templates: ParsedTemplate[]) {
    // Only verify templates that HAVE an equipment code (even if other valid errors exist, we still check validity of code)
    const needsResolution = templates.filter((t) => !!t.equipmentCode);
    if (needsResolution.length === 0) return;

    const codes = [...new Set(needsResolution.map((t) => t.equipmentCode))];
    const equipments = await this.prisma.equipment.findMany({
      where: { code: { in: codes, mode: 'insensitive' } },
      select: { id: true, code: true },
    });

    const equipmentMap = new Map(equipments.map((e) => [e.code.toUpperCase(), e.id]));

    needsResolution.forEach((t) => {
      const id = equipmentMap.get(t.equipmentCode.toUpperCase());
      if (id) {
        t.equipmentId = id;
      } else {
        // Only add error if "Code missing" error doesn't already exist for row 3
        if (!t.metadataErrors.has(3)) {
          t.metadataErrors.set(3, `Không tìm thấy thiết bị với mã '${t.equipmentCode}'`);
        }
      }
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Insert
  // ──────────────────────────────────────────────────────────────────────────

  private async insertTemplates(templates: ParsedTemplate[]): Promise<number> {
    let successCount = 0;

    for (const t of templates) {
      if (!t.equipmentId) continue;

      try {
        const code = await this.generateCode(t.equipmentId, t.equipmentCode);

        await this.prisma.checklistTemplate.create({
          data: {
            code,
            name: t.name,
            description: t.description, // undefined in parser currently, but safe
            equipmentId: t.equipmentId,
            department: t.department,
            cycle: t.cycle,
            status: t.status,
            notes: t.notes,
            items: {
              create: t.items,
            },
          },
        });

        successCount++;
      } catch (err) {
        this.logger.warn(`Lỗi tạo checklist "${t.name}": ${err.message}`);
      }
    }

    return successCount;
  }

  private async generateCode(equipmentId: string, equipmentCode: string): Promise<string> {
    const prefix = `CL-${equipmentCode}`;
    const count = await this.prisma.checklistTemplate.count({
      where: { code: { startsWith: prefix } },
    });
    return `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Error Report
  // ──────────────────────────────────────────────────────────────────────────

  private async buildErrorReport(
    workbook: ExcelJS.Workbook,
    templates: ParsedTemplate[],
    importHistoryId: string,
  ): Promise<string> {
    const history = await this.prisma.importHistory.findUnique({
      where: { id: importHistoryId },
    });
    const originalName = history?.fileName ?? 'import';
    const baseName = path.parse(originalName).name;

    const errorFont: Partial<ExcelJS.Font> = { color: { argb: 'FFCC0000' }, italic: true };
    const errorHeaderFont: Partial<ExcelJS.Font> = {
      bold: true,
      color: { argb: 'FFCC0000' },
    };
    const errorFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF0F0' }, // light red tint
    };

    for (const t of templates) {
      const hasMetaError = t.metadataErrors.size > 0;
      const hasItemErrors = t.itemErrors.size > 0;
      if (!hasMetaError && !hasItemErrors) continue;

      const sheet = workbook.getWorksheet(t.sheetName);
      if (!sheet) continue;

      // ── Metadata errors → column C (META_ERROR_COL = 3) ───────────────────
      if (hasMetaError) {
        t.metadataErrors.forEach((msg, rowNum) => {
          const cell = sheet.getRow(rowNum).getCell(META_ERROR_COL);
          cell.value = msg;
          cell.font = errorFont;
          cell.fill = errorFill;
        });
      }

      // ── Item errors → column I (ITEM_ERROR_COL = 9) ─────────────────────
      if (hasItemErrors) {
        // Write "Lỗi" header in row 6 col I (column-header row)
        const headerErrorCell = sheet.getRow(6).getCell(ITEM_ERROR_COL);
        headerErrorCell.value = 'Lỗi';
        headerErrorCell.font = errorHeaderFont;
        headerErrorCell.fill = errorFill;
        headerErrorCell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        headerErrorCell.alignment = { vertical: 'middle', horizontal: 'center' };

        t.itemErrors.forEach((msg, rowNum) => {
          const cell = sheet.getRow(rowNum).getCell(ITEM_ERROR_COL);
          // Each field error is on its own line inside the cell
          cell.value = msg;
          cell.font = errorFont;
          cell.fill = errorFill;
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
          // wrapText so each "Không được bỏ trống…" line is visible
          cell.alignment = { vertical: 'top', wrapText: true };
          // Auto-height: ~18px per line
          const lineCount = msg.split('\n').length;
          const row = sheet.getRow(rowNum);
          row.height = Math.max(row.height ?? 20, lineCount * 18);
        });
      }
    }

    const errorFileName = `${this.sanitize(baseName)}_errors_${Date.now()}.xlsx`;
    const errorFilePath = path.join(this.ERROR_DIR, errorFileName);
    await workbook.xlsx.writeFile(errorFilePath);

    return `/api/uploads/imports/errors/${errorFileName}`;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Status helpers
  // ──────────────────────────────────────────────────────────────────────────

  private async finalizeImport(
    id: string,
    total: number,
    success: number,
    failed: number,
    errorUrl: string | null,
  ) {
    if (!id) return;
    await this.prisma.importHistory.update({
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

  private async updateStatus(id: string, status: string) {
    if (!id) return;
    await this.prisma.importHistory.update({
      where: { id },
      data: {
        status: status as any,
        startedAt: status === 'PROCESSING' ? new Date() : undefined,
      },
    });
  }

  private async handleGlobalError(id: string, filePath: string, err: Error) {
    this.logger.error(`💥 [Checklist Import] Lỗi: ${err.message}`, err.stack);
    if (id) {
      await this.prisma.importHistory.update({
        where: { id },
        data: { status: 'FAILED', finishedAt: new Date() },
      });
    }
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Utility
  // ──────────────────────────────────────────────────────────────────────────

  private parseCycle(raw?: string): ChecklistCycle | null {
    if (!raw) return null;
    return CYCLE_MAP[raw] ?? null;
  }

  private sanitize(filename: string): string {
    return filename
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
