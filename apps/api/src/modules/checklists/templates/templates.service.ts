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

    // Validate assigned user if provided
    if (dto.assignedUserId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.assignedUserId },
      });

      if (!user) {
        throw new NotFoundException(`Không tìm thấy người dùng với ID: ${dto.assignedUserId}`);
      }
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
        assignedUserId: dto.assignedUserId,
        department: dto.department,
        maintenanceStartDate: dto.maintenanceStartDate ? new Date(dto.maintenanceStartDate) : null,
        cycle: dto.cycle,
        status: dto.status || ChecklistStatus.DRAFT,
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
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  }

  /**
   * Find all templates with filtering and pagination
   */
  async findAll(query: QueryTemplateDto) {
    const { status, cycle, equipmentId, assignedUserId, search, page = 1, limit = 20 } = query;

    const where: any = {};

    if (status) where.status = status;
    if (cycle) where.cycle = cycle;
    if (equipmentId) where.equipmentId = equipmentId;
    if (assignedUserId) where.assignedUserId = assignedUserId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { equipment: { name: { contains: search, mode: 'insensitive' } } },
        { equipment: { code: { contains: search, mode: 'insensitive' } } },
      ];
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
            },
          },
          assignedUser: {
            select: {
              id: true,
              username: true,
              fullName: true,
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
        orderBy: { createdAt: 'desc' },
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
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
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

    // Validate assigned user if changing
    if (dto.assignedUserId && dto.assignedUserId !== existing.assignedUserId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.assignedUserId },
      });

      if (!user) {
        throw new NotFoundException(`Không tìm thấy người dùng với ID: ${dto.assignedUserId}`);
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
        ...(dto.assignedUserId !== undefined && { assignedUserId: dto.assignedUserId }),
        ...(dto.department !== undefined && { department: dto.department }),
        ...(dto.maintenanceStartDate !== undefined && {
          maintenanceStartDate: dto.maintenanceStartDate
            ? new Date(dto.maintenanceStartDate)
            : null,
        }),
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
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
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
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
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
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
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
        assignedUserId: original.assignedUserId,
        department: original.department,
        maintenanceStartDate: original.maintenanceStartDate,
        cycle: original.cycle,
        status: ChecklistStatus.DRAFT,
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
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
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
        assignedUserId:
          dto.assignedUserId !== undefined ? dto.assignedUserId : original.assignedUserId,
        department: dto.department !== undefined ? dto.department : original.department,
        maintenanceStartDate:
          dto.maintenanceStartDate !== undefined
            ? dto.maintenanceStartDate
              ? new Date(dto.maintenanceStartDate)
              : null
            : original.maintenanceStartDate,
        cycle: dto.cycle || original.cycle,
        status: ChecklistStatus.DRAFT,
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
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
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
