import { useState } from 'react';
import type { RowSelectionState } from '@tanstack/react-table';

export function useRoleTableState() {
    const [searchQuery, setSearchQuery] = useState('');
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const selectedIds = Object.keys(rowSelection);

    return {
        searchQuery,
        setSearchQuery,
        rowSelection,
        setRowSelection,
        selectedIds,
        pagination,
        setPagination,
    };
}
