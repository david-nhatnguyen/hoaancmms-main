import { IsOptional, IsEnum, IsString, IsInt, Min, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ChecklistCycle, ChecklistStatus } from '@prisma/generated/prisma';

export class QueryTemplateDto {
  @ApiPropertyOptional({ enum: ChecklistStatus, isArray: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',');
    return value;
  })
  @IsEnum(ChecklistStatus, { each: true })
  status?: ChecklistStatus[];

  @ApiPropertyOptional({ enum: ChecklistCycle, isArray: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',');
    return value;
  })
  @IsEnum(ChecklistCycle, { each: true })
  cycle?: ChecklistCycle[];

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Lọc theo thiết bị',
  })
  @IsOptional()
  @IsUUID('4')
  equipmentId?: string;



  @ApiPropertyOptional({ example: 'injection' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'createdAt', description: 'Trường sắp xếp' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
