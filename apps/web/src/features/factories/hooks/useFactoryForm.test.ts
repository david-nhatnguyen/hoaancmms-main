import { renderHook, act } from '@testing-library/react';
import { useFactoryForm } from './useFactoryForm';
import type { Factory } from '@/api/types/factory.types';

describe('useFactoryForm', () => {
    // ============================================================================
    // TEST DATA
    // ============================================================================

    const mockFactory: Factory = {
        id: '1',
        code: 'F01',
        name: 'Test Factory',
        location: 'Test Location',
        equipmentCount: 5,
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
    };

    // ============================================================================
    // INITIALIZATION TESTS
    // ============================================================================

    describe('Initialization', () => {
        it('should initialize with closed dialog and empty form', () => {
            const { result } = renderHook(() => useFactoryForm());

            expect(result.current.isOpen).toBe(false);
            expect(result.current.editingFactory).toBeNull();
            expect(result.current.formData).toEqual({
                code: '',
                name: '',
                location: '',
                status: 'ACTIVE',
            });
            expect(result.current.errors).toEqual({});
            expect(result.current.isEditMode).toBe(false);
            expect(result.current.hasChanges).toBe(false);
            expect(result.current.canSubmit).toBe(false);
            expect(result.current.isSubmitting).toBe(false);
        });
    });

    // ============================================================================
    // OPEN DIALOG TESTS
    // ============================================================================

    describe('openDialog', () => {
        it('should open dialog in create mode', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
            });

            expect(result.current.isOpen).toBe(true);
            expect(result.current.editingFactory).toBeNull();
            expect(result.current.isEditMode).toBe(false);
            expect(result.current.formData).toEqual({
                code: '',
                name: '',
                location: '',
                status: 'ACTIVE',
            });
        });

        it('should open dialog in edit mode with factory data', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog(mockFactory);
            });

            expect(result.current.isOpen).toBe(true);
            expect(result.current.editingFactory).toEqual(mockFactory);
            expect(result.current.isEditMode).toBe(true);
            expect(result.current.formData).toEqual({
                code: 'F01',
                name: 'Test Factory',
                location: 'Test Location',
                status: 'ACTIVE',
            });
        });

        it('should handle factory with null location', () => {
            const factoryWithoutLocation = { ...mockFactory, location: null };
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog(factoryWithoutLocation);
            });

            expect(result.current.formData.location).toBe('');
        });

        it('should clear errors when opening dialog', () => {
            const { result } = renderHook(() => useFactoryForm());

            // Set some errors first
            act(() => {
                result.current.openDialog();
                result.current.validate(); // Will fail validation
            });

            expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);

            // Open dialog again
            act(() => {
                result.current.openDialog();
            });

            expect(result.current.errors).toEqual({});
        });

        it('should clear errors when opening dialog with factory', () => {
            const { result } = renderHook(() => useFactoryForm());

            // Set some errors first
            act(() => {
                result.current.openDialog();
                result.current.validate();
            });

            // Open dialog with factory
            act(() => {
                result.current.openDialog(mockFactory);
            });

            expect(result.current.errors).toEqual({});
        });
    });

    // ============================================================================
    // CLOSE DIALOG TESTS
    // ============================================================================

    describe('closeDialog', () => {
        it('should close dialog and reset all state', () => {
            const { result } = renderHook(() => useFactoryForm());

            // Open and modify
            act(() => {
                result.current.openDialog(mockFactory);
                result.current.updateField('name', 'Changed Name');
                result.current.setIsSubmitting(true);
            });

            expect(result.current.isOpen).toBe(true);
            expect(result.current.hasChanges).toBe(true);
            expect(result.current.isSubmitting).toBe(true);

            // Close
            act(() => {
                result.current.closeDialog();
            });

            expect(result.current.isOpen).toBe(false);
            expect(result.current.editingFactory).toBeNull();
            expect(result.current.formData).toEqual({
                code: '',
                name: '',
                location: '',
                status: 'ACTIVE',
            });
            expect(result.current.errors).toEqual({});
            expect(result.current.isSubmitting).toBe(false);
        });
    });

    // ============================================================================
    // UPDATE FIELD TESTS
    // ============================================================================

    describe('updateField', () => {
        it('should update code field', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.updateField('code', 'F99');
            });

            expect(result.current.formData.code).toBe('F99');
            expect(result.current.formData.name).toBe('');
            expect(result.current.formData.location).toBe('');
        });

        it('should update name field', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.updateField('name', 'New Factory');
            });

            expect(result.current.formData.name).toBe('New Factory');
        });

        it('should update location field', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.updateField('location', 'New Location');
            });

            expect(result.current.formData.location).toBe('New Location');
        });

        it('should clear error for updated field', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.validate(); // Will set errors
            });

            expect(result.current.errors.code).toBeDefined();

            act(() => {
                result.current.updateField('code', 'F99');
            });

            expect(result.current.errors.code).toBeUndefined();
            expect(result.current.errors.name).toBeDefined(); // Other errors remain
        });

        it('should not affect other fields', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.updateField('code', 'F99');
                result.current.updateField('name', 'Test');
            });

            act(() => {
                result.current.updateField('location', 'Location');
            });

            expect(result.current.formData.code).toBe('F99');
            expect(result.current.formData.name).toBe('Test');
            expect(result.current.formData.location).toBe('Location');
        });
    });

    // ============================================================================
    // VALIDATION TESTS
    // ============================================================================

    describe('validate', () => {
        it('should return true for valid data', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.updateField('code', 'F99');
                result.current.updateField('name', 'Test Factory');
            });

            let isValid = false;
            act(() => {
                isValid = result.current.validate();
            });

            expect(isValid).toBe(true);
            expect(result.current.errors).toEqual({});
        });

        it('should return false for empty code', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.updateField('name', 'Test Factory');
            });

            let isValid = true;
            act(() => {
                isValid = result.current.validate();
            });

            expect(isValid).toBe(false);
            expect(result.current.errors.code).toBe('Mã nhà máy không được để trống');
        });

        it('should return false for empty name', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.updateField('code', 'F99');
            });

            let isValid = true;
            act(() => {
                isValid = result.current.validate();
            });

            expect(isValid).toBe(false);
            expect(result.current.errors.name).toBe('Tên nhà máy không được để trống');
        });

        it('should return false for both empty code and name', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
            });

            let isValid = true;
            act(() => {
                isValid = result.current.validate();
            });

            expect(isValid).toBe(false);
            expect(result.current.errors.code).toBeDefined();
            expect(result.current.errors.name).toBeDefined();
        });

        it('should allow optional location', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.updateField('code', 'F99');
                result.current.updateField('name', 'Test');
                // location is empty
            });

            let isValid = false;
            act(() => {
                isValid = result.current.validate();
            });

            expect(isValid).toBe(true);
            expect(result.current.errors.location).toBeUndefined();
        });

        it('should validate code max length', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.updateField('code', 'F' + '1'.repeat(50)); // 51 chars
                result.current.updateField('name', 'Test');
            });

            let isValid = true;
            act(() => {
                isValid = result.current.validate();
            });

            expect(isValid).toBe(false);
            expect(result.current.errors.code).toContain('không được quá 50 ký tự');
        });

        it('should validate name max length', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.updateField('code', 'F99');
                result.current.updateField('name', 'A'.repeat(256)); // 256 chars
            });

            let isValid = true;
            act(() => {
                isValid = result.current.validate();
            });

            expect(isValid).toBe(false);
            expect(result.current.errors.name).toContain('không được quá 255 ký tự');
        });
    });

    // ============================================================================
    // RESET FORM TESTS
    // ============================================================================

    describe('resetForm', () => {
        it('should reset to empty in create mode', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.updateField('code', 'F99');
                result.current.updateField('name', 'Test');
                result.current.updateField('location', 'Location');
            });

            expect(result.current.hasChanges).toBe(true);

            act(() => {
                result.current.resetForm();
            });

            expect(result.current.formData).toEqual({
                code: '',
                name: '',
                location: '',
                status: 'ACTIVE',
            });
            expect(result.current.errors).toEqual({});
            expect(result.current.hasChanges).toBe(false);
        });

        it('should reset to factory data in edit mode', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog(mockFactory);
                result.current.updateField('name', 'Changed Name');
                result.current.updateField('location', 'Changed Location');
            });

            expect(result.current.hasChanges).toBe(true);

            act(() => {
                result.current.resetForm();
            });

            expect(result.current.formData).toEqual({
                code: 'F01',
                name: 'Test Factory',
                location: 'Test Location',
                status: 'ACTIVE',
            });
            expect(result.current.errors).toEqual({});
            expect(result.current.hasChanges).toBe(false);
        });

        it('should clear errors', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.validate(); // Set errors
            });

            expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);

            act(() => {
                result.current.resetForm();
            });

            expect(result.current.errors).toEqual({});
        });
    });

    // ============================================================================
    // HAS CHANGES TESTS
    // ============================================================================

    describe('hasChanges', () => {
        it('should be false initially in create mode', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
            });

            expect(result.current.hasChanges).toBe(false);
        });

        it('should be true when code changes in create mode', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.updateField('code', 'F99');
            });

            expect(result.current.hasChanges).toBe(true);
        });

        it('should be true when name changes in create mode', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.updateField('name', 'Test');
            });

            expect(result.current.hasChanges).toBe(true);
        });

        it('should be false initially in edit mode', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog(mockFactory);
            });

            expect(result.current.hasChanges).toBe(false);
        });

        it('should be true when code changes in edit mode', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog(mockFactory);
                result.current.updateField('code', 'F99');
            });

            expect(result.current.hasChanges).toBe(true);
        });

        it('should be true when name changes in edit mode', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog(mockFactory);
                result.current.updateField('name', 'New Name');
            });

            expect(result.current.hasChanges).toBe(true);
        });

        it('should be true when location changes in edit mode', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog(mockFactory);
                result.current.updateField('location', 'New Location');
            });

            expect(result.current.hasChanges).toBe(true);
        });

        it('should be false after reset', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog(mockFactory);
                result.current.updateField('name', 'Changed');
            });

            expect(result.current.hasChanges).toBe(true);

            act(() => {
                result.current.resetForm();
            });

            expect(result.current.hasChanges).toBe(false);
        });
    });

    // ============================================================================
    // CAN SUBMIT TESTS
    // ============================================================================

    describe('canSubmit', () => {
        it('should be false when form is empty', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
            });

            expect(result.current.canSubmit).toBe(false);
        });

        it('should be false when only code is filled', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.updateField('code', 'F99');
            });

            expect(result.current.canSubmit).toBe(false);
        });

        it('should be false when only name is filled', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.updateField('name', 'Test');
            });

            expect(result.current.canSubmit).toBe(false);
        });

        it('should be true when both code and name are filled', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.updateField('code', 'F99');
                result.current.updateField('name', 'Test');
            });

            expect(result.current.canSubmit).toBe(true);
        });

        it('should be false when isSubmitting is true', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.updateField('code', 'F99');
                result.current.updateField('name', 'Test');
                result.current.setIsSubmitting(true);
            });

            expect(result.current.canSubmit).toBe(false);
        });

        it('should be false for whitespace-only code', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.updateField('code', '   ');
                result.current.updateField('name', 'Test');
            });

            expect(result.current.canSubmit).toBe(false);
        });

        it('should be false for whitespace-only name', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
                result.current.updateField('code', 'F99');
                result.current.updateField('name', '   ');
            });

            expect(result.current.canSubmit).toBe(false);
        });
    });

    // ============================================================================
    // IS EDIT MODE TESTS
    // ============================================================================

    describe('isEditMode', () => {
        it('should be false in create mode', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog();
            });

            expect(result.current.isEditMode).toBe(false);
        });

        it('should be true in edit mode', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog(mockFactory);
            });

            expect(result.current.isEditMode).toBe(true);
        });

        it('should be false after closing edit dialog', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.openDialog(mockFactory);
            });

            expect(result.current.isEditMode).toBe(true);

            act(() => {
                result.current.closeDialog();
            });

            expect(result.current.isEditMode).toBe(false);
        });
    });

    // ============================================================================
    // SET SUBMITTING TESTS
    // ============================================================================

    describe('setIsSubmitting', () => {
        it('should set isSubmitting to true', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.setIsSubmitting(true);
            });

            expect(result.current.isSubmitting).toBe(true);
        });

        it('should set isSubmitting to false', () => {
            const { result } = renderHook(() => useFactoryForm());

            act(() => {
                result.current.setIsSubmitting(true);
            });

            act(() => {
                result.current.setIsSubmitting(false);
            });

            expect(result.current.isSubmitting).toBe(false);
        });
    });
});
