import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateTemplateDto, UpdateTemplateDto, QueryTemplateDto } from './dto';
import { ChecklistStatus } from '@prisma/generated/prisma';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new checklist template
   */
  async create(dto: CreateTemplateDto) {
    // Validate equipment exists
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: dto.equipmentId },
    });

    if (!equipment) {
      throw new NotFoundException(`Không tìm thấy thiết bị với ID: ${dto.equipmentId}`);
    }

    // Generate unique code based on equipment code
    const code = await this.generateCode(equipment.code);

    // Check code uniqueness
    const exists = await this.prisma.checklistTemplate.findUnique({
      where: { code },
    });

    if (exists) {
      throw new ConflictException(`Mã checklist ${code} đã tồn tại`);
    }

    // Validate items
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Checklist phải có ít nhất 1 hạng mục');
    }

    // Create template with items
    return this.prisma.checklistTemplate.create({
      data: {
        code,
        name: dto.name,
        description: dto.description,
        equipmentId: dto.equipmentId,
        department: dto.department,

        cycle: dto.cycle,
        status: ChecklistStatus.ACTIVE,
        notes: dto.notes,
        items: {
          create: dto.items,
        },
      },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
        equipment: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
            status: true,
            factory: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find all templates with filtering and pagination
   */
  async findAll(query: QueryTemplateDto) {
    const {
      status,
      cycle,
      equipmentId,

      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: any = {};

    if (status && status.length > 0) {
      where.status = { in: status };
    }
    if (cycle && cycle.length > 0) {
      where.cycle = { in: cycle };
    }
    if (equipmentId) where.equipmentId = equipmentId;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { equipment: { name: { contains: search, mode: 'insensitive' } } },
        { equipment: { code: { contains: search, mode: 'insensitive' } } },
        { equipment: { factory: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    // Handle sorting
    let orderBy: any = { [sortBy]: sortOrder };

    // Handle nested sorting if needed (e.g., equipmentCategory)
    if (sortBy === 'equipmentCategory') {
      orderBy = { equipment: { category: sortOrder } };
    }

    const [data, total] = await Promise.all([
      this.prisma.checklistTemplate.findMany({
        where,
        include: {
          items: {
            orderBy: { order: 'asc' },
          },
          equipment: {
            select: {
              id: true,
              code: true,
              name: true,
              category: true,
              status: true,
              factory: {
                select: {
                  name: true,
                },
              },
            },
          },

          _count: {
            select: {
              equipmentAssignments: true,
              executions: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      this.prisma.checklistTemplate.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find one template by ID
   */
  async findOne(id: string) {
    const template = await this.prisma.checklistTemplate.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
        equipment: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
            status: true,
            brand: true,
            origin: true,
            factoryId: true,
            factory: {
              select: {
                name: true,
              },
            },
          },
        },

        _count: {
          select: {
            equipmentAssignments: true,
            executions: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Không tìm thấy checklist với ID: ${id}`);
    }

    return template;
  }

  /**
   * Update a template
   * If template is ACTIVE, create a new version instead
   */
  async update(id: string, dto: UpdateTemplateDto) {
    const existing = await this.findOne(id);

    // If template is ACTIVE, create new version
    if (existing.status === ChecklistStatus.ACTIVE) {
      return this.createNewVersion(id, dto);
    }

    // Validate equipment if changing
    if (dto.equipmentId && dto.equipmentId !== existing.equipmentId) {
      const equipment = await this.prisma.equipment.findUnique({
        where: { id: dto.equipmentId },
      });

      if (!equipment) {
        throw new NotFoundException(`Không tìm thấy thiết bị với ID: ${dto.equipmentId}`);
      }
    }

    // Validate items if provided
    if (dto.items && dto.items.length === 0) {
      throw new BadRequestException('Checklist phải có ít nhất 1 hạng mục');
    }

    // Delete old items if new items are provided
    if (dto.items) {
      await this.prisma.checklistTemplateItem.deleteMany({
        where: { templateId: id },
      });
    }

    return this.prisma.checklistTemplate.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.equipmentId && { equipmentId: dto.equipmentId }),
        ...(dto.department !== undefined && { department: dto.department }),

        ...(dto.cycle && { cycle: dto.cycle }),
        ...(dto.status && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.items && {
          items: {
            create: dto.items,
          },
        }),
      },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
        equipment: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
            status: true,
            factory: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Delete a template
   */
  async remove(id: string) {
    const template = await this.findOne(id);

    // Cannot delete ACTIVE templates
    if (template.status === ChecklistStatus.ACTIVE) {
      throw new BadRequestException(
        'Không thể xóa checklist đang áp dụng. Vui lòng ngừng sử dụng trước.',
      );
    }

    // Check if template has executions
    const executionCount = await this.prisma.checklistExecution.count({
      where: { templateId: id },
    });

    if (executionCount > 0) {
      throw new BadRequestException('Không thể xóa checklist đã có lịch sử thực hiện');
    }

    await this.prisma.checklistTemplate.delete({
      where: { id },
    });

    return { message: 'Đã xóa checklist thành công' };
  }

  /**
   * Activate a template
   */
  async activate(id: string) {
    const template = await this.findOne(id);

    if (template.status === ChecklistStatus.ACTIVE) {
      throw new BadRequestException('Checklist đã được áp dụng');
    }

    return this.prisma.checklistTemplate.update({
      where: { id },
      data: { status: ChecklistStatus.ACTIVE },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
        equipment: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
            status: true,
            factory: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Deactivate a template
   */
  async deactivate(id: string) {
    const template = await this.findOne(id);

    if (template.status !== ChecklistStatus.ACTIVE) {
      throw new BadRequestException('Chỉ có thể ngừng sử dụng checklist đang áp dụng');
    }

    return this.prisma.checklistTemplate.update({
      where: { id },
      data: { status: ChecklistStatus.INACTIVE },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
        equipment: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
            status: true,
            factory: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Duplicate a template
   */
  async duplicate(id: string) {
    const original = await this.findOne(id);
    const newCode = await this.generateCode(original.equipment.code);

    return this.prisma.checklistTemplate.create({
      data: {
        code: newCode,
        name: `${original.name} (Copy)`,
        description: original.description,
        equipmentId: original.equipmentId,
        department: original.department,

        cycle: original.cycle,
        status: ChecklistStatus.ACTIVE,
        notes: original.notes,
        version: 1,
        items: {
          create: original.items.map((item) => ({
            order: item.order,
            maintenanceTask: item.maintenanceTask,
            judgmentStandard: item.judgmentStandard,
            inspectionMethod: item.inspectionMethod,
            maintenanceContent: item.maintenanceContent,
            expectedResult: item.expectedResult,
            isRequired: item.isRequired,
            requiresImage: item.requiresImage,
            requiresNote: item.requiresNote,
          })),
        },
      },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
        equipment: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
            status: true,
            factory: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Create a new version of a template
   */
  private async createNewVersion(id: string, dto: UpdateTemplateDto) {
    const original = await this.findOne(id);

    // Deactivate original
    await this.deactivate(id);

    // Create new version with new code
    const newCode = await this.generateCode(original.equipment.code);

    return this.prisma.checklistTemplate.create({
      data: {
        code: newCode,
        name: dto.name || original.name,
        description: dto.description !== undefined ? dto.description : original.description,
        equipmentId: dto.equipmentId || original.equipmentId,
        department: dto.department !== undefined ? dto.department : original.department,

        cycle: dto.cycle || original.cycle,
        status: ChecklistStatus.ACTIVE,
        notes: dto.notes !== undefined ? dto.notes : original.notes,
        version: original.version + 1,
        items: {
          create: dto.items
            ? dto.items
            : original.items.map((item) => ({
                order: item.order,
                maintenanceTask: item.maintenanceTask,
                judgmentStandard: item.judgmentStandard,
                inspectionMethod: item.inspectionMethod,
                maintenanceContent: item.maintenanceContent,
                expectedResult: item.expectedResult,
                isRequired: item.isRequired,
                requiresImage: item.requiresImage,
                requiresNote: item.requiresNote,
              })),
        },
      },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
        equipment: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
            status: true,
            factory: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Generate a unique checklist code based on equipment code
   */
  private async generateCode(equipmentCode: string): Promise<string> {
    const prefix = `CL-${equipmentCode}`;

    const count = await this.prisma.checklistTemplate.count({
      where: {
        code: {
          startsWith: prefix,
        },
      },
    });

    return `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }
}
