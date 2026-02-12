import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChecklistCycle, ChecklistStatus } from '@prisma/generated/prisma';

export class CreateTemplateItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  order: number;

  @ApiProperty({ example: 'Vệ sinh' })
  @IsString()
  @IsNotEmpty({ message: 'Hạng mục bảo dưỡng không được để trống' })
  maintenanceTask: string;

  @ApiPropertyOptional({ example: 'Tủ điện không bụi bẩn, dầu mỡ' })
  @IsString()
  @IsOptional()
  judgmentStandard?: string;

  @ApiPropertyOptional({ example: 'Nhìn' })
  @IsString()
  @IsOptional()
  inspectionMethod?: string;

  @ApiPropertyOptional({ example: 'Vệ sinh tủ điện, vệ sinh máy' })
  @IsString()
  @IsOptional()
  maintenanceContent?: string;

  @ApiPropertyOptional({ example: 'OK' })
  @IsString()
  @IsOptional()
  expectedResult?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  requiresImage?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  requiresNote?: boolean;
}

export class CreateTemplateDto {
  @ApiProperty({ example: 'Injection Machine – Bảo dưỡng 6 tháng' })
  @IsString()
  @IsNotEmpty({ message: 'Tên checklist không được để trống' })
  name: string;

  @ApiPropertyOptional({ example: 'Checklist bảo dưỡng định kỳ' })
  @IsString()
  @IsOptional()
  description?: string;

  // NEW: Equipment relationship (REQUIRED)
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID của thiết bị sử dụng checklist này',
  })
  @IsUUID('4', { message: 'Equipment ID không hợp lệ' })
  @IsNotEmpty({ message: 'Equipment ID không được để trống' })
  equipmentId: string;

  // NEW: Assigned User (OPTIONAL)
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'ID của người phụ trách',
  })
  @IsUUID('4', { message: 'User ID không hợp lệ' })
  @IsOptional()
  assignedUserId?: string;

  // NEW: Department (OPTIONAL)
  @ApiPropertyOptional({
    example: 'Bộ phận sản xuất',
    description: 'Bộ phận sử dụng xác nhận',
  })
  @IsString()
  @IsOptional()
  department?: string;

  // NEW: Maintenance Start Date (OPTIONAL)
  @ApiPropertyOptional({
    example: '2026-02-15T00:00:00.000Z',
    description: 'Ngày bắt đầu bảo dưỡng',
  })
  @IsDateString({}, { message: 'Ngày bảo dưỡng không hợp lệ' })
  @IsOptional()
  maintenanceStartDate?: string;

  @ApiProperty({ enum: ChecklistCycle, example: ChecklistCycle.SEMI_ANNUALLY })
  @IsEnum(ChecklistCycle, { message: 'Chu kỳ không hợp lệ' })
  cycle: ChecklistCycle;

  @ApiPropertyOptional({ enum: ChecklistStatus, default: ChecklistStatus.DRAFT })
  @IsEnum(ChecklistStatus, { message: 'Trạng thái không hợp lệ' })
  @IsOptional()
  status?: ChecklistStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [CreateTemplateItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateItemDto)
  items: CreateTemplateItemDto[];
}
