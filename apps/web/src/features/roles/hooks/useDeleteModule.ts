import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { rolesApi } from '../api/roles.api';

export function useDeleteModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rolesApi.removeModule(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['role-modules'] });
      toast.success(res.message);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Có lỗi xảy ra khi xóa module');
    },
  });
}
