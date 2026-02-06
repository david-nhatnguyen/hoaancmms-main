import { Test, TestingModule } from '@nestjs/testing';
import { FactoriesController } from './factories.controller';
import { FactoriesService } from './factories.service';
import { FactoryStatus } from '@prisma/generated/prisma';
import { FactoryQueryDto } from './dto/factory-query.dto';
import { CreateFactoryDto } from './dto/create-factory.dto';
import { UpdateFactoryDto } from './dto/update-factory.dto';

describe('FactoriesController', () => {
  let controller: FactoriesController;
  let service: FactoriesService;

  const mockFactory = {
    id: '123',
    code: 'F01',
    name: 'Factory 1',
    location: 'Location 1',
    status: 'active',
    equipmentCount: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFactoriesService = {
    findAll: jest.fn().mockResolvedValue({
      data: [mockFactory],
      meta: { total: 1, page: 1, limit: 10 },
    }),
    findOne: jest.fn().mockResolvedValue(mockFactory),
    create: jest.fn().mockResolvedValue(mockFactory),
    update: jest.fn().mockResolvedValue(mockFactory),
    remove: jest.fn().mockResolvedValue({ message: 'Success' }),
    getStats: jest.fn().mockResolvedValue({
      totalFactories: 1,
      activeFactories: 1,
      totalEquipment: 5,
    }),
  };

  beforeEach(async () => {
    mockFactoriesService.getStats.mockResolvedValue({
      totalFactories: 1,
      activeFactories: 1,
      totalEquipment: 5,
    });
    mockFactoriesService.findAll.mockResolvedValue({
      data: [mockFactory],
      meta: { total: 1, page: 1, limit: 10 },
    });
    mockFactoriesService.findOne.mockResolvedValue(mockFactory);
    mockFactoriesService.create.mockResolvedValue(mockFactory);
    mockFactoriesService.update.mockResolvedValue(mockFactory);
    mockFactoriesService.remove.mockResolvedValue({ message: 'Success' });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FactoriesController],
      providers: [
        {
          provide: FactoriesService,
          useValue: mockFactoriesService,
        },
      ],
    }).compile();

    controller = module.get<FactoriesController>(FactoriesController);
    service = module.get<FactoriesService>(FactoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStats', () => {
    it('should return factory stats', async () => {
      const result = await controller.getStats();
      expect(result).toEqual({
        totalFactories: 1,
        activeFactories: 1,
        totalEquipment: 5,
      });
      expect(service.getStats).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return a list of factories', async () => {
      const query = new FactoryQueryDto();
      const result = await controller.findAll(query);
      expect(result.data).toEqual([mockFactory]);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single factory', async () => {
      const result = await controller.findOne('123');
      expect(result).toEqual(mockFactory);
      expect(service.findOne).toHaveBeenCalledWith('123');
    });
  });

  describe('create', () => {
    it('should create a new factory', async () => {
      const dto: CreateFactoryDto = {
        code: 'F01',
        name: 'Factory 1',
        location: 'Location 1',
        status: FactoryStatus.ACTIVE,
      };
      const result = await controller.create(dto);
      expect(result).toEqual(mockFactory);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a factory', async () => {
      const dto: UpdateFactoryDto = { name: 'Updated Name' };
      const result = await controller.update('123', dto);
      expect(result).toEqual(mockFactory);
      expect(service.update).toHaveBeenCalledWith('123', dto);
    });
  });

  describe('remove', () => {
    it('should remove a factory', async () => {
      const result = await controller.remove('123');
      expect(result).toEqual({ message: 'Success' });
      expect(service.remove).toHaveBeenCalledWith('123');
    });
  });
});
