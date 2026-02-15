import { renderHook, act } from '@testing-library/react';
import { useMobileFilters } from './useMobileFilters';

describe('useMobileFilters', () => {
    it('should initialize with default values', () => {
        const { result } = renderHook(() => useMobileFilters({
            sections: [{ id: 'status', label: 'Status', content: null }]
        }));

        expect(result.current.isOpen).toBe(false);
        expect(result.current.expandedSections).toEqual(['status']);
        expect(result.current.searchQuery).toBe('');
    });

    it('should toggle open state', () => {
        const { result } = renderHook(() => useMobileFilters({ sections: [] }));

        act(() => {
            result.current.setIsOpen(true);
        });
        expect(result.current.isOpen).toBe(true);

        act(() => {
            result.current.setIsOpen(false);
        });
        expect(result.current.isOpen).toBe(false);
    });

    it('should update search query', () => {
        const { result } = renderHook(() => useMobileFilters({ sections: [] }));

        act(() => {
            result.current.setSearchQuery('test');
        });
        expect(result.current.searchQuery).toBe('test');
    });

    it('should toggle section expansion', () => {
        const { result } = renderHook(() => useMobileFilters({ sections: [] }));

        // Start empty
        expect(result.current.expandedSections).toEqual([]);

        // Expand 'status'
        act(() => {
            result.current.toggleSection('status');
        });
        expect(result.current.expandedSections).toContain('status');

        // Collapse 'status'
        act(() => {
            result.current.toggleSection('status');
        });
        expect(result.current.expandedSections).not.toContain('status');
    });

    it('should handle clear all', () => {
        const mockClear = jest.fn();
        const { result } = renderHook(() => useMobileFilters({
            sections: [],
            onClearAll: mockClear
        }));

        act(() => {
            result.current.handleClearAll();
        });

        expect(mockClear).toHaveBeenCalled();
        expect(result.current.searchQuery).toBe('');
        // Should keep isOpen based on behavior? Usually clear all keeps sheet open so user sees result.
    });
});
