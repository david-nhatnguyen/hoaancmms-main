import { ResponsiveFormSheet } from '@/components/shared/layout/ResponsiveFormSheet';
import type { UseFactoryFormReturn } from '../../hooks/useFactoryForm';
import { FactoryFormFields } from './FactoryFormFields';

// ============================================================================
// TYPES
// ============================================================================

export interface FactoryFormDialogProps {
  form: UseFactoryFormReturn;
  onSave: () => void;
  isSaving?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Factory Form Dialog Component
 * 
 * Renders a dialog for creating or editing a factory
 * 
 * @param form - Form state from useFactoryForm hook
 * @param onSave - Callback when save button is clicked
 * @param isSaving - Whether the form is currently saving
 * 
 * @example
 * ```tsx
 * const form = useFactoryForm();
 * const createFactory = useCreateFactory();
 * 
 * const handleSave = () => {
 *   if (!form.validate()) return;
 *   createFactory.mutate(form.formData, {
 *     onSuccess: () => form.closeDialog()
 *   });
 * };
 * 
 * <FactoryFormDialog 
 *   form={form} 
 *   onSave={handleSave}
 *   isSaving={createFactory.isPending}
 * />
 * ```
 */

export function FactoryFormDialog({ form, onSave, isSaving = false }: FactoryFormDialogProps) {
  const {
    isOpen,
    isEditMode,
    canSubmit,
    closeDialog,
  } = form;

  const handleSave = () => {
    if (!canSubmit || isSaving) return;
    onSave();
  };

  return (
    <ResponsiveFormSheet
      isOpen={isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title={isEditMode ? 'Chỉnh sửa Nhà máy' : 'Thêm Nhà máy mới'}
      description={isEditMode 
        ? 'Cập nhật thông tin nhà máy. Nhấn lưu khi hoàn tất.'
        : 'Nhập thông tin nhà máy mới. Nhấn thêm mới khi hoàn tất.'
      }
    >
      <FactoryFormFields 
        form={form} 
        onSave={handleSave} 
        isSaving={isSaving} 
        onCancel={closeDialog}
      />
    </ResponsiveFormSheet>
  );
}
