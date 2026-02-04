import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { FactoriesService } from './factories.service';
import { PrismaService } from '@/database/prisma.service';
import { mockPrismaService, MockPrismaService } from '@test/mocks/prisma.mock';
import { factoryFixture, factoryListFixture } from '@test/fixtures/factories.fixture';
import { FactoryStatus } from '@prisma/generated/prisma';

describe('FactoriesService', () => {
    let service: FactoriesService;
    let prisma: MockPrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FactoriesService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService(),
                },
            ],
        }).compile();

        service = module.get<FactoriesService>(FactoriesService);
        prisma = module.get(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return paginated factories', async () => {
            // Arrange
            const mockFactories = factoryListFixture(2);
            const mockFactoriesWithCount = mockFactories.map(f => ({
                ...f,
                _count: { equipments: 0 },
            }));

            prisma.client.factory.findMany.mockResolvedValue(mockFactoriesWithCount as any);
            prisma.client.factory.count.mockResolvedValue(2);

            // Act
            const result = await service.findAll({
                page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc',
                skip: 0,
                take: 0
            });

            // Assert
            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
            expect(result.meta.page).toBe(1);
            expect(result.meta.limit).toBe(10);
            expect(prisma.client.factory.findMany).toHaveBeenCalledTimes(1);
            expect(prisma.client.factory.count).toHaveBeenCalledTimes(1);
        });

        it('should filter by status', async () => {
            // Arrange
            prisma.client.factory.findMany.mockResolvedValue([]);
            prisma.client.factory.count.mockResolvedValue(0);

            // Act
            await service.findAll({
                page: 1,
                limit: 10,
                status: FactoryStatus.ACTIVE,
                sortBy: 'createdAt',
                sortOrder: 'desc',
                skip: 0,
                take: 0
            });

            // Assert
            expect(prisma.client.factory.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ status: FactoryStatus.ACTIVE }),
                })
            );
        });

        it('should search by code and name', async () => {
            // Arrange
            prisma.client.factory.findMany.mockResolvedValue([]);
            prisma.client.factory.count.mockResolvedValue(0);

            // Act
            await service.findAll({
                page: 1,
                limit: 10,
                search: 'Test',
                sortBy: 'createdAt',
                sortOrder: 'desc',
                skip: 0,
                take: 0
            });

            // Assert
            expect(prisma.client.factory.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: expect.arrayContaining([
                            { code: { contains: 'Test', mode: 'insensitive' } },
                            { name: { contains: 'Test', mode: 'insensitive' } },
                        ]),
                    }),
                })
            );
        });
    });

    describe('findOne', () => {
        it('should return factory by id', async () => {
            // Arrange
            const mockFactory = factoryFixture();
            const mockFactoryWithCount = {
                ...mockFactory,
                _count: { equipments: 5 },
            };

            prisma.client.factory.findUnique.mockResolvedValue(mockFactoryWithCount as any);

            // Act
            const result = await service.findOne(mockFactory.id);

            // Assert
            expect(result.id).toBe(mockFactory.id);
            expect(result.equipmentCount).toBe(5);
            expect(result.status).toBe('active');  // Lowercase transformation
            expect(prisma.client.factory.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: mockFactory.id },
                })
            );
        });

        it('should throw NotFoundException when factory not found', async () => {
            // Arrange
            prisma.client.factory.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('should create factory successfully', async () => {
            // Arrange
            const dto = { code: 'F99', name: 'New Factory', location: 'Test' };
            const mockFactory = factoryFixture(dto);
            const mockFactoryWithCount = {
                ...mockFactory,
                _count: { equipments: 0 },
            };

            prisma.client.factory.findUnique.mockResolvedValue(null);  // No duplicate
            prisma.client.factory.create.mockResolvedValue(mockFactoryWithCount as any);

            // Act
            const result = await service.create(dto);

            // Assert
            expect(result.code).toBe('F99');
            expect(result.equipmentCount).toBe(0);
            expect(prisma.client.factory.findUnique).toHaveBeenCalledWith({
                where: { code: 'F99' },
            });
            expect(prisma.client.factory.create).toHaveBeenCalledTimes(1);
        });

        it('should throw ConflictException for duplicate code', async () => {
            // Arrange
            const dto = { code: 'F01', name: 'Test' };
            const existingFactory = factoryFixture({ code: 'F01' });

            prisma.client.factory.findUnique.mockResolvedValue(existingFactory as any);

            // Act & Assert
            await expect(service.create(dto)).rejects.toThrow(ConflictException);
            expect(prisma.client.factory.create).not.toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should update factory successfully', async () => {
            // Arrange
            const mockFactory = factoryFixture();
            const updatedFactory = { ...mockFactory, name: 'Updated Name' };
            const mockFactoryWithCount = {
                ...mockFactory,
                _count: { equipments: 0 },
            };
            const updatedFactoryWithCount = {
                ...updatedFactory,
                _count: { equipments: 0 },
            };

            prisma.client.factory.findUnique.mockResolvedValueOnce(mockFactoryWithCount as any);
            prisma.client.factory.update.mockResolvedValue(updatedFactoryWithCount as any);

            // Act
            const result = await service.update(mockFactory.id, { name: 'Updated Name' });

            // Assert
            expect(result.name).toBe('Updated Name');
            expect(result.code).toBe(mockFactory.code);  // Unchanged
            expect(prisma.client.factory.update).toHaveBeenCalledTimes(1);
        });

        it('should throw ConflictException when updating to duplicate code', async () => {
            // Arrange
            const mockFactory = factoryFixture({ code: 'F01' });
            const existingFactory = factoryFixture({ code: 'F02' });
            const mockFactoryWithCount = {
                ...mockFactory,
                _count: { equipments: 0 },
            };

            prisma.client.factory.findUnique
                .mockResolvedValueOnce(mockFactoryWithCount as any)  // findOne check
                .mockResolvedValueOnce(existingFactory as any);  // Duplicate check

            prisma.client.factory.findFirst.mockResolvedValue(existingFactory as any);

            // Act & Assert
            await expect(service.update(mockFactory.id, { code: 'F02' })).rejects.toThrow(ConflictException);
        });
    });

    describe('remove', () => {
        it('should delete factory without equipments', async () => {
            // Arrange
            const mockFactory = factoryFixture();
            const mockFactoryWithCount = {
                ...mockFactory,
                _count: { equipments: 0 },
            };

            prisma.client.factory.findUnique.mockResolvedValue(mockFactoryWithCount as any);
            prisma.client.factory.delete.mockResolvedValue(mockFactory as any);

            // Act
            const result = await service.remove(mockFactory.id);

            // Assert
            expect(result.message).toContain('thành công');
            expect(prisma.client.factory.delete).toHaveBeenCalledWith({
                where: { id: mockFactory.id },
            });
        });

        it('should throw ConflictException if factory has equipments', async () => {
            // Arrange
            const mockFactory = factoryFixture();
            const mockFactoryWithCount = {
                ...mockFactory,
                _count: { equipments: 5 },
            };

            prisma.client.factory.findUnique.mockResolvedValue(mockFactoryWithCount as any);

            // Act & Assert
            await expect(service.remove(mockFactory.id)).rejects.toThrow(ConflictException);
            expect(prisma.client.factory.delete).not.toHaveBeenCalled();
        });
    });

    describe('getStats', () => {
        it('should return factory statistics', async () => {
            // Arrange
            prisma.client.factory.count
                .mockResolvedValueOnce(10)  // Total factories
                .mockResolvedValueOnce(7);  // Active factories
            prisma.client.equipment.count.mockResolvedValue(50);  // Total equipment

            // Act
            const result = await service.getStats();

            // Assert
            expect(result.totalFactories).toBe(10);
            expect(result.activeFactories).toBe(7);
            expect(result.totalEquipment).toBe(50);
        });
    });
});
