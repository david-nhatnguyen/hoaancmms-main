
import { renderHook, act } from '@testing-library/react';
import { useFactoryForm } from './useFactoryForm';

describe('useFactoryForm', () => {
    it('should initialize with default state', () => {
        const { result } = renderHook(() => useFactoryForm());
        
        expect(result.current.isOpen).toBe(false);
        expect(result.current.formData.code).toBe('');
        expect(result.current.isEditMode).toBe(false);
    });

    it('should open dialog and set data in edit mode', () => {
        const { result } = renderHook(() => useFactoryForm());
        const factory = {
            id: '1',
            code: 'F01',
            name: 'Factory 01',
            location: 'Hanoi',
            status: 'ACTIVE' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        act(() => {
            result.current.openDialog(factory);
        });

        expect(result.current.isOpen).toBe(true);
        expect(result.current.formData.code).toBe('F01');
        expect(result.current.isEditMode).toBe(true);
    });

    it('should update field and clear error', () => {
        const { result } = renderHook(() => useFactoryForm());

        act(() => {
            result.current.updateField('name', 'New Name');
        });

        expect(result.current.formData.name).toBe('New Name');
    });

    it('should validate form data', () => {
        const { result } = renderHook(() => useFactoryForm());

        act(() => {
            result.current.updateField('code', '');
        });

        let isValid;
        act(() => {
            isValid = result.current.validate();
        });

        expect(isValid).toBe(false);
        expect(result.current.errors.code).toBeDefined();
    });
});
