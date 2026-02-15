import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import type { UseFactoryFormReturn } from '../../hooks/useFactoryForm';
import { FactoryFormField } from './FactoryFormField';
import { FactoryFormActions } from './FactoryFormActions';

export interface FactoryFormFieldsProps {
  form: UseFactoryFormReturn;
  onSave: () => void;
  isSaving?: boolean;
  onCancel?: () => void;
  hideActions?: boolean;
}

/**
 * Factory Form Fields Component
 * 
 * Reusable form fields for factory creation/editing.
 * Split into smaller components following Atomic Design.
 */
export function FactoryFormFields({ 
  form, 
  onSave, 
  isSaving = false, 
  onCancel, 
  hideActions = false 
}: FactoryFormFieldsProps) {
  const isMobile = useIsMobile();

  const {
    isEditMode,
    formData,
    errors,
    canSubmit,
    updateField,
  } = form;

  const handleSave = () => {
    if (!canSubmit || isSaving) return;
    onSave();
  };

  return (
    <div className="flex flex-col h-full">
      <form 
        className="grid gap-5 py-2 pb-10"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        {/* Code Field */}
        <FactoryFormField
          id="code"
          label="Mã nhà máy"
          error={errors.code}
          required
        >
          <Input
            id="code"
            placeholder="VD: F01, F02..."
            value={formData.code}
            onChange={(e) => updateField('code', e.target.value)}
            disabled={isSaving}
            autoFocus={!isMobile}
            className={isMobile ? "h-12 text-base" : ""}
          />
        </FactoryFormField>

        {/* Name Field */}
        <FactoryFormField
          id="name"
          label="Tên nhà máy"
          error={errors.name}
          required
        >
          <Input
            id="name"
            placeholder="Nhập tên nhà máy"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            disabled={isSaving}
            className={isMobile ? "h-12 text-base" : ""}
          />
        </FactoryFormField>

        {/* Location Field */}
        <FactoryFormField
          id="location"
          label="Địa điểm"
          error={errors.location}
        >
          <Input
            id="location"
            placeholder="Nhập địa điểm (không bắt buộc)"
            value={formData.location}
            onChange={(e) => updateField('location', e.target.value)}
            disabled={isSaving}
            className={isMobile ? "h-12 text-base" : ""}
          />
        </FactoryFormField>

        {/* Status Field (Only in Edit Mode) */}
        {isEditMode && (
          <FactoryFormField
            id="status"
            label="Trạng thái"
            error={errors.status}
          >
            <Select
              value={formData.status?.toUpperCase()}
              onValueChange={(value) => updateField('status', value)}
              disabled={isSaving}
            >
              <SelectTrigger className={isMobile ? "h-12 text-base" : ""}>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent className="z-[70]">
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </FactoryFormField>
        )}

        {/* Action Buttons */}
        {!hideActions && (
          <FactoryFormActions
            onSave={handleSave}
            onCancel={onCancel}
            isSaving={isSaving}
            canSubmit={canSubmit}
            isEditMode={isEditMode}
            isMobile={isMobile}
          />
        )}
      </form>
    </div>
  );
}
