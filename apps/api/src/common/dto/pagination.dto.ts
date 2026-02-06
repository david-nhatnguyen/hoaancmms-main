import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max } from 'class-validator';

/**
 * Base Pagination DTO
 *
 * Why we need this?
 * - Consistent pagination across all endpoints
 * - Auto-validation with class-validator
 * - Swagger documentation out of the box
 *
 * Usage:
 * class GetFactoriesDto extends PaginationDto {
 *   @IsOptional()
 *   @IsString()
 *   search?: string;
 * }
 */
export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number) // Transform string to number
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Prevent abuse
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
  })
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';

  /**
   * Helper method to calculate skip value for Prisma
   *
   * Why not just use page directly?
   * - Prisma uses skip/take, not page/limit
   * - This encapsulates the calculation logic
   */
  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  /**
   * Helper method for Prisma take value
   */
  get take(): number {
    return this.limit;
  }
}
