import { useState, useMemo, useCallback, useEffect } from "react";
import { 
  ColumnFiltersState, 
  RowSelectionState, 
  SortingState,
  PaginationState
} from "@tanstack/react-table";
import { useDebounce } from "@/hooks/use-debounce";
import { 
  mapRowSelectionToIds, 
  updateColumnFilters,
  getSortParams,
  getActiveFiltersCount
} from "../handlers/table-logic.handlers";

export interface UseDataTableStateOptions<TParams> {
  initialParams: TParams;
  onParamsChange?: (params: TParams) => void;
  debounceMs?: number;
  /** Optional mapping from column ID to API param name */
  filterMapping?: Record<string, keyof TParams>;
}

/**
 * Shared hook to manage Data Table state (filters, sorting, pagination, selection)
 */
export function useDataTableState<TParams extends Record<string, any>>({
  initialParams,
  onParamsChange,
  debounceMs = 300,
  filterMapping = {},
}: UseDataTableStateOptions<TParams>) {
  // 1. Search State
  const [searchQuery, setSearchQuery] = useState(initialParams.search || "");
  const debouncedSearch = useDebounce(searchQuery, debounceMs);

  // 2. Selection State
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const selectedIds = useMemo(() => mapRowSelectionToIds(rowSelection), [rowSelection]);

  // 3. Sorting State
  const [sorting, setSorting] = useState<SortingState>(
    initialParams.sortBy 
      ? [{ id: initialParams.sortBy, desc: initialParams.sortOrder === "desc" }]
      : []
  );

  // 4. Pagination State
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: (initialParams.page || 1) - 1,
    pageSize: initialParams.limit || 10,
  });

  // 5. Column Filters
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // 6. Combined Params for API
  const params = useMemo(() => {
    const { sortBy, sortOrder } = getSortParams(sorting);
    
    // Create base params
    const nextParams: any = {
      ...initialParams,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sortBy,
      sortOrder,
      search: debouncedSearch || undefined,
    };

    // Apply filters with optional mapping
    columnFilters.forEach((filter) => {
      const paramKey = (filterMapping[filter.id] as string) || filter.id;
      nextParams[paramKey] = filter.value;
    });

    return nextParams as TParams;
  }, [initialParams, pagination, sorting, debouncedSearch, columnFilters, filterMapping]);

  // Sync params to parent if needed
  useEffect(() => {
    onParamsChange?.(params);
  }, [params, onParamsChange]);

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset to first page on search
  }, []);

  const handleColumnFiltersChange = useCallback((updaterOrValue: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState)) => {
    setColumnFilters(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      return next;
    });
    setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset to first page on filter
  }, []);

  const handleResetFilters = useCallback(() => {
    setColumnFilters([]);
    setSearchQuery("");
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const toggleColumnFilter = useCallback((id: string, value: any) => {
    setColumnFilters(prev => {
      const filter = prev.find(f => f.id === id);
      const currentValues = Array.isArray(filter?.value) ? filter?.value : [];
      
      const nextValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return updateColumnFilters(prev, id, nextValues);
    });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const activeFiltersCount = useMemo(() => 
    getActiveFiltersCount(columnFilters, searchQuery), 
    [columnFilters, searchQuery]
  );

  return {
    // State
    searchQuery,
    rowSelection,
    selectedIds,
    sorting,
    pagination,
    columnFilters,
    params,
    activeFiltersCount,
    
    // Setters
    setSearchQuery: handleSearchChange,
    setRowSelection,
    setSorting,
    setPagination,
    setColumnFilters: handleColumnFiltersChange,
    
    // Helpers
    resetFilters: handleResetFilters,
    toggleColumnFilter,
  };
}
