import { useState, useCallback } from 'react';
import type { Factory, FactoryStatus } from '@/api/types/factory.types';
import { 
    type FactoryFormData, 
    type FactoryFormErrors, 
    validateFactoryForm, 
    sanitizeFactoryData 
} from '../handlers/factory-form.handlers';

// ============================================================================
// TYPES
// ============================================================================

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
    getSanitizedData: () => FactoryFormData;

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

    const openDialog = useCallback((factory?: Factory) => {
        if (factory) {
            setEditingFactory(factory);
            setFormData({
                code: factory.code,
                name: factory.name,
                location: factory.location || '',
                status: factory.status?.toUpperCase() as FactoryStatus,
            });
        } else {
            setEditingFactory(null);
            setFormData(INITIAL_FORM_DATA);
        }
        setErrors({});
        setIsOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        setIsOpen(false);
        setEditingFactory(null);
        setFormData(INITIAL_FORM_DATA);
        setErrors({});
        setIsSubmitting(false);
    }, []);

    const updateField = useCallback((field: keyof FactoryFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: undefined }));
    }, []);

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

    const validate = useCallback((): boolean => {
        const validationErrors = validateFactoryForm(formData);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    }, [formData]);

    const getSanitizedData = useCallback(() => {
        return sanitizeFactoryData(formData);
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

    return {
        isOpen,
        editingFactory,
        formData,
        errors,
        isSubmitting,
        openDialog,
        closeDialog,
        updateField,
        resetForm,
        validate,
        setIsSubmitting,
        getSanitizedData,
        isEditMode,
        hasChanges,
        canSubmit,
    };
}
