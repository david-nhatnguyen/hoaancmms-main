
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { useCreateTemplate } from '@/features/checklists/hooks/useCreateTemplate';
import { useUpdateTemplate } from '@/features/checklists/hooks/useUpdateTemplate';
import { useChecklistTemplate } from '@/features/checklists/hooks/useChecklistTemplates';
import { transformFormToDto, validateTemplateForm } from '@/features/checklists/handlers/templateFormHandlers';
import { ChecklistCycle, ChecklistStatus } from '@/features/checklists/types/checklist.types';

// ============================================================================
// SCHEMA
// ============================================================================

export const checklistItemSchema = z.object({
  id: z.string().optional(), // For updates
  maintenanceTask: z.string().min(1, 'Nội dung bảo dưỡng không được để trống'),
  judgmentStandard: z.string().default(''),
  inspectionMethod: z.string().default(''),
  maintenanceContent: z.string().default(''),
  expectedResult: z.string().default(''),
  isRequired: z.boolean().default(false),
  requiresImage: z.boolean().default(false),
  order: z.number().default(0),
});

export const checklistFormSchema = z.object({
  name: z.string().min(1, 'Tên checklist không được để trống'),
  description: z.string().optional(),
  equipmentId: z.string().min(1, 'Vui lòng chọn thiết bị'),
  // We keep the full object for display purposes in the UI
  equipment: z.any().optional(),
  department: z.string().optional(),
  cycle: z.nativeEnum(ChecklistCycle),
  status: z.nativeEnum(ChecklistStatus),
  notes: z.string().optional(),
  items: z.array(checklistItemSchema).min(1, 'Checklist phải có ít nhất 1 hạng mục'),
});

export type ChecklistFormValues = z.infer<typeof checklistFormSchema>;

export const defaultValues: ChecklistFormValues = {
  name: '',
  description: '',
  equipmentId: '',
  equipment: null,
  department: '',
  cycle: ChecklistCycle.MONTHLY,
  status: ChecklistStatus.DRAFT,
  notes: '',
  items: [
    {
      maintenanceTask: '',
      judgmentStandard: '',
      inspectionMethod: '',
      maintenanceContent: '',
      expectedResult: '',
      isRequired: false,
      requiresImage: false,
      order: 1,
    },
  ],
};

/**
 * Custom hook for Checklist Form logic
 * Encapsulates form state, validation, and submission logic.
 */
export const useChecklistForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id) && !searchParams.get('copy');
  const isCopying = Boolean(searchParams.get('copy'));
  const [isReady, setIsReady] = useState(!isEditing && !isCopying); // Ready immediately if new

  // API Hooks
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const { data: existingTemplate, isLoading: isLoadingTemplate } = useChecklistTemplate(id || '');

  // Form Initialization
  const form = useForm<ChecklistFormValues>({
    resolver: zodResolver(checklistFormSchema) as any,
    defaultValues,
    mode: 'onChange',
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Load existing data
  useEffect(() => {
    if (existingTemplate && (isEditing || isCopying)) {
      const formData: ChecklistFormValues = {
        name: isCopying ? `${existingTemplate.name} (Copy)` : existingTemplate.name,
        description: existingTemplate.description || '',
        equipmentId: existingTemplate.equipmentId || '',
        equipment: existingTemplate.equipment || null,
        department: existingTemplate.department || '',
        cycle: existingTemplate.cycle,
        status: isCopying ? ChecklistStatus.DRAFT : existingTemplate.status,
        notes: existingTemplate.notes || '',
        items: existingTemplate.items.map((item) => ({
          id: isCopying ? undefined : item.id, // Only keep IDs if editing
          maintenanceTask: item.maintenanceTask,
          judgmentStandard: item.judgmentStandard || '',
          inspectionMethod: item.inspectionMethod || '',
          maintenanceContent: item.maintenanceContent || '',
          expectedResult: item.expectedResult || '',
          isRequired: item.isRequired,
          requiresImage: item.requiresImage,
          order: item.order || 0,
        })),
      };

      if (!existingTemplate.items || existingTemplate.items.length === 0) {
        formData.items = defaultValues.items;
      }

      form.reset(formData);
      setIsReady(true);
    } else if (!id) {
       setIsReady(true);
    }
  }, [existingTemplate, isCopying, isEditing, form, id]);

  /**
   * Submit Handler
   */
  const onSubmit = async (data: ChecklistFormValues) => {
    // 1. Transform basic DTO
    const dto = transformFormToDto(data as any);
    
    // 2. Add IDs for Updated Items if Editing
    // NOTE: Backend deletes all items and recreates them, so valid ID is not required in DTO
    // and actually causes 400 Bad Request because CreateTemplateItemDto does not have 'id'
    /*
    if (isEditing) {
       dto.items = data.items.map((item, index) => ({
         ...dto.items[index], // base properties
         id: item.id // add ID back for reconciliation
       }));
    }
    */

    try {
      if (isEditing && id) {
        await updateTemplate.mutateAsync({ id, data: dto });
        toast.success('Cập nhật checklist thành công');
      } else {
        await createTemplate.mutateAsync(dto);
        toast.success(isCopying ? 'Sao chép checklist thành công' : 'Tạo checklist thành công');
      }
      navigate('/checklists');
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Có lỗi xảy ra khi lưu checklist');
    }
  };

  const handleAddItem = () => {
    append({
      maintenanceTask: '',
      judgmentStandard: '',
      inspectionMethod: '',
      maintenanceContent: '',
      expectedResult: '',
      isRequired: false,
      requiresImage: false,
      order: fields.length + 1,
    });
  };

  return {
    form,
    fields,
    append: handleAddItem,
    remove,
    move,
    onSubmit,
    isEditing,
    isCopying,
    isLoading: isLoadingTemplate && (isEditing || isCopying),
    isSubmitting: createTemplate.isPending || updateTemplate.isPending,
    isReady
  };
};
