import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { EquipmentsService } from './equipments.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { EquipmentQueryDto } from './dto/equipment-query.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Equipments')
@ApiBearerAuth()
@Public() // Skip authentication for now as requested
@UseGuards(JwtAuthGuard)
@Controller('equipments')
export class EquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './uploads/imports',
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  @ApiOperation({ summary: 'Import equipments from Excel file' })
  @ApiResponse({ status: 202, description: 'Import job started successfully.' })
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    // Basic validation
    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      throw new BadRequestException('Only Excel files are allowed');
    }
    return this.equipmentsService.importExcel(file.path);
  }

  @Get('import/template')
  @ApiOperation({ summary: 'Download equipment import template' })
  async downloadTemplate(@Res() res: Response) {
    // Generate a simple template on the fly using ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Equipments');

    // Headers
    worksheet.columns = [
      { header: 'Mã thiết bị *', key: 'code', width: 15 },
      { header: 'Tên thiết bị *', key: 'name', width: 30 },
      { header: 'Loại thiết bị *', key: 'category', width: 20 },
      { header: 'Nhà máy', key: 'factory', width: 20 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Số lượng', key: 'quantity', width: 10 },
      { header: 'Thương hiệu', key: 'brand', width: 20 },
      { header: 'Xuất xứ', key: 'origin', width: 20 },
      { header: 'Năm sản xuất', key: 'modelYear', width: 15 },
      { header: 'Kích thước', key: 'dimension', width: 20 },
      { header: 'Hình ảnh', key: 'image', width: 30 },
    ];

    // Sample Row
    worksheet.addRow({
      code: 'EQ-001',
      name: 'Máy phay CNC Doosan',
      category: 'Máy phay',
      factory: 'Nhà máy A',
      status: 'ACTIVE',
      quantity: 1,
      brand: 'Doosan',
      origin: 'Hàn Quốc',
      modelYear: 2024,
      dimension: '1200 x 800 x 1500',
      image: '',
    });

    // Description Row (Optional, maybe in a README sheet)

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=equipment_import_template.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }

  @Get('import/:id')
  @ApiOperation({ summary: 'Get import job status' })
  @ApiResponse({ status: 200, description: 'Return job status' })
  async getImportStatus(@Param('id') id: string) {
    return this.equipmentsService.getImportStatus(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Create a new equipment' })
  @ApiResponse({ status: 201, description: 'The equipment has been successfully created.' })
  create(
    @Body() createEquipmentDto: CreateEquipmentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.equipmentsService.create(createEquipmentDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve a list of equipments' })
  @ApiResponse({ status: 200, description: 'List of equipments retrieved successfully.' })
  findAll(@Query() query: EquipmentQueryDto) {
    return this.equipmentsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get equipment statistics' })
  @ApiResponse({ status: 200, description: 'Equipment statistics retrieved successfully.' })
  getStats() {
    return this.equipmentsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific equipment by ID' })
  @ApiResponse({ status: 200, description: 'Equipment details retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Equipment not found.' })
  findOne(@Param('id') id: string) {
    return this.equipmentsService.findOne(id);
  }

  @Get('by-code/:code')
  @ApiOperation({ summary: 'Retrieve a specific equipment by code' })
  @ApiResponse({ status: 200, description: 'Equipment details retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Equipment not found.' })
  findOneByCode(@Param('code') code: string) {
    return this.equipmentsService.findOneByCode(code);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update an equipment' })
  @ApiResponse({ status: 200, description: 'The equipment has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Equipment not found.' })
  update(
    @Param('id') id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.equipmentsService.update(id, updateEquipmentDto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an equipment' })
  @ApiResponse({ status: 200, description: 'The equipment has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Equipment not found.' })
  remove(@Param('id') id: string) {
    return this.equipmentsService.remove(id);
  }

  @Post(':id/documents')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  @ApiOperation({ summary: 'Upload a document for an equipment' })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully.' })
  async uploadDocument(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.equipmentsService.uploadDocument(id, file);
  }

  @Delete('documents/:docId')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully.' })
  async deleteDocument(@Param('docId') docId: string) {
    return this.equipmentsService.deleteDocument(docId);
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Delete multiple equipments' })
  @ApiResponse({ status: 200, description: 'Equipments have been successfully deleted.' })
  bulkDelete(@Body() bulkDeleteDto: { ids: string[] }) {
    return this.equipmentsService.removeMany(bulkDeleteDto.ids);
  }
}
