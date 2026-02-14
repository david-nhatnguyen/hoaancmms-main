import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { checklistTemplatesApi } from '../api/checklist-templates.api';

export const useBulkDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => checklistTemplatesApi.bulkDelete(ids),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      
      const { success, failed } = response.data;
      if (failed && failed.length > 0) {
        toast.warning(`Đã xóa ${success.length} checklist. ${failed.length} checklist không thể xóa.`);
      } else {
        toast.success(`Đã xóa ${success.length} checklist thành công`);
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Không thể xóa các checklist đã chọn'
      );
    },
  });
};
