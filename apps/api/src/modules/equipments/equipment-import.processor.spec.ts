import { Test, TestingModule } from '@nestjs/testing';
import { EquipmentImportProcessor } from './equipment-import.processor';
import { PrismaService } from '@/database/prisma.service';
import { EquipmentsQrService } from './equipments.qr.service';
import { Job } from 'bullmq';
import * as fs from 'fs';
import * as sharp from 'sharp';
import * as ExcelJS from 'exceljs';

jest.mock('exceljs');
jest.mock('fs');
jest.mock('sharp');

describe('EquipmentImportProcessor', () => {
  let processor: EquipmentImportProcessor;

  const mockPrisma = {
    client: {
      importHistory: {
        update: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
      },
      equipment: {
        findMany: jest.fn().mockResolvedValue([]),
        createMany: jest.fn(),
      },
      factory: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    },
  };

  const mockJob = {
    id: 'job-1',
    data: { filePath: 'test.xlsx', importHistoryId: 'history-1' },
    updateProgress: jest.fn().mockResolvedValue(undefined),
  } as unknown as Job;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EquipmentImportProcessor,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: EquipmentsQrService,
          useValue: { generateQrCode: jest.fn().mockResolvedValue('qr-code-url') },
        },
      ],
    }).compile();

    processor = module.get<EquipmentImportProcessor>(EquipmentImportProcessor);
  });

  const getMockWorkbook = () => {
    const mockWorksheet: any = {
      rowCount: 2,
      getRow: jest.fn(),
      getImages: jest.fn().mockReturnValue([]),
      actualColumnCount: 11,
    };
    const mockWorkbook: any = {
      xlsx: {
        readFile: jest.fn().mockResolvedValue(undefined),
        writeFile: jest.fn().mockResolvedValue(undefined),
      },
      getWorksheet: jest.fn().mockReturnValue(mockWorksheet),
      model: { media: [] as any[] },
    };
    return { mockWorkbook, mockWorksheet };
  };

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should throw error if file does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(processor.process(mockJob)).rejects.toThrow('Không tìm thấy file upload');
    });

    it('should process a valid excel file successfully', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const { mockWorkbook, mockWorksheet } = getMockWorkbook();
      mockWorksheet.getRow.mockReturnValue({
        actualCellCount: 5,
        getCell: (idx: number) => ({
          text:
            idx === 1
              ? 'EQ-001'
              : idx === 2
                ? 'Equip 1'
                : idx === 3
                  ? 'Cat 1'
                  : idx === 5
                    ? 'ACTIVE'
                    : '',
          value: idx === 6 ? 1 : idx === 9 ? 2024 : '',
        }),
      });

      (ExcelJS.Workbook as jest.Mock).mockImplementation(() => mockWorkbook);

      mockPrisma.client.importHistory.findUnique.mockResolvedValue({ fileName: 'test.xlsx' });
      mockPrisma.client.equipment.findMany.mockResolvedValue([]);
      mockPrisma.client.equipment.createMany.mockResolvedValue({ count: 1 });

      const result = await processor.process(mockJob);

      expect(result.success).toBe(true);
      expect(mockWorkbook.xlsx.readFile).toHaveBeenCalled();
    });

    it('should fallback to ACTIVE status for invalid status values', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const { mockWorkbook, mockWorksheet } = getMockWorkbook();
      mockWorksheet.getRow.mockReturnValue({
        actualCellCount: 5,
        getCell: (idx: number) => ({
          text:
            idx === 1
              ? 'EQ-002'
              : idx === 2
                ? 'Equip 2'
                : idx === 3
                  ? 'Cat 1'
                  : idx === 5
                    ? 'INVALID_STATUS'
                    : '',
          value: idx === 6 ? 1 : idx === 9 ? 2024 : '',
        }),
      });

      (ExcelJS.Workbook as jest.Mock).mockImplementation(() => mockWorkbook);

      mockPrisma.client.importHistory.findUnique.mockResolvedValue({ fileName: 'test.xlsx' });
      mockPrisma.client.equipment.findMany.mockResolvedValue([]);
      mockPrisma.client.equipment.createMany.mockResolvedValue({ count: 1 });

      await processor.process(mockJob);

      expect(mockPrisma.client.equipment.createMany).toHaveBeenCalledWith({
        data: [expect.objectContaining({ status: 'ACTIVE' })],
        skipDuplicates: true,
      });
    });

    it('should handle validation errors in rows', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const { mockWorkbook, mockWorksheet } = getMockWorkbook();
      mockWorksheet.getRow.mockReturnValue({
        actualCellCount: 5,
        getCell: (idx: number) => ({
          text: idx === 1 ? '' : 'Test', // Missing code
          value: 1,
        }),
      });

      (ExcelJS.Workbook as jest.Mock).mockImplementation(() => mockWorkbook);
      mockPrisma.client.importHistory.findUnique.mockResolvedValue({ fileName: 'test.xlsx' });

      const result = await processor.process(mockJob);

      expect(result.success).toBe(false);
      expect(mockWorkbook.xlsx.writeFile).toHaveBeenCalled();
    });

    it('should update progress every 20 rows', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const { mockWorkbook, mockWorksheet } = getMockWorkbook();
      mockWorksheet.rowCount = 25;
      mockWorksheet.getRow.mockReturnValue({
        actualCellCount: 5,
        getCell: (idx: number) => ({
          text: idx === 1 ? 'EQ-PROG' : 'Test',
          value: 1,
        }),
      });

      (ExcelJS.Workbook as jest.Mock).mockImplementation(() => mockWorkbook);
      mockPrisma.client.importHistory.findUnique.mockResolvedValue({ fileName: 'test.xlsx' });
      mockPrisma.client.equipment.findMany.mockResolvedValue([]);
      mockPrisma.client.equipment.createMany.mockResolvedValue({ count: 24 });

      await processor.process(mockJob);

      expect(mockJob.updateProgress).toHaveBeenCalled();
    });

    it('should handle duplicates correctly', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const { mockWorkbook, mockWorksheet } = getMockWorkbook();
      mockWorksheet.rowCount = 3;
      mockWorksheet.getRow.mockImplementation((i) => {
        if (i === 1) return { getCell: () => ({ value: 'Header' }) };
        return {
          actualCellCount: 5,
          getCell: (idx: number) => ({
            text: idx === 1 ? 'DUP-001' : idx === 2 ? 'Name' : idx === 3 ? 'Category' : 'Test',
            value: 1,
          }),
        };
      });

      (ExcelJS.Workbook as jest.Mock).mockImplementation(() => mockWorkbook);
      mockPrisma.client.importHistory.findUnique.mockResolvedValue({ fileName: 'test.xlsx' });
      mockPrisma.client.equipment.findMany.mockResolvedValue([{ code: 'DUP-001' }]);

      const result = await processor.process(mockJob);

      expect(result.success).toBe(false);
      expect(mockWorkbook.xlsx.writeFile).toHaveBeenCalled();
    });

    it('should process images with compression', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const { mockWorkbook, mockWorksheet } = getMockWorkbook();
      mockWorksheet.getRow.mockReturnValue({
        actualCellCount: 5,
        getCell: (idx: number) => ({
          text:
            idx === 1
              ? 'IMG-001'
              : idx === 2
                ? 'Name'
                : idx === 3
                  ? 'Category'
                  : idx === 4
                    ? ''
                    : 'Test',
          value: 1,
        }),
      });
      mockWorksheet.getImages.mockReturnValue([
        {
          imageId: '1',
          range: { tl: { nativeRow: 1 } },
        },
      ]);

      mockWorkbook.model.media = [{ index: 1, buffer: Buffer.from('test') }];
      (ExcelJS.Workbook as jest.Mock).mockImplementation(() => mockWorkbook);

      const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        webp: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue({}),
      };
      (sharp as unknown as jest.Mock).mockReturnValue(mockSharpInstance);

      mockPrisma.client.importHistory.findUnique.mockResolvedValue({ fileName: 'test.xlsx' });
      mockPrisma.client.equipment.findMany.mockResolvedValue([]);
      mockPrisma.client.equipment.createMany.mockResolvedValue({ count: 1 });

      const result = await processor.process(mockJob);

      expect(result.success).toBe(true);
      expect(sharp).toHaveBeenCalled();
    });

    it('should log warning if image processing fails', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const { mockWorkbook, mockWorksheet } = getMockWorkbook();
      mockWorksheet.getRow.mockReturnValue({
        actualCellCount: 5,
        getCell: (idx: number) => ({
          text:
            idx === 1
              ? 'IMG-FAIL'
              : idx === 2
                ? 'Name'
                : idx === 3
                  ? 'Category'
                  : idx === 4
                    ? ''
                    : 'Test',
          value: 1,
        }),
      });
      mockWorksheet.getImages.mockReturnValue([
        {
          imageId: '1',
          range: { tl: { nativeRow: 1 } },
        },
      ]);

      mockWorkbook.model.media = [{ index: 1, buffer: Buffer.from('test') }];
      (ExcelJS.Workbook as jest.Mock).mockImplementation(() => mockWorkbook);

      (sharp as unknown as jest.Mock).mockReturnValue({
        resize: jest.fn().mockReturnThis(),
        webp: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockRejectedValue(new Error('Sharp Error')),
      });

      mockPrisma.client.importHistory.findUnique.mockResolvedValue({ fileName: 'test.xlsx' });
      mockPrisma.client.equipment.findMany.mockResolvedValue([]);
      mockPrisma.client.equipment.createMany.mockResolvedValue({ count: 1 });

      await processor.process(mockJob);
      expect(mockPrisma.client.equipment.createMany).toHaveBeenCalled();
    });

    it('should handle recursive validation errors', () => {
      const errors = [
        {
          property: 'parent',
          children: [
            {
              property: 'child',
              constraints: { required: 'Child is required' },
            },
          ],
        },
      ] as any;
      const result = (processor as any).formatValidationErrors(errors);
      expect(result).toContain('Child is required');
    });

    describe('Factory Resolution', () => {
      it('should resolve valid factory codes to IDs', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        const { mockWorkbook, mockWorksheet } = getMockWorkbook();

        mockWorksheet.getRow.mockReturnValue({
          actualCellCount: 5,
          getCell: (idx: number) => ({
            text:
              idx === 1
                ? 'EQ-FAC-01'
                : idx === 2
                  ? 'Equip'
                  : idx === 3
                    ? 'Cat'
                    : idx === 4
                      ? 'FAC-999' // Factory Code
                      : idx === 5
                        ? 'ACTIVE'
                        : '',
            value: idx === 6 ? 1 : '',
          }),
        });

        (ExcelJS.Workbook as jest.Mock).mockImplementation(() => mockWorkbook);
        mockPrisma.client.importHistory.findUnique.mockResolvedValue({ fileName: 'test.xlsx' });
        mockPrisma.client.equipment.findMany.mockResolvedValue([]);

        // Mock factory lookup
        mockPrisma.client.factory.findMany.mockResolvedValue([
          { id: 'uuid-fac-999', code: 'FAC-999' },
        ]);
        mockPrisma.client.equipment.createMany.mockResolvedValue({ count: 1 });

        await processor.process(mockJob);

        expect(mockPrisma.client.equipment.createMany).toHaveBeenCalledWith({
          data: [expect.objectContaining({ factoryId: 'uuid-fac-999' })],
          skipDuplicates: true,
        });
      });

      it('should fail and report error if factory code does not exist', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        const { mockWorkbook, mockWorksheet } = getMockWorkbook();

        mockWorksheet.getRow.mockReturnValue({
          actualCellCount: 5,
          getCell: (idx: number) => ({
            text:
              idx === 1
                ? 'EQ-FAIL'
                : idx === 2
                  ? 'Name'
                  : idx === 3
                    ? 'Category'
                    : idx === 4
                      ? 'INVALID-FAC'
                      : '',
            value: idx === 6 ? 1 : '',
          }),
        });

        (ExcelJS.Workbook as jest.Mock).mockImplementation(() => mockWorkbook);
        mockPrisma.client.importHistory.findUnique.mockResolvedValue({ fileName: 'test.xlsx' });
        mockPrisma.client.factory.findMany.mockResolvedValue([]); // No factory found

        const result = await processor.process(mockJob);

        expect(result.success).toBe(false);
        expect(mockWorkbook.xlsx.writeFile).toHaveBeenCalled();
        expect(mockPrisma.client.equipment.createMany).not.toHaveBeenCalled();
      });

      it('should handle rows without factory code (optional)', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        const { mockWorkbook, mockWorksheet } = getMockWorkbook();

        mockWorksheet.getRow.mockReturnValue({
          actualCellCount: 5,
          getCell: (idx: number) => ({
            text: idx === 1 ? 'EQ-NO-FAC' : idx === 2 ? 'Name' : idx === 3 ? 'Category' : '', // Category/Name are required, No factory code in idx 4
            value: idx === 6 ? 1 : '',
          }),
        });

        (ExcelJS.Workbook as jest.Mock).mockImplementation(() => mockWorkbook);
        mockPrisma.client.importHistory.findUnique.mockResolvedValue({ fileName: 'test.xlsx' });
        mockPrisma.client.equipment.findMany.mockResolvedValue([]);
        mockPrisma.client.equipment.createMany.mockResolvedValue({ count: 1 });

        const result = await processor.process(mockJob);

        expect(result.success).toBe(true);
        expect(mockPrisma.client.equipment.createMany).toHaveBeenCalledWith({
          data: [expect.objectContaining({ code: 'EQ-NO-FAC' })],
          skipDuplicates: true,
        });
      });
    });
  });
});
