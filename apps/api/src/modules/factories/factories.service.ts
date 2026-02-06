import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateFactoryDto } from './dto/create-factory.dto';
import { UpdateFactoryDto } from './dto/update-factory.dto';
import { FactoryQueryDto } from './dto/factory-query.dto';
import { FactoryStatus } from '@prisma/generated/prisma';

/**
 * Factories Service
 *
 * Responsibilities:
 * - CRUD operations for factories
 * - Transform database models to match frontend expectations
 * - Handle business logic (uniqueness, validation)
 * - Compute equipmentCount via Prisma _count
 *
 * Why transform response?
 * - Database stores status as ENUM: 'ACTIVE' | 'INACTIVE'
 * - Frontend expects lowercase: 'active' | 'inactive'
 * - Frontend expects equipmentCount field (computed from relation)
 *
 * Performance considerations:
 * - Use _count instead of loading all equipments
 * - Single query with JOIN for list
 * - Parallel queries for total count (Promise.all)
 */
@Injectable()
export class FactoriesService {
  private readonly logger = new Logger(FactoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all factories with pagination and filters
   *
   * Query optimization:
   * - Use Promise.all for parallel execution
   * - _count for equipment count (no data loaded)
   * - Case-insensitive search with Prisma mode
   */
  async findAll(query: FactoryQueryDto) {
    const { skip, take, sortBy, sortOrder, status, search, fromDate, toDate } = query;

    // Build where clause
    const where: any = {};

    // Filter by status (multi-select)
    if (status && Array.isArray(status) && status.length > 0) {
      where.status = { in: status };
    } else if (status) {
      // Fallback for single value not in array (should be handled by DTO transform but safe to keep)
      where.status = status;
    }

    // Filter by date range
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }, // Added location search as per requirement
      ];
    }

    // Parallel queries for better performance
    const [factories, total] = await Promise.all([
      this.prisma.client.factory.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { equipments: true },
          },
        },
      }),
      this.prisma.client.factory.count({ where }),
    ]);

    this.logger.log(`Found ${factories.length} factories (total: ${total}, page: ${query.page})`);

    return {
      data: factories.map(this.transformFactory),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: skip + take < total,
        hasPreviousPage: query.page > 1,
      },
    };
  }

  /**
   * Find one factory by ID
   */
  async findOne(id: string) {
    const factory = await this.prisma.client.factory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { equipments: true },
        },
      },
    });

    if (!factory) {
      throw new NotFoundException(`Không tìm thấy nhà máy với ID: ${id}`);
    }

    this.logger.log(`Found factory: ${factory.code} - ${factory.name}`);
    return this.transformFactory(factory);
  }

  /**
   * Create new factory
   *
   * Business rules:
   * - Code must be unique
   * - Default status is ACTIVE
   * - equipmentCount starts at 0
   */
  async create(dto: CreateFactoryDto) {
    // Check code uniqueness
    const existing = await this.prisma.client.factory.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`Mã nhà máy ${dto.code} đã tồn tại. Vui lòng sử dụng mã khác.`);
    }

    const factory = await this.prisma.client.factory.create({
      data: {
        code: dto.code,
        name: dto.name,
        location: dto.location,
        status: dto.status || FactoryStatus.ACTIVE,
      },
      include: {
        _count: {
          select: { equipments: true },
        },
      },
    });

    this.logger.log(`Created factory: ${factory.code} - ${factory.name}`);
    return this.transformFactory(factory);
  }

  /**
   * Update factory
   *
   * Business rules:
   * - Can update code, but must remain unique
   * - Can update status (active/inactive)
   * - Can update name and location
   */
  async update(id: string, dto: UpdateFactoryDto) {
    // Check if factory exists
    await this.findOne(id);

    // If code is being updated, check uniqueness
    if (dto.code) {
      const existing = await this.prisma.client.factory.findFirst({
        where: {
          code: dto.code,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(`Mã nhà máy ${dto.code} đã tồn tại. Vui lòng sử dụng mã khác.`);
      }
    }

    const factory = await this.prisma.client.factory.update({
      where: { id },
      data: dto,
      include: {
        _count: {
          select: { equipments: true },
        },
      },
    });

    this.logger.log(`Updated factory: ${factory.code} - ${factory.name}`);
    return this.transformFactory(factory);
  }

  /**
   * Delete factory
   *
   * Note: This will CASCADE delete all equipments!
   * Consider soft delete if you need to preserve history.
   */
  async remove(id: string) {
    // Check if factory exists
    const factory = await this.findOne(id);

    // Check if factory has equipments
    if (factory.equipmentCount > 0) {
      throw new ConflictException(
        `Không thể xóa nhà máy ${factory.code} vì còn ${factory.equipmentCount} thiết bị. Vui lòng xóa hoặc chuyển thiết bị trước.`,
      );
    }

    await this.prisma.client.factory.delete({
      where: { id },
    });

    this.logger.log(`Deleted factory: ${factory.code} - ${factory.name}`);
    return { message: 'Xóa nhà máy thành công' };
  }

  /**
   * Get dashboard stats
   *
   * Returns:
   * - Total factories
   * - Active factories
   * - Total equipment count
   */
  async getStats() {
    const [total, active, totalEquipment] = await Promise.all([
      this.prisma.client.factory.count(),
      this.prisma.client.factory.count({ where: { status: FactoryStatus.ACTIVE } }),
      this.prisma.client.equipment.count(),
    ]);

    return {
      totalFactories: total,
      activeFactories: active,
      totalEquipment,
    };
  }

  /**
   * Transform database model to frontend format
   *
   * Transformations:
   * - status: ACTIVE -> active, INACTIVE -> inactive
   * - Add equipmentCount from _count.equipments
   * - Remove _count from response
   */
  private transformFactory(factory: any) {
    return {
      id: factory.id,
      code: factory.code,
      name: factory.name,
      location: factory.location,
      equipmentCount: factory._count?.equipments || 0,
      status: factory.status.toLowerCase(), // ACTIVE -> active
      createdAt: factory.createdAt,
      updatedAt: factory.updatedAt,
    };
  }
}
