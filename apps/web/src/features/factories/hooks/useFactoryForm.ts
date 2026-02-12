import { useState, useCallback } from 'react';
import { z } from 'zod';
import type { Factory, FactoryStatus } from '@/api/types/factory.types';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

export const factoryFormSchema = z.object({
    code: z.string()
        .min(1, 'Mã nhà máy không được để trống')
        .max(50, 'Mã nhà máy không được quá 50 ký tự'),
    name: z.string()
        .min(1, 'Tên nhà máy không được để trống')
        .max(255, 'Tên nhà máy không được quá 255 ký tự'),
    location: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export type FactoryFormData = z.infer<typeof factoryFormSchema>;

// ============================================================================
// TYPES
// ============================================================================

export interface FactoryFormErrors {
    code?: string;
    name?: string;
    location?: string;
    status?: string;
}

export interface UseFactoryFormOptions {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export interface UseFactoryFormReturn {
    // State
    isOpen: boolean;
    editingFactory: Factory | null;
    formData: FactoryFormData;
    errors: FactoryFormErrors;
    isSubmitting: boolean;

    // Actions
    openDialog: (factory?: Factory) => void;
    closeDialog: () => void;
    updateField: (field: keyof FactoryFormData, value: string) => void;
    resetForm: () => void;
    validate: () => boolean;
    setIsSubmitting: (isSubmitting: boolean) => void;

    // Computed
    isEditMode: boolean;
    hasChanges: boolean;
    canSubmit: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_FORM_DATA: FactoryFormData = {
    code: '',
    name: '',
    location: '',
    status: 'ACTIVE',
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook for managing factory form state and validation
 * 
 * @param options - Optional callbacks for success/error handling
 * @returns Form state and actions
 * 
 * @example
 * ```tsx
 * const form = useFactoryForm();
 * 
 * // Open for create
 * form.openDialog();
 * 
 * // Open for edit
 * form.openDialog(factory);
 * 
 * // Update field
 * form.updateField('name', 'New Name');
 * 
 * // Validate
 * if (form.validate()) {
 *   // Submit
 * }
 * ```
 */
export function useFactoryForm(): UseFactoryFormReturn {
    // ============================================================================
    // STATE
    // ============================================================================

    const [isOpen, setIsOpen] = useState(false);
    const [editingFactory, setEditingFactory] = useState<Factory | null>(null);
    const [formData, setFormData] = useState<FactoryFormData>(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState<FactoryFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ============================================================================
    // ACTIONS
    // ============================================================================

    /**
     * Open dialog for create or edit
     * @param factory - Factory to edit (undefined for create mode)
     */
    const openDialog = useCallback((factory?: Factory) => {
        if (factory) {
            // Edit mode
            setEditingFactory(factory);
            setFormData({
                code: factory.code,
                name: factory.name,
                location: factory.location || '',
                status: factory.status?.toUpperCase() as FactoryStatus,
            });
        } else {
            // Create mode
            setEditingFactory(null);
            setFormData(INITIAL_FORM_DATA);
        }
        setErrors({});
        setIsOpen(true);
    }, []);

    /**
     * Close dialog and reset all state
     */
    const closeDialog = useCallback(() => {
        setIsOpen(false);
        setEditingFactory(null);
        setFormData(INITIAL_FORM_DATA);
        setErrors({});
        setIsSubmitting(false);
    }, []);

    /**
     * Update a single form field
     * @param field - Field name to update
     * @param value - New value
     */
    const updateField = useCallback((field: keyof FactoryFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        setErrors(prev => ({ ...prev, [field]: undefined }));
    }, []);

    /**
     * Reset form to initial state (create mode) or original factory data (edit mode)
     */
    const resetForm = useCallback(() => {
        if (editingFactory) {
            setFormData({
                code: editingFactory.code,
                name: editingFactory.name,
                location: editingFactory.location || '',
                status: editingFactory.status?.toUpperCase() as FactoryStatus,
            });
        } else {
            setFormData(INITIAL_FORM_DATA);
        }
        setErrors({});
    }, [editingFactory]);

    /**
     * Validate form data using Zod schema
     * @returns true if valid, false otherwise (sets errors)
     */
    const validate = useCallback((): boolean => {
        try {
            factoryFormSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: FactoryFormErrors = {};
                (error as any).errors.forEach((err: any) => {
                    const field = err.path[0] as keyof FactoryFormErrors;
                    newErrors[field] = err.message;
                });
                setErrors(newErrors);
            }
            return false;
        }
    }, [formData]);

    // ============================================================================
    // COMPUTED VALUES
    // ============================================================================

    const isEditMode = editingFactory !== null;

    const hasChanges = editingFactory ? (
        formData.code !== editingFactory.code ||
        formData.name !== editingFactory.name ||
        formData.location !== (editingFactory.location || '') ||
        formData.status !== editingFactory.status
    ) : (
        formData.code !== '' ||
        formData.name !== '' ||
        formData.location !== ''
    );

    const canSubmit = !isSubmitting && formData.code.trim() !== '' && formData.name.trim() !== '';

    // ============================================================================
    // RETURN
    // ============================================================================

    return {
        // State
        isOpen,
        editingFactory,
        formData,
        errors,
        isSubmitting,

        // Actions
        openDialog,
        closeDialog,
        updateField,
        resetForm,
        validate,
        setIsSubmitting,

        // Computed
        isEditMode,
        hasChanges,
        canSubmit,
    };
}
