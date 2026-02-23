import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '../api/roles.api';

/**
 * Fetches a single role by ID.
 * Used by both RoleDetail (read-only) and RoleForm (populate edit form).
 */
export function useRole(id: string | undefined) {
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => rolesApi.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}
