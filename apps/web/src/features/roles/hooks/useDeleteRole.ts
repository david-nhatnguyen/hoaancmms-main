import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rolesApi } from "../api/roles.api";

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rolesApi.remove(id),
    onSuccess: (_, deletedId) => {
      // Refresh the roles list
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      // Clean up cache
      queryClient.removeQueries({ queryKey: ["roles", deletedId] });
      // Refresh stats
      queryClient.invalidateQueries({ queryKey: ["roles", "stats"] });

      toast.success("Đã xóa vai trò thành công");
    },
    onError: (error: any) => {
      console.error("Failed to delete role:", error);
      toast.error(error.message || "Không thể xóa vai trò này. Vui lòng kiểm tra lại.");
    },
  });
};
