/**
 * Data Mapper for Checklist Templates
 * Transforms between API schema and UI-friendly format
 */

import {
  ChecklistTemplate as APIChecklistTemplate,
  ChecklistTemplateItem as APIChecklistTemplateItem,
  Equipment,
  ChecklistCycle,
  ChecklistStatus,
} from '../types/checklist.types';

// UI-friendly types (matching mock data structure)
export interface UIChecklistItem {
  id: string;
  order: number;
  maintenanceTask: string;
  standard: string;          // Maps from judgmentStandard
  method: string;            // Maps from inspectionMethod
  content: string;           // Maps from maintenanceContent
  expectedResult: string;
  isRequired: boolean;
  requiresImage: boolean;
}

export interface UIChecklistTemplate {
  id: string;
  code: string;
  name: string;
  equipmentGroupId: string;  // Extracted from equipment.category
  machineType: string;       // Extracted from equipment.category
  cycle: string;             // Lowercase string
  version: number;
  status: string;            // Lowercase string
  notes?: string;
  items: UIChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Map API ChecklistTemplateItem to UI ChecklistItem
 */
export const mapChecklistItemFromAPI = (
  apiItem: APIChecklistTemplateItem
): UIChecklistItem => {
  return {
    id: apiItem.id,
    order: apiItem.order,
    maintenanceTask: apiItem.maintenanceTask,
    standard: apiItem.judgmentStandard || '',
    method: apiItem.inspectionMethod || '',
    content: apiItem.maintenanceContent || '',
    expectedResult: apiItem.expectedResult || '',
    isRequired: apiItem.isRequired,
    requiresImage: apiItem.requiresImage,
  };
};

/**
 * Map API ChecklistTemplate to UI ChecklistTemplate
 */
export const mapChecklistTemplateFromAPI = (
  apiData: APIChecklistTemplate
): UIChecklistTemplate => {
  // Extract equipment group ID from equipment relation
  const equipmentGroupId = extractEquipmentGroupId(apiData.equipment);
  const machineType = apiData.equipment?.category || 'Unknown';

  // Convert enums to lowercase strings for UI compatibility
  const cycle = convertCycleToUI(apiData.cycle);
  const status = convertStatusToUI(apiData.status);

  return {
    id: apiData.id,
    code: apiData.code,
    name: apiData.name,
    equipmentGroupId,
    machineType,
    cycle,
    version: apiData.version,
    status,
    notes: apiData.notes || undefined,
    items: apiData.items.map(mapChecklistItemFromAPI),
    createdAt: formatDate(apiData.createdAt),
    updatedAt: formatDate(apiData.updatedAt),
  };
};

/**
 * Map UI ChecklistItem to API format (for create/update)
 */
export const mapChecklistItemToAPI = (
  uiItem: UIChecklistItem
): Omit<APIChecklistTemplateItem, 'id' | 'templateId' | 'createdAt' | 'updatedAt'> => {
  return {
    order: uiItem.order,
    maintenanceTask: uiItem.maintenanceTask,
    judgmentStandard: uiItem.standard || null,
    inspectionMethod: uiItem.method || null,
    maintenanceContent: uiItem.content || null,
    expectedResult: uiItem.expectedResult || null,
    isRequired: uiItem.isRequired,
    requiresImage: uiItem.requiresImage,
    requiresNote: false, // Default value
  };
};

// ==========================================
// Helper Functions
// ==========================================

/**
 * Extract equipment group ID from equipment category
 * Maps category to mock equipmentGroupId
 */
const extractEquipmentGroupId = (equipment?: Equipment): string => {
  if (!equipment) return 'unknown';
  
  const category = equipment.category.toLowerCase();
  
  // Map category to equipmentGroupId based on keywords
  if (category.includes('injection') || category.includes('ép nhựa')) {
    return 'injection';
  }
  if (category.includes('cnc') || category.includes('mold') || category.includes('khuôn')) {
    return 'mold-manufacturing';
  }
  
  // Default to using category as-is
  return category.replace(/\s+/g, '-').toLowerCase();
};

/**
 * Convert API ChecklistCycle enum to UI lowercase string
 */
const convertCycleToUI = (cycle: ChecklistCycle): string => {
  const mapping: Record<ChecklistCycle, string> = {
    [ChecklistCycle.DAILY]: 'daily',
    [ChecklistCycle.WEEKLY]: 'weekly',
    [ChecklistCycle.MONTHLY]: 'monthly',
    [ChecklistCycle.QUARTERLY]: 'quarterly',
    [ChecklistCycle.SEMI_ANNUALLY]: 'semi-annually',
    [ChecklistCycle.YEARLY]: 'yearly',
  };
  return mapping[cycle] || 'monthly';
};

/**
 * Convert API ChecklistStatus enum to UI lowercase string
 */
const convertStatusToUI = (status: ChecklistStatus): string => {
  const mapping: Record<ChecklistStatus, string> = {
    [ChecklistStatus.DRAFT]: 'draft',
    [ChecklistStatus.ACTIVE]: 'active',
    [ChecklistStatus.INACTIVE]: 'inactive',
  };
  return mapping[status] || 'draft';
};

/**
 * Convert UI cycle string to API ChecklistCycle enum
 */
export const convertCycleToAPI = (cycle: string): ChecklistCycle => {
  const mapping: Record<string, ChecklistCycle> = {
    'daily': ChecklistCycle.DAILY,
    'weekly': ChecklistCycle.WEEKLY,
    'monthly': ChecklistCycle.MONTHLY,
    'quarterly': ChecklistCycle.QUARTERLY,
    'semi-annually': ChecklistCycle.SEMI_ANNUALLY,
    'yearly': ChecklistCycle.YEARLY,
  };
  return mapping[cycle] || ChecklistCycle.MONTHLY;
};

/**
 * Convert UI status string to API ChecklistStatus enum
 */
export const convertStatusToAPI = (status: string): ChecklistStatus => {
  const mapping: Record<string, ChecklistStatus> = {
    'draft': ChecklistStatus.DRAFT,
    'active': ChecklistStatus.ACTIVE,
    'inactive': ChecklistStatus.INACTIVE,
  };
  return mapping[status] || ChecklistStatus.DRAFT;
};

/**
 * Format date to simple string format (YYYY-MM-DD)
 */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch {
    return dateString;
  }
};
