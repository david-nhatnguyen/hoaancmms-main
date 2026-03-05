import { useQuery } from "@tanstack/react-query";
import { rolesApi } from "../api/roles.api";

/**
 * Fetches all users that belong to a specific role.
 * Used by RoleDetail to show the users list panel.
 */
export function useRoleUsers(roleId: string | undefined) {
  return useQuery({
    queryKey: ["role-users", roleId],
    queryFn: () => rolesApi.getRoleUsers(roleId!),
    enabled: !!roleId,
    staleTime: 60 * 1000,
  });
}
