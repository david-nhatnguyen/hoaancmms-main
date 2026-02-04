import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
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
        description: 'Filter by factory status',
        enum: FactoryStatus,
        example: FactoryStatus.ACTIVE,
    })
    @IsEnum(FactoryStatus, { message: 'Trạng thái không hợp lệ' })
    @IsOptional()
    status?: FactoryStatus;

    @ApiPropertyOptional({
        description: 'Search by factory code or name',
        example: 'Nhà máy A',
    })
    @IsString()
    @IsOptional()
    search?: string;
}
