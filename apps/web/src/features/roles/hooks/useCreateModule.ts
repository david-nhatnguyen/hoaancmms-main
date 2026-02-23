import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { rolesApi, type CreateModulePayload } from '../api/roles.api';

export function useCreateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateModulePayload) => rolesApi.createModule(payload),
    onSuccess: (mod) => {
      queryClient.invalidateQueries({ queryKey: ['role-modules'] });
      toast.success(`Đã tạo module "${mod.name}"`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Có lỗi xảy ra khi tạo module');
    },
  });
}
