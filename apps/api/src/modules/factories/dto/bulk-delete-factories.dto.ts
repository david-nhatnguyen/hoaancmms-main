import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkDeleteFactoriesDto {
  @ApiProperty({ 
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    description: 'Danh sách ID nhà máy cần xóa' 
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Danh sách ID không được để trống' })
  @IsString({ each: true, message: 'ID phải là chuỗi ký tự' })
  ids: string[];
}
