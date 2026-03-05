import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rolesApi } from "../api/roles.api";
import type { CreateRolePayload } from "../types/role.types";

/**
 * Mutation hook for creating a new role.
 * On success: invalidates the roles list cache and shows a toast.
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => rolesApi.create(payload),
    onSuccess: (newRole) => {
      // Invalidate the roles list so any list page re-fetches
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success(`Đã tạo vai trò "${newRole.name}" thành công`);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ?? "Có lỗi xảy ra khi tạo vai trò. Vui lòng thử lại.";
      toast.error(message);
    },
  });
}
