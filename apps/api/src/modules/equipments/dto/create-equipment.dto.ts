import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EquipmentStatus } from '@prisma/generated/prisma';

export class CreateEquipmentDto {
  @ApiProperty({ example: 'EQ-001' })
  @IsString()
  @IsNotEmpty({ message: 'Mã thiết bị không được để trống' })
  code: string;

  @ApiProperty({ example: 'CMM 3D machine' })
  @IsString()
  @IsNotEmpty({ message: 'Tên thiết bị không được để trống' })
  name: string;

  @ApiPropertyOptional({ example: 'factory-1' })
  @IsOptional()
  @IsString()
  factoryId?: string;

  @ApiProperty({ example: 'Microscope' })
  @IsString()
  @IsNotEmpty({ message: 'Chủng loại máy không được để trống' })
  category: string;

  @ApiPropertyOptional({ example: 'Japan' })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ example: 'Mitutoyo' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 2015 })
  @IsOptional()
  @IsNumber({}, { message: 'Năm sản xuất phải là số' })
  @Type(() => Number)
  modelYear?: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString({ message: 'Đường dẫn ảnh không hợp lệ' })
  image?: string;

  @ApiPropertyOptional({ example: '360*360' })
  @IsOptional()
  @IsString({ message: 'Kích thước phải là chuỗi ký tự' })
  dimension?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  @Type(() => Number)
  quantity?: number;

  @ApiPropertyOptional({ enum: EquipmentStatus, default: EquipmentStatus.ACTIVE })
  @IsOptional()
  @IsEnum(EquipmentStatus, { message: 'Trạng thái không hợp lệ' })
  status?: EquipmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
