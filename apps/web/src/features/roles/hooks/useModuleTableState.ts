import { useState, useMemo } from 'react';
import { RowSelectionState, SortingState } from '@tanstack/react-table';

export function useModuleTableState() {
  const [searchQuery, setSearchQuery] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  
  const selectedIds = useMemo(() => Object.keys(rowSelection), [rowSelection]);
  
  const resetFilters = () => {
    setSearchQuery('');
  };

  return {
    searchQuery,
    setSearchQuery,
    rowSelection,
    setRowSelection,
    selectedIds,
    sorting,
    setSorting,
    pagination,
    setPagination,
    resetFilters,
  };
}
