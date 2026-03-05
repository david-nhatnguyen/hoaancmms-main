import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsArray, MinLength } from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "technician01" })
  @IsString()
  @IsNotEmpty({ message: "Tên đăng nhập không được để trống" })
  username: string;

  @ApiProperty({ example: "SecurePass123" })
  @IsString()
  @MinLength(6, { message: "Mật khẩu tối thiểu 6 ký tự" })
  password: string;

  @ApiProperty({ example: "Nguyễn Văn An" })
  @IsString()
  @IsNotEmpty({ message: "Họ và tên không được để trống" })
  fullName: string;

  @ApiPropertyOptional({ example: "an.nguyen@company.com" })
  @IsEmail({}, { message: "Email không hợp lệ" })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: "0901234567" })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: "Role UUID" })
  @IsString()
  @IsOptional()
  roleId?: string;

  @ApiPropertyOptional({
    description: 'Factory IDs the user can access. Use ["all"] for all factories.',
    example: ["factory-uuid-1"],
  })
  @IsArray()
  @IsOptional()
  factoryIds?: string[];

  @ApiPropertyOptional({ example: "Ghi chú thêm" })
  @IsString()
  @IsOptional()
  notes?: string;
}
