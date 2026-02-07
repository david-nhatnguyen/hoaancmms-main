import { Test, TestingModule } from '@nestjs/testing';
import { EquipmentsController } from './equipments.controller';
import { EquipmentsService } from './equipments.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';

describe('EquipmentsController', () => {
  let controller: EquipmentsController;
  let service: EquipmentsService;

  const mockEquipmentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquipmentsController],
      providers: [
        {
          provide: EquipmentsService,
          useValue: mockEquipmentsService,
        },
      ],
    }).compile();

    controller = module.get<EquipmentsController>(EquipmentsController);
    service = module.get<EquipmentsService>(EquipmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = { code: 'TEST' } as CreateEquipmentDto;
      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      const query = { page: 1, limit: 10 };
      await controller.findAll(query as any);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne', async () => {
      await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const dto = { name: 'New Name' };
      await controller.update('1', dto);
      expect(service.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('getStats', () => {
    it('should call service.getStats', async () => {
      await controller.getStats();
      expect(service.getStats).toHaveBeenCalled();
    });
  });
});
