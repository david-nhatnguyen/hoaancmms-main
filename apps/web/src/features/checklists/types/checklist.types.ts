// TypeScript types matching the backend API schema

export enum ChecklistCycle {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUALLY = 'SEMI_ANNUALLY',
  YEARLY = 'YEARLY',
}

export enum ChecklistStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum ChecklistExecutionStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  FAILED = 'FAILED',
}

// Equipment (simplified for templates)
export interface Equipment {
  id: string;
  code: string;
  name: string;
  category: string;
  status: string;
  brand?: string | null;
  origin?: string | null;
  factoryId?: string | null;
}

// User (simplified for templates)
export interface User {
  id: string;
  username: string;
  fullName: string;
  role?: string;
}

// Template Item
export interface ChecklistTemplateItem {
  id: string;
  templateId: string;
  order: number;

  // Item content (from Excel)
  maintenanceTask: string;
  judgmentStandard?: string | null;
  inspectionMethod?: string | null;
  maintenanceContent?: string | null;
  expectedResult?: string | null;

  // Constraints
  isRequired: boolean;
  requiresImage: boolean;
  requiresNote: boolean;

  createdAt: string;
  updatedAt: string;
}

// Template
export interface ChecklistTemplate {
  id: string;
  code: string;
  name: string;
  description?: string | null;

  // Equipment relationship (REQUIRED)
  equipmentId: string;
  equipment?: Equipment;

  // Assigned User (OPTIONAL)
  assignedUserId?: string | null;
  assignedUser?: User | null;

  // Department (OPTIONAL)
  department?: string | null;

  // Maintenance Start Date (OPTIONAL)
  maintenanceStartDate?: string | null;

  // Scheduling
  cycle: ChecklistCycle;

  // Versioning
  version: number;
  status: ChecklistStatus;

  // Metadata
  notes?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;

  // Relationships
  items: ChecklistTemplateItem[];
  _count?: {
    equipmentAssignments: number;
    executions: number;
  };
}

// DTOs for API requests
export interface CreateTemplateItemDto {
  order: number;
  maintenanceTask: string;
  judgmentStandard?: string;
  inspectionMethod?: string;
  maintenanceContent?: string;
  expectedResult?: string;
  isRequired?: boolean;
  requiresImage?: boolean;
  requiresNote?: boolean;
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  equipmentId: string; // REQUIRED
  assignedUserId?: string; // OPTIONAL
  department?: string; // OPTIONAL
  maintenanceStartDate?: string; // OPTIONAL (ISO string)
  cycle: ChecklistCycle;
  status?: ChecklistStatus;
  notes?: string;
  items: CreateTemplateItemDto[];
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> {}

// Query parameters
export interface QueryTemplateParams {
  status?: ChecklistStatus;
  cycle?: ChecklistCycle;
  equipmentId?: string; // NEW: filter by equipment
  assignedUserId?: string; // NEW: filter by assigned user
  search?: string;
  page?: number;
  limit?: number;
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ChecklistTemplateListResponse = PaginatedResponse<ChecklistTemplate>;
export type ChecklistTemplateResponse = ChecklistTemplate;

// Cycle labels for UI
export const CYCLE_LABELS: Record<ChecklistCycle, string> = {
  [ChecklistCycle.DAILY]: 'Ngày',
  [ChecklistCycle.WEEKLY]: 'Tuần',
  [ChecklistCycle.MONTHLY]: 'Tháng',
  [ChecklistCycle.QUARTERLY]: 'Quý',
  [ChecklistCycle.SEMI_ANNUALLY]: '6 tháng',
  [ChecklistCycle.YEARLY]: 'Năm',
};

// Status labels for UI
export const STATUS_LABELS: Record<ChecklistStatus, string> = {
  [ChecklistStatus.DRAFT]: 'Nháp',
  [ChecklistStatus.ACTIVE]: 'Áp dụng',
  [ChecklistStatus.INACTIVE]: 'Ngừng sử dụng',
};

// Helper to convert old mock data format to new format (for migration)
export const convertLegacyCycle = (cycle: string): ChecklistCycle => {
  const mapping: Record<string, ChecklistCycle> = {
    daily: ChecklistCycle.DAILY,
    weekly: ChecklistCycle.WEEKLY,
    monthly: ChecklistCycle.MONTHLY,
    quarterly: ChecklistCycle.QUARTERLY,
    yearly: ChecklistCycle.YEARLY,
  };
  return mapping[cycle] || ChecklistCycle.MONTHLY;
};

export const convertLegacyStatus = (status: string): ChecklistStatus => {
  const mapping: Record<string, ChecklistStatus> = {
    draft: ChecklistStatus.DRAFT,
    active: ChecklistStatus.ACTIVE,
    inactive: ChecklistStatus.INACTIVE,
  };
  return mapping[status] || ChecklistStatus.DRAFT;
};
