import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Factory Response DTO
 *
 * Why separate response DTO?
 * - Frontend expects lowercase status: 'active' not 'ACTIVE'
 * - Frontend expects equipmentCount field
 * - Swagger documentation clarity
 * - Type safety for API responses
 *
 * This matches the frontend interface exactly:
 * interface Factory {
 *   id: string;
 *   code: string;
 *   name: string;
 *   location: string;
 *   equipmentCount: number;
 *   status: 'active' | 'inactive';
 * }
 */
export class FactoryResponseDto {
  @ApiProperty({
    description: 'Factory UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Factory code',
    example: 'F01',
  })
  code: string;

  @ApiProperty({
    description: 'Factory name',
    example: 'Nhà máy A',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Factory location',
    example: 'Bình Dương',
  })
  location?: string;

  @ApiProperty({
    description: 'Number of equipments in this factory',
    example: 12,
  })
  equipmentCount: number;

  @ApiProperty({
    description: 'Factory status (lowercase)',
    enum: ['active', 'inactive'],
    example: 'active',
  })
  status: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
