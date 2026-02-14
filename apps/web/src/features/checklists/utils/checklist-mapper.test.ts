import { describe, it, expect } from '@jest/globals';
import {
  mapChecklistItemFromAPI,
  mapChecklistTemplateFromAPI,
  mapChecklistItemToAPI,
  convertCycleToAPI,
  convertStatusToAPI,
  UIChecklistItem,
  UIChecklistTemplate,
} from './checklist-mapper';
import {
  ChecklistTemplate as APIChecklistTemplate,
  ChecklistTemplateItem as APIChecklistTemplateItem,
  ChecklistCycle,
  ChecklistStatus,
  Equipment,
} from '../types/checklist.types';

describe('checklist-mapper', () => {
  describe('mapChecklistItemFromAPI', () => {
    it('should map API item to UI item with all fields', () => {
      const apiItem: APIChecklistTemplateItem = {
        id: 'item-001',
        templateId: 'template-001',
        order: 1,
        maintenanceTask: 'Check engine',
        judgmentStandard: 'No abnormal sound',
        inspectionMethod: 'Visual inspection',
        maintenanceContent: 'Inspect engine components',
        expectedResult: 'OK',
        isRequired: true,
        requiresImage: true,
        requiresNote: false,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
      };

      const result = mapChecklistItemFromAPI(apiItem);

      expect(result).toEqual({
        id: 'item-001',
        order: 1,
        maintenanceTask: 'Check engine',
        standard: 'No abnormal sound',
        method: 'Visual inspection',
        content: 'Inspect engine components',
        expectedResult: 'OK',
        isRequired: true,
        requiresImage: true,
      });
    });

    it('should handle null optional fields', () => {
      const apiItem: APIChecklistTemplateItem = {
        id: 'item-002',
        templateId: 'template-001',
        order: 2,
        maintenanceTask: 'Basic check',
        judgmentStandard: null,
        inspectionMethod: null,
        maintenanceContent: null,
        expectedResult: null,
        isRequired: false,
        requiresImage: false,
        requiresNote: false,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
      };

      const result = mapChecklistItemFromAPI(apiItem);

      expect(result.standard).toBe('');
      expect(result.method).toBe('');
      expect(result.content).toBe('');
      expect(result.expectedResult).toBe('');
    });
  });

  describe('mapChecklistTemplateFromAPI', () => {
    const mockEquipment: Equipment = {
      id: 'eq-001',
      code: 'EQ-001',
      name: 'Injection Machine',
      category: 'Injection Molding Machine',
      status: 'ACTIVE',
    };

    const mockAPITemplate: APIChecklistTemplate = {
      id: 'cl-001',
      code: 'CL-INJ-001',
      name: 'Injection Machine – Monthly Maintenance',
      description: 'Monthly checklist',
      equipmentId: 'eq-001',
      equipment: mockEquipment,
      assignedUserId: null,
      assignedUser: null,
      department: null,
      maintenanceStartDate: null,
      cycle: ChecklistCycle.MONTHLY,
      version: 1,
      status: ChecklistStatus.ACTIVE,
      notes: 'Test notes',
      createdBy: null,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      items: [
        {
          id: 'item-001',
          templateId: 'cl-001',
          order: 1,
          maintenanceTask: 'Check engine',
          judgmentStandard: 'No abnormal sound',
          inspectionMethod: 'Visual',
          maintenanceContent: 'Inspect',
          expectedResult: 'OK',
          isRequired: true,
          requiresImage: false,
          requiresNote: false,
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
        },
      ],
    };

    it('should map API template to UI template correctly', () => {
      const result = mapChecklistTemplateFromAPI(mockAPITemplate);

      expect(result.id).toBe('cl-001');
      expect(result.code).toBe('CL-INJ-001');
      expect(result.name).toBe('Injection Machine – Monthly Maintenance');
      expect(result.equipmentGroupId).toBe('injection');
      expect(result.machineType).toBe('Injection Molding Machine');
      expect(result.cycle).toBe('monthly');
      expect(result.status).toBe('active');
      expect(result.version).toBe(1);
      expect(result.notes).toBe('Test notes');
      expect(result.items).toHaveLength(1);
    });

    it('should extract equipment group from CNC category', () => {
      const cncEquipment: Equipment = {
        ...mockEquipment,
        category: 'CNC Machining Center',
      };

      const template = {
        ...mockAPITemplate,
        equipment: cncEquipment,
      };

      const result = mapChecklistTemplateFromAPI(template);
      expect(result.equipmentGroupId).toBe('mold-manufacturing');
    });

    it('should handle missing equipment gracefully', () => {
      const template = {
        ...mockAPITemplate,
        equipment: undefined,
      };

      const result = mapChecklistTemplateFromAPI(template);
      expect(result.equipmentGroupId).toBe('unknown');
      expect(result.machineType).toBe('Unknown');
    });

    it('should convert different status enums correctly', () => {
      const draftTemplate = { ...mockAPITemplate, status: ChecklistStatus.DRAFT };
      expect(mapChecklistTemplateFromAPI(draftTemplate).status).toBe('draft');

      const inactiveTemplate = { ...mockAPITemplate, status: ChecklistStatus.INACTIVE };
      expect(mapChecklistTemplateFromAPI(inactiveTemplate).status).toBe('inactive');
    });

    it('should convert different cycle enums correctly', () => {
      const dailyTemplate = { ...mockAPITemplate, cycle: ChecklistCycle.DAILY };
      expect(mapChecklistTemplateFromAPI(dailyTemplate).cycle).toBe('daily');

      const weeklyTemplate = { ...mockAPITemplate, cycle: ChecklistCycle.WEEKLY };
      expect(mapChecklistTemplateFromAPI(weeklyTemplate).cycle).toBe('weekly');

      const quarterlyTemplate = { ...mockAPITemplate, cycle: ChecklistCycle.QUARTERLY };
      expect(mapChecklistTemplateFromAPI(quarterlyTemplate).cycle).toBe('quarterly');
    });
  });

  describe('mapChecklistItemToAPI', () => {
    it('should map UI item to API format', () => {
      const uiItem: UIChecklistItem = {
        id: 'item-001',
        order: 1,
        maintenanceTask: 'Check engine',
        standard: 'No abnormal sound',
        method: 'Visual inspection',
        content: 'Inspect engine',
        expectedResult: 'OK',
        isRequired: true,
        requiresImage: true,
      };

      const result = mapChecklistItemToAPI(uiItem);

      expect(result).toEqual({
        order: 1,
        maintenanceTask: 'Check engine',
        judgmentStandard: 'No abnormal sound',
        inspectionMethod: 'Visual inspection',
        maintenanceContent: 'Inspect engine',
        expectedResult: 'OK',
        isRequired: true,
        requiresImage: true,
        requiresNote: false,
      });
    });

    it('should convert empty strings to null', () => {
      const uiItem: UIChecklistItem = {
        id: 'item-002',
        order: 2,
        maintenanceTask: 'Basic check',
        standard: '',
        method: '',
        content: '',
        expectedResult: '',
        isRequired: false,
        requiresImage: false,
      };

      const result = mapChecklistItemToAPI(uiItem);

      expect(result.judgmentStandard).toBeNull();
      expect(result.inspectionMethod).toBeNull();
      expect(result.maintenanceContent).toBeNull();
      expect(result.expectedResult).toBeNull();
    });
  });

  describe('convertCycleToAPI', () => {
    it('should convert UI cycle strings to API enums', () => {
      expect(convertCycleToAPI('daily')).toBe(ChecklistCycle.DAILY);
      expect(convertCycleToAPI('weekly')).toBe(ChecklistCycle.WEEKLY);
      expect(convertCycleToAPI('monthly')).toBe(ChecklistCycle.MONTHLY);
      expect(convertCycleToAPI('quarterly')).toBe(ChecklistCycle.QUARTERLY);
      expect(convertCycleToAPI('yearly')).toBe(ChecklistCycle.YEARLY);
    });

    it('should default to MONTHLY for unknown values', () => {
      expect(convertCycleToAPI('unknown')).toBe(ChecklistCycle.MONTHLY);
    });
  });

  describe('convertStatusToAPI', () => {
    it('should convert UI status strings to API enums', () => {
      expect(convertStatusToAPI('draft')).toBe(ChecklistStatus.DRAFT);
      expect(convertStatusToAPI('active')).toBe(ChecklistStatus.ACTIVE);
      expect(convertStatusToAPI('inactive')).toBe(ChecklistStatus.INACTIVE);
    });

    it('should default to DRAFT for unknown values', () => {
      expect(convertStatusToAPI('unknown')).toBe(ChecklistStatus.DRAFT);
    });
  });
});
