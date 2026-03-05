import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rolesApi } from "../api/roles.api";
import type { UpdateRolePayload } from "../types/role.types";

/**
 * Mutation hook for updating an existing role.
 * On success: invalidates both the list and the individual role cache.
 */
export function useUpdateRole(roleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRolePayload) => rolesApi.update(roleId, payload),
    onSuccess: (updatedRole) => {
      // Invalidate list and single-role caches
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role", roleId] });
      toast.success(`Đã cập nhật vai trò "${updatedRole.name}" thành công`);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ?? "Có lỗi xảy ra khi cập nhật vai trò. Vui lòng thử lại.";
      toast.error(message);
    },
  });
}
