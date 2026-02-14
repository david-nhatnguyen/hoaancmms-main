import { renderHook } from '@testing-library/react';
import { useChecklistColumns } from './useChecklistColumns';
import { MemoryRouter } from 'react-router-dom';

// Mock EquipmentQuickView to avoid complex rendering in hook test
jest.mock('../components/EquipmentQuickView', () => ({
  EquipmentQuickView: () => <div data-testid="mock-equipment-quick-view" />
}));

describe('useChecklistColumns', () => {
  const mockHandlers = {
    onView: jest.fn(),
    onEdit: jest.fn(),
    onCopy: jest.fn(),
    onDeactivate: jest.fn(),
    onDelete: jest.fn(),
  };

  test('should return defined columns', () => {
    const { result } = renderHook(() => useChecklistColumns(mockHandlers), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>
    });

    expect(result.current.columns).toBeDefined();
    expect(result.current.columns.length).toBeGreaterThan(0);
  });

  test('should include required columns with correct keys', () => {
    const { result } = renderHook(() => useChecklistColumns(mockHandlers), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>
    });

    const columns = result.current.columns;
    const keys = columns.map((col: any) => col.key);

    // Check for updated/new columns
    expect(keys).toContain('code');
    expect(keys).toContain('equipment');
    expect(keys).toContain('assignedUser');
    expect(keys).toContain('department');
    expect(keys).toContain('actions');

    // Check for removed columns
    expect(keys).not.toContain('equipmentCategory');
  });

  test('should have correct header labels', () => {
    const { result } = renderHook(() => useChecklistColumns(mockHandlers), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>
    });

    const columns = result.current.columns;
    
    // Helper to find column by key
    const getColumn = (key: string) => columns.find((col: any) => col.key === key);

    // Verify headers
    expect(getColumn('equipment')?.header).toBe('Thiết bị áp dụng');
    expect(getColumn('assignedUser')?.header).toBe('Người phụ trách');
    expect(getColumn('department')?.header).toBe('Bộ phận sử dụng');
  });
});

