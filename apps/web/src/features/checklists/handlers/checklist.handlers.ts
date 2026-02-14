import { useNavigate } from 'react-router-dom';
import { useTemplateActions } from '../hooks/useTemplateActions';

export const createChecklistHandlers = (
  navigate: ReturnType<typeof useNavigate>,
  actions: ReturnType<typeof useTemplateActions>
) => {
  const handleGoBack = () => {
    navigate('/checklists');
  };

  const handleEdit = (id: string) => {
    navigate(`/checklists/${id}/edit`);
  };

  const handleCopy = (id: string) => {
    actions.duplicate.mutate(id, {
      onSuccess: (newTemplate) => {
        navigate(`/checklists/${newTemplate.id}`);
      },
    });
  };

  const handleDeactivate = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn ngừng sử dụng bản checklist này?')) {
      actions.deactivate.mutate(id);
    }
  };

  return {
    handleGoBack,
    handleEdit,
    handleCopy,
    handleDeactivate,
  };
};
