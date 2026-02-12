import { renderHook, act } from '@testing-library/react';
import { useDataTableState } from './use-table-state';

describe('useDataTableState', () => {
  const initialParams = {
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc' as const,
    search: '',
  };

  it('should initialize with provided params', () => {
    const { result } = renderHook(() => useDataTableState({ initialParams }));

    expect(result.current.pagination.pageIndex).toBe(0);
    expect(result.current.pagination.pageSize).toBe(10);
    expect(result.current.sorting).toEqual([{ id: 'name', desc: false }]);
    expect(result.current.searchQuery).toBe('');
  });

  it('should update search query and reset pagination', () => {
    const { result } = renderHook(() => useDataTableState({ initialParams }));

    act(() => {
      result.current.setPagination({ pageIndex: 5, pageSize: 10 });
    });
    expect(result.current.pagination.pageIndex).toBe(5);

    act(() => {
      result.current.setSearchQuery('new search');
    });
    expect(result.current.searchQuery).toBe('new search');
    expect(result.current.pagination.pageIndex).toBe(0);
  });

  it('should manage row selection', () => {
    const { result } = renderHook(() => useDataTableState({ initialParams }));

    act(() => {
      result.current.setRowSelection({ '1': true, '2': true });
    });

    expect(result.current.rowSelection).toEqual({ '1': true, '2': true });
    expect(result.current.selectedIds).toEqual(['1', '2']);
  });

  it('should reset filters', () => {
    const { result } = renderHook(() => useDataTableState({ initialParams }));

    act(() => {
      result.current.setSearchQuery('test');
      result.current.setColumnFilters([{ id: 'status', value: ['active'] }]);
    });

    expect(result.current.activeFiltersCount).toBe(2);

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.columnFilters).toEqual([]);
    expect(result.current.activeFiltersCount).toBe(0);
  });
});
