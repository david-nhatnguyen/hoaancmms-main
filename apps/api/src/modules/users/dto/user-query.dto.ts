import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UserQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'LOCKED'] })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by role ID' })
  @IsString()
  @IsOptional()
  roleId?: string;

  @ApiPropertyOptional({ description: 'Filter by factory ID' })
  @IsString()
  @IsOptional()
  factoryId?: string;

  get skip() {
    return ((this.page ?? 1) - 1) * (this.limit ?? 20);
  }
  get take() {
    return this.limit ?? 20;
  }
}
