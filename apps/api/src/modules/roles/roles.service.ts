import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service";
import { CreateRoleDto, PermissionDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

/**
 * RolesService
 *
 * Business logic:
 * - A Role is a named group of permissions per module
 * - System roles cannot be deleted
 * - Permissions are upserted per (roleId × moduleId) combination
 * - User count is computed via _count relation
 */
@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** List all roles with user count and permissions */
  async findAll() {
    const roles = await this.prisma.client.role.findMany({
      include: {
        _count: { select: { users: true } },
        permissions: {
          include: { module: true },
          orderBy: { module: { sortOrder: "asc" } },
        },
      },
      orderBy: [{ isSystem: "desc" }, { createdAt: "asc" }],
    });
    console.log("trigger test");
    return roles.map(this.transformRole);
  }

  /** Get single role by id */
  async findOne(id: string) {
    const role = await this.prisma.client.role.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true } },
        permissions: {
          include: { module: true },
          orderBy: { module: { sortOrder: "asc" } },
        },
      },
    });

    if (!role) throw new NotFoundException(`Không tìm thấy vai trò với ID: ${id}`);
    return this.transformRole(role);
  }

  /** Get all available permission modules */
  async getModules() {
    return this.prisma.client.permissionModule.findMany({
      include: { _count: { select: { permissions: true } } },
      orderBy: { sortOrder: "asc" },
    });
  }

  /** Create a new permission module */
  async createModule(dto: { id: string; name: string; description?: string; sortOrder?: number }) {
    const existing = await this.prisma.client.permissionModule.findUnique({
      where: { id: dto.id },
    });
    if (existing) throw new ConflictException(`Module "${dto.id}" đã tồn tại`);

    // Default sortOrder = max existing + 10
    let sortOrder = dto.sortOrder;
    if (sortOrder === undefined) {
      const max = await this.prisma.client.permissionModule.aggregate({
        _max: { sortOrder: true },
      });
      sortOrder = (max._max.sortOrder ?? 0) + 10;
    }

    const module = await this.prisma.client.permissionModule.create({
      data: { id: dto.id, name: dto.name, description: dto.description, sortOrder },
    });
    this.logger.log(`Created permission module: ${module.id}`);
    return module;
  }

  /** Update a permission module's name, description, or sortOrder */
  async updateModule(id: string, dto: { name?: string; description?: string; sortOrder?: number }) {
    const existing = await this.prisma.client.permissionModule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Không tìm thấy module: ${id}`);

    const module = await this.prisma.client.permissionModule.update({
      where: { id },
      data: { name: dto.name, description: dto.description, sortOrder: dto.sortOrder },
    });
    this.logger.log(`Updated permission module: ${module.id}`);
    return module;
  }

  /** Delete a permission module. Blocked if any role-permission rows reference it. */
  async removeModule(id: string) {
    const existing = await this.prisma.client.permissionModule.findUnique({
      where: { id },
      include: { _count: { select: { permissions: true } } },
    });
    if (!existing) throw new NotFoundException(`Không tìm thấy module: ${id}`);
    if (existing._count.permissions > 0) {
      throw new BadRequestException(
        `Module "${existing.name}" đang được dùng bởi ${existing._count.permissions} vai trò, không thể xóa`,
      );
    }

    await this.prisma.client.permissionModule.delete({ where: { id } });
    this.logger.log(`Deleted permission module: ${id}`);
    return { message: `Đã xóa module "${existing.name}"` };
  }

  /** Create a new role, optionally with initial permissions */
  async create(dto: CreateRoleDto) {
    // Check name uniqueness
    const existing = await this.prisma.client.role.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Vai trò "${dto.name}" đã tồn tại`);

    const role = await this.prisma.client.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        isSystem: false,
        permissions: dto.permissions?.length
          ? {
              create: dto.permissions.map((p) => ({
                moduleId: p.moduleId,
                canView: p.canView ?? false,
                canCreate: p.canCreate ?? false,
                canEdit: p.canEdit ?? false,
                canDelete: p.canDelete ?? false,
                canExport: p.canExport ?? false,
                canApprove: p.canApprove ?? false,
                canLock: p.canLock ?? false,
              })),
            }
          : undefined,
      },
      include: {
        _count: { select: { users: true } },
        permissions: { include: { module: true }, orderBy: { module: { sortOrder: "asc" } } },
      },
    });

    this.logger.log(`Created role: ${role.name}`);
    return this.transformRole(role);
  }

  /**
   * Update role name/description and upsert permissions.
   * System roles: only permissions can be updated (name/desc locked).
   */
  async update(id: string, dto: UpdateRoleDto) {
    const existing = await this.findOne(id);

    // Check name uniqueness if name is changing
    if (dto.name && dto.name !== existing.name) {
      const conflict = await this.prisma.client.role.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (conflict) throw new ConflictException(`Vai trò "${dto.name}" đã tồn tại`);

      if (existing.isSystem) {
        throw new BadRequestException("Không thể đổi tên vai trò hệ thống");
      }
    }

    // Build data object
    const data: any = {};
    if (dto.name && !existing.isSystem) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;

    // Upsert permissions if provided
    if (dto.permissions?.length) {
      data.permissions = {
        deleteMany: {},
        create: dto.permissions.map((p) => ({
          moduleId: p.moduleId,
          canView: p.canView ?? false,
          canCreate: p.canCreate ?? false,
          canEdit: p.canEdit ?? false,
          canDelete: p.canDelete ?? false,
          canExport: p.canExport ?? false,
          canApprove: p.canApprove ?? false,
          canLock: p.canLock ?? false,
        })),
      };
    }

    const role = await this.prisma.client.role.update({
      where: { id },
      data,
      include: {
        _count: { select: { users: true } },
        permissions: { include: { module: true }, orderBy: { module: { sortOrder: "asc" } } },
      },
    });

    this.logger.log(`Updated role: ${role.name}`);
    return this.transformRole(role);
  }

  /** Delete a role (system roles cannot be deleted) */
  async remove(id: string) {
    const role = await this.findOne(id);
    if (role.isSystem) throw new BadRequestException("Không thể xóa vai trò hệ thống");

    await this.prisma.client.role.delete({ where: { id } });
    this.logger.log(`Deleted role: ${role.name}`);
    return { message: "Xóa vai trò thành công" };
  }

  /**
   * Update only the permissions for a role (replaces all permissions).
   * This is the "permission matrix save" action from the UI.
   */
  async updatePermissions(roleId: string, permissions: PermissionDto[]) {
    await this.findOne(roleId); // Ensure exists

    // Replace all in a transaction
    await this.prisma.client.$transaction([
      this.prisma.client.rolePermission.deleteMany({ where: { roleId } }),
      this.prisma.client.rolePermission.createMany({
        data: permissions.map((p) => ({
          roleId,
          moduleId: p.moduleId,
          canView: p.canView ?? false,
          canCreate: p.canCreate ?? false,
          canEdit: p.canEdit ?? false,
          canDelete: p.canDelete ?? false,
          canExport: p.canExport ?? false,
          canApprove: p.canApprove ?? false,
          canLock: p.canLock ?? false,
        })),
      }),
    ]);

    return this.findOne(roleId);
  }

  /** Get users belonging to this role */
  async getRoleUsers(roleId: string) {
    await this.findOne(roleId);
    return this.prisma.client.user.findMany({
      where: { roleId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        status: true,
        lastLoginAt: true,
        factoryIds: true,
      },
      orderBy: { fullName: "asc" },
    });
  }

  /** Get role stats */
  async getStats() {
    const [total, system, custom] = await Promise.all([
      this.prisma.client.role.count(),
      this.prisma.client.role.count({ where: { isSystem: true } }),
      this.prisma.client.role.count({ where: { isSystem: false } }),
    ]);
    return { total, system, custom };
  }

  private transformRole(role: any) {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      userCount: role._count?.users ?? 0,
      permissions: (role.permissions ?? []).map((p: any) => ({
        moduleId: p.moduleId,
        moduleName: p.module?.name ?? p.moduleId,
        moduleDescription: p.module?.description,
        canView: p.canView,
        canCreate: p.canCreate,
        canEdit: p.canEdit,
        canDelete: p.canDelete,
        canExport: p.canExport,
        canApprove: p.canApprove,
        canLock: p.canLock,
      })),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
