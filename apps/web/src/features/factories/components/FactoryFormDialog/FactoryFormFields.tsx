import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UseFactoryFormReturn } from '../../hooks/useFactoryForm';

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
 * Reusable form fields for factory creation/editing
 * Can be used in Dialog, Drawer, or standalone
 */
export function FactoryFormFields({ form, onSave, isSaving = false, onCancel, hideActions = false }: FactoryFormFieldsProps) {

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canSubmit && !isSaving) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <>
      {/* Form Fields */}
      <div className="grid gap-4">
        {/* Code Field */}
        <div className="grid gap-2">
          <Label htmlFor="code" className="text-sm font-medium">
            Mã nhà máy <span className="text-destructive">*</span>
          </Label>
          <Input
            id="code"
            placeholder="VD: F01, F02..."
            value={formData.code}
            onChange={(e) => updateField('code', e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            className={errors.code ? 'border-destructive' : ''}
            autoFocus
          />
          {errors.code && (
            <p className="text-sm text-destructive">{errors.code}</p>
          )}
        </div>

        {/* Name Field */}
        <div className="grid gap-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Tên nhà máy <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Nhập tên nhà máy"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Location Field */}
        <div className="grid gap-2">
          <Label htmlFor="location" className="text-sm font-medium">
            Địa điểm
          </Label>
          <Input
            id="location"
            placeholder="Nhập địa điểm (không bắt buộc)"
            value={formData.location}
            onChange={(e) => updateField('location', e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            className={errors.location ? 'border-destructive' : ''}
          />
          {errors.location && (
            <p className="text-sm text-destructive">{errors.location}</p>
          )}
        </div>

        {/* Status Field (Only in Edit Mode) */}
        {isEditMode && (
          <div className="grid gap-2">
            <Label className="text-sm font-medium">
              Trạng thái
            </Label>
            <Select
              value={formData.status?.toUpperCase()}
              onValueChange={(value) => updateField('status', value)}
              disabled={isSaving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent className="z-[70]">
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status}</p>
            )}
          </div>
        )}
      </div>


      {!hideActions && (
        <div className="flex gap-2 mt-6">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1"
            >
              Hủy
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={!canSubmit || isSaving}
            className="flex-1"
          >
            {isSaving && <span className="mr-2">⏳</span>}
            {isEditMode ? 'Lưu' : 'Thêm mới'}
          </Button>
        </div>
      )}
    </>
  );
}
