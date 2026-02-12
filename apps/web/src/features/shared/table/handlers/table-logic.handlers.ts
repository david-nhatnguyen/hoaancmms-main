import { ColumnFiltersState, RowSelectionState, SortingState } from "@tanstack/react-table";

/**
 * Pure functions for table logic and data transformations
 */

/**
 * Maps row selection state to an array of IDs
 */
export const mapRowSelectionToIds = (rowSelection: RowSelectionState): string[] => {
  return Object.keys(rowSelection).filter((id) => rowSelection[id]);
};

/**
 * Updates column filters state based on a new filter value
 */
export const updateColumnFilters = (
  currentFilters: ColumnFiltersState,
  id: string,
  value: any
): ColumnFiltersState => {
  const filtered = currentFilters.filter((f) => f.id !== id);
  if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
    return filtered;
  }
  return [...filtered, { id, value }];
};

/**
 * Gets sort parameters from SortingState
 */
export const getSortParams = (sorting: SortingState) => {
  if (sorting.length === 0) return { sortBy: undefined, sortOrder: undefined };
  const sort = sorting[0];
  return {
    sortBy: sort.id,
    sortOrder: sort.desc ? "desc" : "asc",
  };
};

/**
 * Checks if a filter is active
 */
export const isFilterActive = (filters: ColumnFiltersState, id: string): boolean => {
  return filters.some((f) => f.id === id);
};

/**
 * Gets the count of active filters (including search)
 */
export const getActiveFiltersCount = (
  filters: ColumnFiltersState,
  searchQuery?: string
): number => {
  let count = filters.length;
  if (searchQuery && searchQuery.trim() !== "") {
    count += 1;
  }
  return count;
};
