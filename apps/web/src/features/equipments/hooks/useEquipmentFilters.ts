import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/use-debounce';
import type { EquipmentQueryParams, EquipmentStatus } from '@/api/types/equipment.types';

export interface Filters {
  factory: string[];
  status: EquipmentStatus[];
}

export const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Hoạt động', color: 'bg-status-active' },
  { value: 'MAINTENANCE', label: 'Bảo trì', color: 'bg-status-maintenance' },
  { value: 'INACTIVE', label: 'Ngừng hoạt động', color: 'bg-status-inactive' }
];

export function useEquipmentFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const preselectedFactory = searchParams.get('factory');

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [filters, setFilters] = useState<Filters>({
    factory: preselectedFactory ? [preselectedFactory] : [],
    status: [],
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Sync state to URL params (optional, but good practice)
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (debouncedSearch) params.set('search', debouncedSearch);
    filters.factory.forEach(f => params.append('factory', f));
    filters.status.forEach(s => params.append('status', s));
  }, [page, debouncedSearch, filters, setSearchParams]);

  // Construct query params for API
  const queryParams: EquipmentQueryParams = useMemo(() => ({
    page,
    limit,
    search: debouncedSearch || undefined,
    factoryId: filters.factory.length > 0 ? filters.factory : undefined,
    status: filters.status.length > 0 ? filters.status : undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }), [page, limit, debouncedSearch, filters]);

  const toggleFilter = (category: keyof Filters, value: string) => {
    setFilters(prev => {
      const currentList = prev[category] as string[];
      const newList = currentList.includes(value)
        ? currentList.filter(v => v !== value)
        : [...currentList, value];
        
      return {
        ...prev,
        [category]: newList
      };
    });
    setPage(1); // Reset to page 1 on filter change
  };

  const removeFilter = (category: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].filter(v => v !== value)
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      factory: [],
      status: []
    });
    setSearchQuery('');
    setPage(1);
  };

  // Active filter tags calculation
  const activeFilterTags = useMemo(() => {
    const tags: { category: keyof Filters; value: string; label: string }[] = [];

    filters.factory.forEach(f => {
       // Placeholder label logic - strictly we need real factory list here
       tags.push({ category: 'factory', value: f, label: `Factory: ${f}` });
    });

    filters.status.forEach(s => {
      const status = STATUS_OPTIONS.find(st => st.value === s);
      if (status) tags.push({ category: 'status', value: s, label: status.label });
    });

    return tags;
  }, [filters]);

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0) || !!searchQuery;
  const activeFiltersCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0) + (searchQuery ? 1 : 0);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    toggleFilter,
    removeFilter,
    clearFilters,
    queryParams,
    activeFilterTags,
    hasActiveFilters,
    activeFiltersCount,
    page,
    setPage,
    limit,
    setLimit
  };
}
