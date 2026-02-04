import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, Matches } from 'class-validator';
import { FactoryStatus } from '@prisma/generated/prisma';

/**
 * Create Factory DTO
 * 
 * Why validate code format?
 * - Frontend expects format: F01, F02, F03...
 * - Regex ensures consistency
 * - Prevents invalid codes like "ABC" or "123"
 * 
 * Why make location optional?
 * - Frontend allows empty location
 * - Not all factories have specific address yet
 * 
 * Why default status to ACTIVE?
 * - New factories are always active
 * - Matches frontend behavior
 */
export class CreateFactoryDto {
    @ApiProperty({
        description: 'Factory code',
        example: 'F01',
    })
    @IsString()
    @IsNotEmpty({ message: 'Mã nhà máy không được để trống' })
    code: string;

    @ApiProperty({
        description: 'Factory name',
        example: 'Nhà máy A',
    })
    @IsString()
    @IsNotEmpty({ message: 'Tên nhà máy không được để trống' })
    name: string;

    @ApiPropertyOptional({
        description: 'Factory location/address',
        example: 'Bình Dương',
    })
    @IsString()
    @IsOptional()
    location?: string;

    @ApiPropertyOptional({
        description: 'Factory status',
        enum: FactoryStatus,
        default: FactoryStatus.ACTIVE,
    })
    @IsEnum(FactoryStatus, { message: 'Trạng thái không hợp lệ' })
    @IsOptional()
    status?: FactoryStatus;
}
