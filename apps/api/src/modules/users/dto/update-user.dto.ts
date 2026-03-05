import { OmitType, PartialType, ApiPropertyOptional } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import { IsOptional, IsString } from "class-validator";

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ["password"] as const)) {
  @ApiPropertyOptional({ example: "NewSecurePass456" })
  @IsString()
  @IsOptional()
  password?: string; // Optional for update
}
