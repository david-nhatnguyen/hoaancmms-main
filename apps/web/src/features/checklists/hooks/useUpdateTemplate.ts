
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistTemplatesApi } from '@/features/checklists/api/checklist-templates.api';
import { UpdateTemplateDto } from '@/features/checklists/types/checklist.types';

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { id: string; data: UpdateTemplateDto }) =>
      checklistTemplatesApi.update(variables.id, variables.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      queryClient.invalidateQueries({ queryKey: ['checklist-template', data.data.id] });
    },
  });
};
