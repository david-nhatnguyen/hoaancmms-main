/**
 * System Domain Types
 * These match the backend API response shapes for users, roles, and permissions.
 */

import type { PaginationParams } from "./common.types";

// ─── User ─────────────────────────────────────────────────────────────────────

export type UserStatus = "ACTIVE" | "LOCKED";

export interface User {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  status: UserStatus;
  roleId?: string;
  role?: {
    id: string;
    name: string;
  };
  factoryIds: string[];
  forcePasswordChange: boolean;
  lastLoginAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  total: number;
  active: number;
  locked: number;
}

export interface UserQueryParams extends PaginationParams {
  search?: string;
  status?: UserStatus;
  roleId?: string;
}

export interface CreateUserDto {
  username: string;
  password: string;
  fullName: string;
  email?: string;
  phone?: string;
  roleId?: string;
  factoryIds?: string[];
  notes?: string;
  forcePasswordChange?: boolean;
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  phone?: string;
  roleId?: string | null;
  factoryIds?: string[];
  notes?: string;
  forcePasswordChange?: boolean;
}
