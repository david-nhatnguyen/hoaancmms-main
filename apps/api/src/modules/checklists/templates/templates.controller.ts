import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto, QueryTemplateDto } from './dto';

// Vietnamese cycle labels shown in the dropdown — must match CYCLE_MAP in the processor
const CYCLE_OPTIONS = [
  'Hằng ngày',
  'Hằng tuần',
  'Hằng tháng',
  'Hàng quý',
  '6 tháng/lần',
  'Hằng năm',
];

@ApiTags('Checklist Templates')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('checklist-templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  // ──────────────────────────────────────────────────────────────────────────
  // Import endpoints (must be before /:id routes so Express doesn't eat them)
  // ──────────────────────────────────────────────────────────────────────────

  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './uploads/imports',
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  @ApiOperation({ summary: 'Import checklist templates from Excel file' })
  @ApiResponse({ status: 202, description: 'Import job started successfully.' })
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng upload file Excel');
    }
    if (!file.originalname.match(/\.(xlsx|xls)$/i)) {
      throw new BadRequestException('Chỉ chấp nhận file Excel (.xlsx, .xls)');
    }
    return this.templatesService.importExcel(file.path);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Template download
  // ──────────────────────────────────────────────────────────────────────────

  @Get('import/template')
  @ApiOperation({ summary: 'Download checklist import template (Excel)' })
  async downloadTemplate(@Res() res: Response) {
    const workbook = new ExcelJS.Workbook();

    // Two demo sheets — each sheet = one checklist template
    const sheet1Items = [
      [
        '1',
        'Vệ sinh tủ điện',
        'Không có bụi bẩn, dầu mỡ',
        'Quan sát',
        'Vệ sinh bằng khí nén',
        'Sạch sẽ',
        'YES',
        'NO',
      ],
      [
        '2',
        'Kiểm tra dầu bôi trơn',
        'Mức dầu đạt yêu cầu',
        'Đo lường',
        'Kiểm tra và bổ sung dầu',
        'Đủ mức dầu',
        'YES',
        'YES',
      ],
      [
        '3',
        'Kiểm tra bu lông siết chặt',
        'Không bị lỏng',
        'Dùng cờ lê',
        'Siết chặt toàn bộ bu lông',
        'Chặt đúng moment',
        'NO',
        'NO',
      ],
    ];
    const sheet2Items = [
      [
        '1',
        'Kiểm tra áp suất hệ thống',
        'Áp suất trong phạm vi cho phép',
        'Đồng hồ áp suất',
        'Đọc giá trị đồng hồ',
        '8–12 bar',
        'YES',
        'YES',
      ],
      [
        '2',
        'Kiểm tra nhiệt độ vận hành',
        '≤ 80°C',
        'Đầu đo nhiệt',
        'Đo tại vị trí ổ trục',
        '< 80°C',
        'YES',
        'NO',
      ],
    ];

    this.buildSheet(
      workbook,
      'Checklist 1 - CNC',
      'EQ-001',
      'Hằng tháng',
      'Bộ phận sản xuất',
      sheet1Items,
    );
    this.buildSheet(
      workbook,
      'Checklist 2 - Máy bơm',
      'EQ-002',
      '6 tháng/lần',
      'Bộ phận kỹ thuật',
      sheet2Items,
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=checklist_import_template.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Builds one worksheet for a checklist template.
   * Layout:
   *   Row 1: Tên checklist                   | <value>
   *   Row 2: Bộ phận sử dụng                | <value>
   *   Row 3: Thiết bị áp dụng (Mã thiết bị) | <equipment code>
   *   Row 4: Chu kỳ bảo dưỡng               | <Vietnamese dropdown>
   *   Row 5: [section header — blue bar]
   *   Row 6: [column headers]
   *   Row 7+: item data rows
   */
  private buildSheet(
    workbook: ExcelJS.Workbook,
    sheetName: string,
    equipmentCode: string,
    cycleLabel: string,
    department: string,
    sampleItems: string[][],
  ) {
    const sheet = workbook.addWorksheet(sheetName);

    // ── Column widths ─────────────────────────────────────────────────────
    sheet.getColumn(1).width = 36;
    sheet.getColumn(2).width = 45;
    sheet.getColumn(3).width = 35;
    sheet.getColumn(4).width = 30;
    sheet.getColumn(5).width = 38;
    sheet.getColumn(6).width = 28;
    sheet.getColumn(7).width = 18;
    sheet.getColumn(8).width = 18;
    sheet.getColumn(9).width = 38; // col I — fixed error column

    // ── Shared styles ─────────────────────────────────────────────────────
    const labelFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9EAD3' },
    };
    const sectionFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    const headerFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDAE8FC' },
    };
    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    const styleRow = (
      rowNum: number,
      fill: ExcelJS.Fill,
      bold: boolean,
      white: boolean,
      colCount: number,
      height = 22,
    ) => {
      const row = sheet.getRow(rowNum);
      for (let c = 1; c <= colCount; c++) {
        const cell = row.getCell(c);
        cell.fill = fill;
        cell.font = { bold, size: 11, color: white ? { argb: 'FFFFFFFF' } : undefined };
        cell.border = thinBorder;
        cell.alignment = { vertical: 'middle', wrapText: true };
      }
      row.height = height;
    };

    // ── Rows 1–4: Metadata ────────────────────────────────────────────────
    const metaLabels = [
      'Tên checklist *',
      'Bộ phận sử dụng',
      'Thiết bị áp dụng (Mã thiết bị) *',
      'Chu kỳ bảo dưỡng *',
    ];
    const metaValues = [sheetName, department, equipmentCode, cycleLabel];

    metaLabels.forEach((label, i) => {
      const rowNum = i + 1;
      const row = sheet.getRow(rowNum);
      row.getCell(1).value = label;
      row.getCell(2).value = metaValues[i];
      styleRow(rowNum, labelFill, true, false, 2, 24);
      for (let c = 3; c <= 8; c++) row.getCell(c).border = { ...thinBorder };
    });

    // ── Row 4 col B: Vietnamese dropdown for cycle ────────────────────────
    sheet.getRow(4).getCell(2).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [`"${CYCLE_OPTIONS.join(',')}"`],
      showErrorMessage: true,
      errorTitle: 'Giá trị không hợp lệ',
      error: `Vui lòng chọn: ${CYCLE_OPTIONS.join(', ')}`,
    };

    // ── Row 5: Section header ─────────────────────────────────────────────
    sheet.mergeCells('A5:H5');
    sheet.getRow(5).getCell(1).value = 'Danh sách hạng mục kiểm tra';
    styleRow(5, sectionFill, true, true, 8, 26);

    // ── Row 6: Column headers ─────────────────────────────────────────────
    const colHeaders = [
      'STT',
      'Hạng mục bảo dưỡng *',
      'Tiêu chuẩn phán định *',
      'Phương pháp kiểm tra *',
      'Nội dung chi tiết bảo dưỡng *',
      'Kết quả mong đợi *',
      'Bắt buộc (YES/NO)',
      'Yêu cầu ảnh (YES/NO)',
    ];
    const headerRow = sheet.getRow(6);
    colHeaders.forEach((h, i) => {
      headerRow.getCell(i + 1).value = h;
    });
    styleRow(6, headerFill, true, false, 8, 24);

    // ── Rows 7+: Sample data ──────────────────────────────────────────────
    sampleItems.forEach((itemData, idx) => {
      const rowNum = 7 + idx;
      const row = sheet.getRow(rowNum);
      itemData.forEach((val, colIdx) => {
        const cell = row.getCell(colIdx + 1);
        cell.value = val;
        cell.border = thinBorder;
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
      // Zebra striping
      if (idx % 2 === 1) {
        for (let c = 1; c <= 8; c++) {
          row.getCell(c).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' },
          };
        }
      }
      row.height = 20;
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Import status
  // ──────────────────────────────────────────────────────────────────────────

  @Get('import/:id')
  @ApiOperation({ summary: 'Get checklist import job status' })
  @ApiResponse({ status: 200, description: 'Returns the import job status' })
  async getImportStatus(@Param('id') id: string) {
    return this.templatesService.getImportStatus(id);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CRUD
  // ──────────────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a new checklist template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 409, description: 'Template code already exists' })
  create(@Body() createTemplateDto: CreateTemplateDto) {
    return this.templatesService.create(createTemplateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all checklist templates with filtering' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  findAll(@Query() query: QueryTemplateDto) {
    return this.templatesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a checklist template by ID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a checklist template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  update(@Param('id') id: string, @Body() updateTemplateDto: UpdateTemplateDto) {
    return this.templatesService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a checklist template' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete active template' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate a checklist template' })
  @ApiResponse({ status: 200, description: 'Template activated successfully' })
  @ApiResponse({ status: 400, description: 'Template already active' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  activate(@Param('id') id: string) {
    return this.templatesService.activate(id);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a checklist template' })
  @ApiResponse({ status: 200, description: 'Template deactivated successfully' })
  @ApiResponse({ status: 400, description: 'Template not active' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  deactivate(@Param('id') id: string) {
    return this.templatesService.deactivate(id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate a checklist template' })
  @ApiResponse({ status: 201, description: 'Template duplicated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  duplicate(@Param('id') id: string) {
    return this.templatesService.duplicate(id);
  }
}
