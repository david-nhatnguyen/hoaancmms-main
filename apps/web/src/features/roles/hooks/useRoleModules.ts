import { useQuery } from "@tanstack/react-query";
import { rolesApi } from "../api/roles.api";

/**
 * Fetches all permission modules from the backend.
 * Replaces the static PERMISSION_MODULES constant from systemData.ts.
 *
 * These are used to render the permission matrix rows in RoleForm and RoleDetail.
 */
export function useRoleModules() {
  return useQuery({
    queryKey: ["role-modules"],
    queryFn: () => rolesApi.getModules(),
    // Modules rarely change — cache for 10 minutes
    staleTime: 10 * 60 * 1000,
  });
}
