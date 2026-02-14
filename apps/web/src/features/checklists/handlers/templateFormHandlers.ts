import {
  type CreateTemplateDto,
  type CreateTemplateItemDto,
  type Equipment,

  ChecklistCycle,
  ChecklistStatus,
} from '../types/checklist.types';

/**
 * Form data interface matching new schema
 */
export interface TemplateFormData {
  name: string;
  description?: string;
  
  // NEW: Equipment (REQUIRED)
  equipmentId: string;
  equipment?: Equipment | null;
  

  
  // NEW: Department (OPTIONAL)
  department?: string;
  

  
  cycle: ChecklistCycle;
  status?: ChecklistStatus;
  notes?: string;
  items: CreateTemplateItemDto[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export const validateTemplateForm = (
  data: TemplateFormData
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Name is required
  if (!data.name || data.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Tên checklist không được để trống',
    });
  }

  // Equipment is REQUIRED
  if (!data.equipmentId || data.equipmentId.trim().length === 0) {
    errors.push({
      field: 'equipmentId',
      message: 'Vui lòng chọn thiết bị',
    });
  }

  // Cycle is required
  if (!data.cycle) {
    errors.push({
      field: 'cycle',
      message: 'Chu kỳ không được để trống',
    });
  }

  // Items validation
  if (!data.items || data.items.length === 0) {
    errors.push({
      field: 'items',
      message: 'Checklist phải có ít nhất 1 hạng mục',
    });
  } else {
    // Validate each item
    data.items.forEach((item, index) => {
      if (!item.maintenanceTask || item.maintenanceTask.trim().length === 0) {
        errors.push({
          field: `items[${index}].maintenanceTask`,
          message: `Hạng mục ${index + 1}: Nội dung bảo dưỡng không được để trống`,
        });
      }
    });
  }

  return errors;
};

/**
 * Transform form data to DTO for API
 */
export const transformFormToDto = (
  data: TemplateFormData
): CreateTemplateDto => {
  return {
    name: data.name.trim(),
    description: data.description?.trim() || undefined,
    equipmentId: data.equipmentId.trim(), // REQUIRED
    department: data.department?.trim() || undefined,

    cycle: data.cycle,
    status: data.status || ChecklistStatus.DRAFT,
    notes: data.notes?.trim() || undefined,
    items: data.items.map((item, index) => ({
      order: index + 1, // Recalculate order based on position
      maintenanceTask: item.maintenanceTask.trim(),
      judgmentStandard: item.judgmentStandard?.trim() || undefined,
      inspectionMethod: item.inspectionMethod?.trim() || undefined,
      maintenanceContent: item.maintenanceContent?.trim() || undefined,
      expectedResult: item.expectedResult?.trim() || undefined,
      isRequired: item.isRequired ?? false,
      requiresImage: item.requiresImage ?? false,
      requiresNote: item.requiresNote ?? false,
    })),
  };
};

/**
 * Calculate item order when adding/removing items
 */
export const recalculateItemOrder = (
  items: CreateTemplateItemDto[]
): CreateTemplateItemDto[] => {
  return items.map((item, index) => ({
    ...item,
    order: index + 1,
  }));
};

/**
 * Create an empty item with the next order number
 */
export const createEmptyItem = (
  currentItems: CreateTemplateItemDto[]
): CreateTemplateItemDto => {
  const nextOrder = currentItems.length + 1;
  return {
    order: nextOrder,
    maintenanceTask: '',
    judgmentStandard: '',
    inspectionMethod: '',
    maintenanceContent: '',
    expectedResult: '',
    isRequired: false,
    requiresImage: false,
    requiresNote: false,
  };
};

/**
 * Move item up in the list
 */
export const moveItemUp = (
  items: CreateTemplateItemDto[],
  index: number
): CreateTemplateItemDto[] => {
  if (index === 0) return items; // Already at top
  const newItems = [...items];
  [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
  return recalculateItemOrder(newItems);
};

/**
 * Move item down in the list
 */
export const moveItemDown = (
  items: CreateTemplateItemDto[],
  index: number
): CreateTemplateItemDto[] => {
  if (index === items.length - 1) return items; // Already at bottom
  const newItems = [...items];
  [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
  return recalculateItemOrder(newItems);
};

/**
 * Remove item from the list
 */
export const removeItem = (
  items: CreateTemplateItemDto[],
  index: number
): CreateTemplateItemDto[] => {
  const newItems = items.filter((_, i) => i !== index);
  return recalculateItemOrder(newItems);
};
