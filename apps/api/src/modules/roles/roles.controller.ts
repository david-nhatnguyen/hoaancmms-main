import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { RolesService } from "./roles.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { Public } from "@common/decorators/public.decorator";
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from "class-validator";

export class CreateModuleDto {
  @IsString() @IsNotEmpty() id: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsOptional() description?: string;
  @IsInt() @Min(0) @IsOptional() sortOrder?: number;
}

export class UpdateModuleDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() description?: string;
  @IsInt() @Min(0) @IsOptional() sortOrder?: number;
}

/**
 * Roles Controller
 *
 * Endpoints:
 * - GET    /api/roles               - List all roles
 * - GET    /api/roles/stats         - Role statistics
 * - GET    /api/roles/modules       - Available permission modules
 * - GET    /api/roles/:id           - Get single role
 * - GET    /api/roles/:id/users     - Users in this role
 * - POST   /api/roles               - Create role
 * - PATCH  /api/roles/:id           - Update role (name/desc/permissions)
 * - PATCH  /api/roles/:id/permissions - Replace permissions only
 * - DELETE /api/roles/:id           - Delete role (non-system only)
 */
@ApiTags("roles")
@Controller("roles")
@Public()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get("stats")
  @ApiOperation({ summary: "Get role statistics" })
  getStats() {
    return this.rolesService.getStats();
  }

  @Get("modules")
  @ApiOperation({ summary: "Get all permission modules" })
  getModules() {
    return this.rolesService.getModules();
  }

  @Post("modules")
  @ApiOperation({ summary: "Create a permission module" })
  @ApiResponse({ status: 201, description: "Module created" })
  @ApiResponse({ status: 409, description: "ID conflict" })
  createModule(@Body() dto: CreateModuleDto) {
    return this.rolesService.createModule(dto);
  }

  @Patch("modules/:moduleId")
  @ApiOperation({ summary: "Update a permission module" })
  @ApiParam({ name: "moduleId", description: "Module ID string (e.g. asset)" })
  updateModule(@Param("moduleId") moduleId: string, @Body() dto: UpdateModuleDto) {
    return this.rolesService.updateModule(moduleId, dto);
  }

  @Delete("modules/:moduleId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a permission module (blocked if in use)" })
  @ApiParam({ name: "moduleId", description: "Module ID string" })
  removeModule(@Param("moduleId") moduleId: string) {
    return this.rolesService.removeModule(moduleId);
  }

  @Get()
  @ApiOperation({ summary: "List all roles with permissions and user count" })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get role by ID" })
  @ApiParam({ name: "id", description: "Role UUID" })
  findOne(@Param("id") id: string) {
    return this.rolesService.findOne(id);
  }

  @Get(":id/users")
  @ApiOperation({ summary: "Get users belonging to this role" })
  @ApiParam({ name: "id", description: "Role UUID" })
  getRoleUsers(@Param("id") id: string) {
    return this.rolesService.getRoleUsers(id);
  }

  @Post()
  @ApiOperation({ summary: "Create new role" })
  @ApiResponse({ status: 201, description: "Role created" })
  @ApiResponse({ status: 409, description: "Name conflict" })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update role name, description and permissions" })
  update(@Param("id") id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Patch(":id/permissions")
  @ApiOperation({ summary: "Replace all permissions for a role" })
  updatePermissions(@Param("id") id: string, @Body() body: { permissions: any[] }) {
    return this.rolesService.updatePermissions(id, body.permissions);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete role (non-system only)" })
  @ApiResponse({ status: 400, description: "Cannot delete system role" })
  remove(@Param("id") id: string) {
    return this.rolesService.remove(id);
  }
}
