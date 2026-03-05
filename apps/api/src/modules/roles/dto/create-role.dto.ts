import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from "class-validator";

export class PermissionDto {
  @ApiProperty({ example: "asset" })
  @IsString()
  @IsNotEmpty()
  moduleId: string;

  @ApiPropertyOptional({ default: false }) @IsBoolean() @IsOptional() canView?: boolean;
  @ApiPropertyOptional({ default: false }) @IsBoolean() @IsOptional() canCreate?: boolean;
  @ApiPropertyOptional({ default: false }) @IsBoolean() @IsOptional() canEdit?: boolean;
  @ApiPropertyOptional({ default: false }) @IsBoolean() @IsOptional() canDelete?: boolean;
  @ApiPropertyOptional({ default: false }) @IsBoolean() @IsOptional() canExport?: boolean;
  @ApiPropertyOptional({ default: false }) @IsBoolean() @IsOptional() canApprove?: boolean;
  @ApiPropertyOptional({ default: false }) @IsBoolean() @IsOptional() canLock?: boolean;
}

export class CreateRoleDto {
  @ApiProperty({ example: "Kỹ thuật viên" })
  @IsString()
  @IsNotEmpty({ message: "Tên vai trò không được để trống" })
  name: string;

  @ApiPropertyOptional({ example: "Thực hiện công việc bảo trì" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [PermissionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  @IsOptional()
  permissions?: PermissionDto[];
}
