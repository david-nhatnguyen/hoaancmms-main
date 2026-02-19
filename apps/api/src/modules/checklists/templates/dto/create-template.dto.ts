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
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChecklistCycle, ChecklistStatus } from '@prisma/generated/prisma';

export class CreateTemplateItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  order: number;

  @ApiProperty({ example: 'Vệ sinh tủ điện' })
  @IsString()
  @IsNotEmpty({ message: 'Hạng mục bảo dưỡng không được để trống' })
  maintenanceTask: string;

  @ApiProperty({ example: 'Không có bụi bẩn, dầu mỡ' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu chuẩn phán định không được để trống' })
  judgmentStandard: string;

  @ApiProperty({ example: 'Quan sát' })
  @IsString()
  @IsNotEmpty({ message: 'Phương pháp kiểm tra không được để trống' })
  inspectionMethod: string;

  @ApiProperty({ example: 'Vệ sinh tủ điện bằng khí nén' })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung chi tiết bảo dưỡng không được để trống' })
  maintenanceContent: string;

  @ApiProperty({ example: 'Sạch sẽ' })
  @IsString()
  @IsNotEmpty({ message: 'Kết quả mong đợi không được để trống' })
  expectedResult: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  requiresImage?: boolean;
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

  // NEW: Department (OPTIONAL)
  @ApiPropertyOptional({
    example: 'Bộ phận sản xuất',
    description: 'Bộ phận sử dụng xác nhận',
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({ enum: ChecklistCycle, example: ChecklistCycle.SEMI_ANNUALLY })
  @IsEnum(ChecklistCycle, { message: 'Chu kỳ không hợp lệ' })
  cycle: ChecklistCycle;

  @ApiPropertyOptional({ enum: ChecklistStatus, default: ChecklistStatus.ACTIVE })
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
