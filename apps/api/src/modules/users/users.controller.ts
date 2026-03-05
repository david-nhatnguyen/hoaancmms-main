import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserQueryDto } from "./dto/user-query.dto";
import { Public } from "@/common/decorators/public.decorator";

/**
 * Users Controller
 *
 * Endpoints:
 * - GET    /api/users               - List users (paginated)
 * - GET    /api/users/stats         - User statistics
 * - GET    /api/users/search        - Autocomplete search
 * - GET    /api/users/:id           - Get single user
 * - POST   /api/users               - Create user
 * - PATCH  /api/users/:id           - Update user
 * - PATCH  /api/users/:id/lock      - Lock account
 * - PATCH  /api/users/:id/unlock    - Unlock account
 * - PATCH  /api/users/:id/role      - Assign/remove role
 * - POST   /api/users/:id/reset-password - Reset password
 * - DELETE /api/users/:id           - Delete user
 */
@ApiTags("users")
@Controller("users")
@Public()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("stats")
  @ApiOperation({ summary: "Get user statistics" })
  getStats() {
    return this.usersService.getStats();
  }

  @Get("search")
  @ApiOperation({ summary: "Search users for autocomplete" })
  @ApiQuery({ name: "q", required: false })
  search(@Query("q") query: string) {
    return this.usersService.search(query);
  }

  @Get()
  @ApiOperation({ summary: "List all users with pagination and filters" })
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create new user" })
  @ApiResponse({ status: 201, description: "User created" })
  @ApiResponse({ status: 409, description: "Username or email conflict" })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update user" })
  update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(":id/lock")
  @ApiOperation({ summary: "Lock user account" })
  lock(@Param("id") id: string) {
    return this.usersService.lock(id);
  }

  @Patch(":id/unlock")
  @ApiOperation({ summary: "Unlock user account" })
  unlock(@Param("id") id: string) {
    return this.usersService.unlock(id);
  }

  @Patch(":id/role")
  @ApiOperation({ summary: "Assign or remove role from user" })
  assignRole(@Param("id") id: string, @Body() body: { roleId: string | null }) {
    return this.usersService.assignRole(id, body.roleId);
  }

  @Post(":id/reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset user password (admin action)" })
  resetPassword(@Param("id") id: string, @Body() body: { newPassword: string }) {
    return this.usersService.resetPassword(id, body.newPassword);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete user" })
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
