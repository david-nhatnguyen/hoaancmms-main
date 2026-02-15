
import { UseFormReturn } from 'react-hook-form';

import { ChecklistFormValues } from './useChecklistForm';
import { useMediaQuery } from '@/hooks/use-media-query';

export const useChecklistItemsTable = (
  form: UseFormReturn<ChecklistFormValues>,
  remove: (index: number) => void,
  move: (from: number, to: number) => void,
  fields: any[]
) => {
  const isMobile = useMediaQuery("(max-width: 1024px)");


  const handleRemove = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      move(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < fields.length - 1) {
      move(index, index + 1);
    }
  };

  return {
    isMobile,
    handleRemove,
    handleMoveUp,
    handleMoveDown
  };
};
