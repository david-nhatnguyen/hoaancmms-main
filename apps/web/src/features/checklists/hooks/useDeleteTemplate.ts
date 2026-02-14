import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { checklistTemplatesApi } from '../api/checklist-templates.api';

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => checklistTemplatesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast.success('Đã xóa checklist thành công');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Không thể xóa checklist'
      );
    },
  });
};
