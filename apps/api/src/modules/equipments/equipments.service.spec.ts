import { Test, TestingModule } from '@nestjs/testing';
import { EquipmentsService } from './equipments.service';
import { PrismaService } from '@/database/prisma.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { EquipmentStatus } from '@prisma/generated/prisma';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { mockPrismaService, MockPrismaService } from '@test/mocks/prisma.mock';

describe('EquipmentsService', () => {
  let service: EquipmentsService;
  let prisma: MockPrismaService;

  const mockFactory = {
    id: 'factory-1',
    name: 'Factory 1',
    status: 'ACTIVE',
  };

  const mockEquipment = {
    id: 'eq-1',
    code: 'EQ-001',
    name: 'Equipment 1',
    factoryId: 'factory-1',
    factory: mockFactory,
    category: 'Microscope',
    status: EquipmentStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EquipmentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService(),
        },
      ],
    }).compile();

    service = module.get<EquipmentsService>(EquipmentsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create equipment successfully', async () => {
      const dto: CreateEquipmentDto = {
        code: 'EQ-001',
        name: 'Equipment 1',
        category: 'Microscope',
        factoryId: 'factory-1',
        status: EquipmentStatus.ACTIVE,
      };

      prisma.client.equipment.findUnique.mockResolvedValue(null); // No duplicates
      prisma.client.factory.findUnique.mockResolvedValue(mockFactory as any); // Factory exists
      prisma.client.equipment.create.mockResolvedValue(mockEquipment as any);

      const result = await service.create(dto);

      expect(result).toEqual(mockEquipment);
      expect(prisma.client.equipment.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should create equipment without factory successfully', async () => {
      const dto: CreateEquipmentDto = {
        code: 'EQ-002',
        name: 'Equipment 2',
        category: 'Microscope',
        // factoryId is undefined
        status: EquipmentStatus.ACTIVE,
      };

      const mockEquipmentNoFactory = { ...mockEquipment, factoryId: null, factory: null };

      prisma.client.equipment.findUnique.mockResolvedValue(null);
      prisma.client.equipment.create.mockResolvedValue(mockEquipmentNoFactory as any);

      await service.create(dto);

      expect(prisma.client.equipment.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw ConflictException if equipment code already exists', async () => {
      const dto: CreateEquipmentDto = {
        code: 'EQ-001',
        name: 'Equipment 1',
        factoryId: 'factory-1',
        category: 'Microscope',
      };

      prisma.client.equipment.findUnique.mockResolvedValue(mockEquipment as any);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if factory does not exist', async () => {
      const dto: CreateEquipmentDto = {
        code: 'EQ-001',
        name: 'Equipment 1',
        factoryId: 'factory-999',
        category: 'Microscope',
      };

      prisma.client.equipment.findUnique.mockResolvedValue(null);
      prisma.client.factory.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated equipments with meta', async () => {
      const query = { page: 1, limit: 10 };
      const mockData = [mockEquipment, { ...mockEquipment, id: 'eq-2', code: 'EQ-002' }];

      prisma.client.equipment.findMany.mockResolvedValue(mockData as any);
      prisma.client.equipment.count.mockResolvedValue(2);

      const result = await service.findAll(query as any);

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.data[0].factoryName).toBe('Factory 1');
    });

    it('should filter by search and enums', async () => {
      const query = {
        search: 'EQ',
        status: [EquipmentStatus.ACTIVE],
      };

      prisma.client.equipment.findMany.mockResolvedValue([]);
      prisma.client.equipment.count.mockResolvedValue(0);

      await service.findAll(query as any);

      expect(prisma.client.equipment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: [EquipmentStatus.ACTIVE] },
            OR: expect.arrayContaining([{ code: { contains: 'EQ', mode: 'insensitive' } }]),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return equipment by id', async () => {
      prisma.client.equipment.findUnique.mockResolvedValue(mockEquipment as any);

      const result = await service.findOne('eq-1');
      expect(result).toEqual(mockEquipment);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.client.equipment.findUnique.mockResolvedValue(null);
      await expect(service.findOne('eq-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update equipment successfully', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedEquipment = { ...mockEquipment, name: 'Updated Name' };

      prisma.client.equipment.findUnique.mockResolvedValue(mockEquipment as any);
      prisma.client.equipment.update.mockResolvedValue(updatedEquipment as any);

      const result = await service.update('eq-1', updateDto);
      expect(result.name).toBe('Updated Name');
    });

    it('should check for duplicate code on update', async () => {
      const updateDto = { code: 'EQ-DUPLICATE' };

      prisma.client.equipment.findUnique.mockResolvedValue(mockEquipment as any);
      prisma.client.equipment.findFirst.mockResolvedValue({ id: 'eq-2' } as any); // Exists another one with this code

      await expect(service.update('eq-1', updateDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete equipment', async () => {
      prisma.client.equipment.findUnique.mockResolvedValue(mockEquipment as any);
      prisma.client.equipment.delete.mockResolvedValue(mockEquipment as any);

      const result = await service.remove('eq-1');
      expect(result).toEqual({ message: 'Equipment deleted successfully' });
    });
  });

  describe('getStats', () => {
    it('should return stats correctly', async () => {
      const statusCounts = [
        { status: EquipmentStatus.ACTIVE, _count: { status: 5 } },
        { status: EquipmentStatus.MAINTENANCE, _count: { status: 2 } },
        { status: EquipmentStatus.INACTIVE, _count: { status: 1 } },
      ];

      prisma.client.equipment.count.mockResolvedValue(8);
      prisma.client.equipment.groupBy.mockResolvedValue(statusCounts as any);

      const result = await service.getStats();

      expect(result.totalEquipments).toBe(8);
      expect(result.active).toBe(5);
      expect(result.maintenance).toBe(2);
      expect(result.inactive).toBe(1);
    });
  });
});
