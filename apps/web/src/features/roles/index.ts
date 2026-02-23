// Types
export type {
  Role,
  RolePermission,
  PermissionModule,
  RoleUser,
  RoleStats,
  PermissionPayload,
  CreateRolePayload,
  UpdateRolePayload,
} from './types/role.types';

// API
export { rolesApi } from './api/roles.api';

// Query hooks
export { useRole } from './hooks/useRole';
export { useRoleModules } from './hooks/useRoleModules';
export { useRoleUsers } from './hooks/useRoleUsers';
export { useUserSearch } from './hooks/useUserSearch';

// Mutation hooks
export { useCreateRole } from './hooks/useCreateRole';
export { useUpdateRole } from './hooks/useUpdateRole';
export { useAssignUserRole } from './hooks/useAssignUserRole';
// Module CRUD hooks
export { useCreateModule } from './hooks/useCreateModule';
export { useUpdateModule } from './hooks/useUpdateModule';
export { useDeleteModule } from './hooks/useDeleteModule';
