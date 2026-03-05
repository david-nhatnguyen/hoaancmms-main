import { apiClient } from "../client";
import type {
  User,
  UserStats,
  CreateUserDto,
  UpdateUserDto,
  UserQueryParams,
} from "../types/system.types";
import type { ApiResponse, PaginatedResponse } from "../types/common.types";

export const usersApi = {
  /** List with pagination + filters */
  getAll: async (params?: UserQueryParams): Promise<PaginatedResponse<User>> =>
    apiClient.get("/users", { params }),

  /** Stats */
  getStats: async (): Promise<ApiResponse<UserStats>> => apiClient.get("/users/stats"),

  /** Autocomplete search */
  search: async (q: string): Promise<User[]> => apiClient.get("/users/search", { params: { q } }),

  /** Single user */
  getById: async (id: string): Promise<User> => apiClient.get(`/users/${id}`),

  /** Create */
  create: async (data: CreateUserDto): Promise<User> => apiClient.post("/users", data),

  /** Update */
  update: async (id: string, data: UpdateUserDto): Promise<User> =>
    apiClient.patch(`/users/${id}`, data),

  /** Lock account */
  lock: async (id: string): Promise<User> => apiClient.patch(`/users/${id}/lock`),

  /** Unlock account */
  unlock: async (id: string): Promise<User> => apiClient.patch(`/users/${id}/unlock`),

  /** Assign/remove role */
  assignRole: async (id: string, roleId: string | null): Promise<User> =>
    apiClient.patch(`/users/${id}/role`, { roleId }),

  /** Reset password */
  resetPassword: async (id: string, newPassword: string): Promise<{ message: string }> =>
    apiClient.post(`/users/${id}/reset-password`, { newPassword }),

  /** Delete */
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete(`/users/${id}`),
};
