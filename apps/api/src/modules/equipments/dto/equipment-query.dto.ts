import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EquipmentStatus } from '@prisma/generated/prisma';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class EquipmentQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  factoryId?: string;

  @ApiPropertyOptional()
  @ApiPropertyOptional({ enum: EquipmentStatus, isArray: true })
  @IsOptional()
  @IsEnum(EquipmentStatus, { each: true })
  status?: EquipmentStatus[];

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  get skip(): number {
    return ((this.page || 1) - 1) * (this.limit || 20);
  }

  get take(): number {
    return this.limit || 20;
  }
}
