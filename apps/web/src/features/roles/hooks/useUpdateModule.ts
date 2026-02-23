import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { rolesApi, type UpdateModulePayload } from '../api/roles.api';

export function useUpdateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateModulePayload }) =>
      rolesApi.updateModule(id, payload),
    onSuccess: (mod) => {
      queryClient.invalidateQueries({ queryKey: ['role-modules'] });
      toast.success(`Đã cập nhật module "${mod.name}"`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Có lỗi xảy ra khi cập nhật module');
    },
  });
}
