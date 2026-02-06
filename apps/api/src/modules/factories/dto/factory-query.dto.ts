import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '@common/dto/pagination.dto';
import { FactoryStatus } from '@prisma/generated/prisma';

/**
 * Factory Query DTO
 *
 * Extends PaginationDto to inherit:
 * - page, limit (with validation)
 * - sortBy, sortOrder
 * - skip, take helpers
 *
 * Additional filters:
 * - status: Filter by ACTIVE/INACTIVE
 * - search: Search in code or name
 *
 * Example queries:
 * GET /api/factories?page=1&limit=10
 * GET /api/factories?status=ACTIVE
 * GET /api/factories?search=Nhà máy A
 * GET /api/factories?status=ACTIVE&search=F01&page=1&limit=20
 *
 * Why case-insensitive search?
 * - User might type "nhà máy" or "Nhà Máy"
 * - Better UX
 */
export class FactoryQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by one or more factory statuses',
    enum: FactoryStatus,
    isArray: true,
    example: [FactoryStatus.ACTIVE],
  })
  @IsOptional()
  @IsEnum(
    { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' },
    { each: true, message: 'Trạng thái không hợp lệ' },
  )
  @Transform(({ value }) => {
    if (!value) return undefined;
    let result = value;
    // Handle comma-separated string
    if (typeof value === 'string') {
      result = value.includes(',') ? value.split(',') : [value];
    }
    // Ensure array
    if (!Array.isArray(result)) {
      result = [result];
    }
    // Trim strings
    return result.map((s: any) => (typeof s === 'string' ? s.trim() : s));
  })
  status?: FactoryStatus[];

  @ApiPropertyOptional({ description: 'Filter from date (ISO string)' })
  @IsOptional()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Filter to date (ISO string)' })
  @IsOptional()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Search by factory code or name',
    example: 'Nhà máy A',
  })
  @IsString()
  @IsOptional()
  search?: string;
}
