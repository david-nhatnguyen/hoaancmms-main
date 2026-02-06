import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Chỉnh sửa Nhà máy' : 'Thêm Nhà máy mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Cập nhật thông tin nhà máy. Nhấn lưu khi hoàn tất.'
              : 'Nhập thông tin nhà máy mới. Nhấn thêm mới khi hoàn tất.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <FactoryFormFields 
            form={form} 
            onSave={handleSave} 
            isSaving={isSaving} 
            hideActions={true} 
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={closeDialog}
            disabled={isSaving}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!canSubmit || isSaving}
            loading={isSaving}
          >
            {isEditMode ? 'Lưu' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
