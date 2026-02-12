import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { checklistTemplatesApi } from '../api/checklist-templates.api';

/**
 * Hook for template actions: activate, deactivate, duplicate, delete
 */
export const useTemplateActions = () => {
  const queryClient = useQueryClient();

  const activate = useMutation({
    mutationFn: (id: string) => checklistTemplatesApi.activate(id),
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      queryClient.invalidateQueries({
        queryKey: ['checklist-template', template.id],
      });
      toast.success(`Đã kích hoạt checklist: ${template.code}`);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Không thể kích hoạt checklist'
      );
    },
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => checklistTemplatesApi.deactivate(id),
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      queryClient.invalidateQueries({
        queryKey: ['checklist-template', template.id],
      });
      toast.success(`Đã ngừng sử dụng checklist: ${template.code}`);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Không thể ngừng sử dụng checklist'
      );
    },
  });

  const duplicate = useMutation({
    mutationFn: (id: string) => checklistTemplatesApi.duplicate(id),
    onSuccess: (newTemplate) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast.success('Đã sao chép checklist', {
        description: `Mã mới: ${newTemplate.code}`,
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Không thể sao chép checklist'
      );
    },
  });

  const deleteTemplate = useMutation({
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

  return {
    activate,
    deactivate,
    duplicate,
    deleteTemplate,
  };
};
