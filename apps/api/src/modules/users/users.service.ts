import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';

/**
 * UsersService - Full CRUD + Role assignment + Lock/Unlock
 *
 * Password hashing: bcrypt with salt rounds = 10
 * Status: ACTIVE | LOCKED
 * Role: optional FK to roles table
 * Factories: string[] (array of factory IDs, or ["all"])
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly prisma: PrismaService) {}

  /** List users with pagination and filters */
  async findAll(query: UserQueryDto) {
    const { skip, take, search, status, roleId, factoryId } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (roleId) where.roleId = roleId;
    if (factoryId) {
      // User has this factoryId OR has "all" access
      where.OR = [
        ...(where.OR ?? []),
        { factoryIds: { has: factoryId } },
        { factoryIds: { has: 'all' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.client.user.findMany({
        where,
        skip,
        take,
        include: { role: { select: { id: true, name: true } } },
        orderBy: { fullName: 'asc' },
      }),
      this.prisma.client.user.count({ where }),
    ]);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return {
      data: users.map(this.transformUser),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + take < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  /** Find one by ID */
  async findOne(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) throw new NotFoundException(`Không tìm thấy người dùng với ID: ${id}`);
    return this.transformUser(user);
  }

  /**
   * Search users for autocomplete (lightweight)
   */
  async search(query: string = '') {
    const where: any = query.trim()
      ? {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { fullName: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {};

    return this.prisma.client.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        fullName: true,
        role: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  /** Create user with hashed password */
  async create(dto: CreateUserDto) {
    // Check username uniqueness
    const existingUsername = await this.prisma.client.user.findUnique({
      where: { username: dto.username },
    });
    if (existingUsername) throw new ConflictException(`Tên đăng nhập "${dto.username}" đã tồn tại`);

    // Check email uniqueness if provided
    if (dto.email) {
      const existingEmail = await this.prisma.client.user.findUnique({
        where: { email: dto.email },
      });
      if (existingEmail) throw new ConflictException(`Email "${dto.email}" đã được sử dụng`);
    }

    // Validate roleId if provided
    if (dto.roleId) {
      const role = await this.prisma.client.role.findUnique({ where: { id: dto.roleId } });
      if (!role) throw new BadRequestException(`Vai trò không hợp lệ`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = await this.prisma.client.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        roleId: dto.roleId ?? null,
        factoryIds: dto.factoryIds ?? [],
        notes: dto.notes,
        forcePasswordChange: true, // Force password change on first login
      },
      include: { role: true },
    });

    this.logger.log(`Created user: ${user.username}`);
    return this.transformUser(user);
  }

  /** Update user (all fields optional, password hashed if provided) */
  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id); // Ensure exists

    // Check username uniqueness
    if (dto.username) {
      const conflict = await this.prisma.client.user.findFirst({
        where: { username: dto.username, NOT: { id } },
      });
      if (conflict) throw new ConflictException(`Tên đăng nhập "${dto.username}" đã tồn tại`);
    }

    // Check email uniqueness
    if (dto.email) {
      const conflict = await this.prisma.client.user.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (conflict) throw new ConflictException(`Email "${dto.email}" đã được sử dụng`);
    }

    // Validate roleId
    if (dto.roleId) {
      const role = await this.prisma.client.role.findUnique({ where: { id: dto.roleId } });
      if (!role) throw new BadRequestException(`Vai trò không hợp lệ`);
    }

    const data: any = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    } else {
      delete data.password;
    }

    const user = await this.prisma.client.user.update({
      where: { id },
      data,
      include: { role: true },
    });

    this.logger.log(`Updated user: ${user.username}`);
    return this.transformUser(user);
  }

  /** Lock user account */
  async lock(id: string) {
    await this.findOne(id);
    const user = await this.prisma.client.user.update({
      where: { id },
      data: { status: 'LOCKED' },
      include: { role: true },
    });
    this.logger.log(`Locked user: ${user.username}`);
    return this.transformUser(user);
  }

  /** Unlock user account */
  async unlock(id: string) {
    await this.findOne(id);
    const user = await this.prisma.client.user.update({
      where: { id },
      data: { status: 'ACTIVE' },
      include: { role: true },
    });
    this.logger.log(`Unlocked user: ${user.username}`);
    return this.transformUser(user);
  }

  /** Assign role to user */
  async assignRole(userId: string, roleId: string | null) {
    await this.findOne(userId);
    if (roleId) {
      const role = await this.prisma.client.role.findUnique({ where: { id: roleId } });
      if (!role) throw new BadRequestException('Vai trò không hợp lệ');
    }
    const user = await this.prisma.client.user.update({
      where: { id: userId },
      data: { roleId },
      include: { role: true },
    });
    return this.transformUser(user);
  }

  /** Reset password (admin action) */
  async resetPassword(id: string, newPassword: string) {
    await this.findOne(id);
    const hashed = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    const user = await this.prisma.client.user.update({
      where: { id },
      data: { password: hashed, forcePasswordChange: true },
      include: { role: true },
    });
    this.logger.log(`Reset password for user: ${user.username}`);
    return { message: 'Đặt lại mật khẩu thành công' };
  }

  /** Get user stats */
  async getStats() {
    const [total, active, locked] = await Promise.all([
      this.prisma.client.user.count(),
      this.prisma.client.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.client.user.count({ where: { status: 'LOCKED' } }),
    ]);
    return { total, active, locked };
  }

  /** Delete user (hard delete – use carefully) */
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.client.user.delete({ where: { id } });
    this.logger.log(`Deleted user: ${id}`);
    return { message: 'Xóa người dùng thành công' };
  }

  private transformUser(user: any) {
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      status: user.status,
      roleId: user.roleId,
      roleName: user.role?.name ?? null,
      factoryIds: user.factoryIds ?? [],
      notes: user.notes,
      forcePasswordChange: user.forcePasswordChange,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
