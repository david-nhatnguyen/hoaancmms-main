import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersApi } from "@/api/endpoints/users.api";

/**
 * Mutation hook for assigning a user to a role.
 * Calls PATCH /users/:userId/role with the target roleId.
 *
 * On success: invalidates the role-users cache so the user list refreshes.
 */
export function useAssignUserRole(roleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) => usersApi.assignRole(userId, roleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["role-users", roleId] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Đã gán người dùng vào vai trò thành công");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message ?? "Có lỗi xảy ra khi gán vai trò";
      toast.error(message);
    },
  });
}
