/**
 * Role Feature Types
 * Matches the backend RolesService.transformRole() output shape.
 */

export interface RolePermission {
  moduleId: string;
  moduleName: string;
  moduleDescription?: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canApprove: boolean;
  canLock: boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  userCount: number;
  permissions: RolePermission[];
  createdAt: string;
  updatedAt: string;
}

export interface PermissionModule {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
}

export interface RoleUser {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  status: 'ACTIVE' | 'LOCKED';
  lastLoginAt?: string;
  factoryIds: string[];
}

export interface RoleStats {
  total: number;
  system: number;
  custom: number;
}

// DTO shapes sent to the API

export interface PermissionPayload {
  moduleId: string;
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  canApprove?: boolean;
  canLock?: boolean;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions?: PermissionPayload[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissions?: PermissionPayload[];
}
