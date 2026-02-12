import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { checklistTemplatesApi } from '../api/checklist-templates.api';
import type { CreateTemplateDto } from '../types/checklist.types';

/**
 * Custom hook to create a new checklist template
 * Automatically invalidates the templates list query on success
 */
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTemplateDto) => checklistTemplatesApi.create(data),
    onSuccess: (newTemplate) => {
      // Invalidate and refetch templates list
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });

      toast.success('Tạo checklist thành công', {
        description: `Đã tạo checklist: ${newTemplate.name}`,
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Không thể tạo checklist';
      toast.error('Lỗi tạo checklist', {
        description: message,
      });
    },
  });
};
