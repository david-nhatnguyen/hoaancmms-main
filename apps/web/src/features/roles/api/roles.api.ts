import { apiClient } from '@/api/client';
import type {
  Role,
  RoleStats,
  PermissionModule,
  RoleUser,
  CreateRolePayload,
  UpdateRolePayload,
  PermissionPayload,
} from '../types/role.types';

export interface CreateModulePayload {
  id: string;
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateModulePayload {
  name?: string;
  description?: string;
  sortOrder?: number;
}

export interface PermissionModuleWithCount extends PermissionModule {
  _count?: { permissions: number };
}

/**
 * Roles API
 *
 * Wraps all /roles endpoints from the NestJS backend.
 *
 * Endpoints:
 *  GET   /roles               → Role[]
 *  GET   /roles/stats         → RoleStats
 *  GET   /roles/modules       → PermissionModule[]
 *  GET   /roles/:id           → Role
 *  GET   /roles/:id/users     → RoleUser[]
 *  POST  /roles               → Role
 *  PATCH /roles/:id           → Role
 *  PATCH /roles/:id/permissions → Role
 *  DELETE /roles/:id          → { message: string }
 */
export const rolesApi = {
  /** List all roles with permission details and user count */
  getAll: async (): Promise<Role[]> => {
    const res = await apiClient.get('/roles');
    return (res as any).data;
  },

  /** Role statistics (total / system / custom) */
  getStats: async (): Promise<RoleStats> => {
    const res = await apiClient.get('/roles/stats');
    return (res as any).data;
  },

  /** All permission modules defined in DB */
  getModules: async (): Promise<PermissionModuleWithCount[]> => {
    const res = await apiClient.get('/roles/modules');
    return (res as any).data;
  },

  /** Create a new permission module */
  createModule: async (payload: CreateModulePayload): Promise<PermissionModule> => {
    const res = await apiClient.post('/roles/modules', payload);
    return (res as any).data;
  },

  /** Update a permission module */
  updateModule: async (id: string, payload: UpdateModulePayload): Promise<PermissionModule> => {
    const res = await apiClient.patch(`/roles/modules/${id}`, payload);
    return (res as any).data;
  },

  /** Delete a permission module */
  removeModule: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/roles/modules/${id}`);
    return (res as any).data;
  },

  /** Single role by ID */
  getById: async (id: string): Promise<Role> => {
    const res = await apiClient.get(`/roles/${id}`);
    return (res as any).data;
  },

  /** Users belonging to this role */
  getRoleUsers: async (roleId: string): Promise<RoleUser[]> => {
    const res = await apiClient.get(`/roles/${roleId}/users`);
    return (res as any).data;
  },

  /** Create a new role (with optional initial permissions) */
  create: async (payload: CreateRolePayload): Promise<Role> => {
    const res = await apiClient.post('/roles', payload);
    return (res as any).data;
  },

  /** Update role name / description / permissions */
  update: async (id: string, payload: UpdateRolePayload): Promise<Role> => {
    const res = await apiClient.patch(`/roles/${id}`, payload);
    return (res as any).data;
  },

  /** Replace ALL permissions for a role at once (permission matrix save) */
  updatePermissions: async (id: string, permissions: PermissionPayload[]): Promise<Role> => {
    const res = await apiClient.patch(`/roles/${id}/permissions`, { permissions });
    return (res as any).data;
  },

  /** Delete a role (system roles cannot be deleted) */
  remove: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/roles/${id}`);
    return (res as any).data;
  },
};
