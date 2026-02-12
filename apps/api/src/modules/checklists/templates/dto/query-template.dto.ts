import { IsOptional, IsEnum, IsString, IsInt, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ChecklistCycle, ChecklistStatus } from '@prisma/generated/prisma';

export class QueryTemplateDto {
  @ApiPropertyOptional({ enum: ChecklistStatus })
  @IsOptional()
  @IsEnum(ChecklistStatus)
  status?: ChecklistStatus;

  @ApiPropertyOptional({ enum: ChecklistCycle })
  @IsOptional()
  @IsEnum(ChecklistCycle)
  cycle?: ChecklistCycle;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Lọc theo thiết bị',
  })
  @IsOptional()
  @IsUUID('4')
  equipmentId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'Lọc theo người phụ trách',
  })
  @IsOptional()
  @IsUUID('4')
  assignedUserId?: string;

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
}
