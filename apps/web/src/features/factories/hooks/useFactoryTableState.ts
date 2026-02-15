
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDataTableState } from '@/features/shared/table/hooks/use-table-state';
import { updateColumnFilters } from '@/features/shared/table/handlers/table-logic.handlers';
import { FactoryQueryParams, FactoryStatus } from '@/api/types/factory.types';

/**
 * Custom hook to manage Factory Table state with URL synchronization
 * Follows PREMIUM_EXECUTION_STANDARDS for logic decoupling.
 */
export function useFactoryTableState() {
  const [searchParams] = useSearchParams();

  const tableState = useDataTableState<FactoryQueryParams>({
    initialParams: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: [] as FactoryStatus[],
    }
  });

  const { setColumnFilters, setSearchQuery } = tableState;

  // URL Parameter Sync (Initial load and searchParams changes)
  useEffect(() => {
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    if (search) {
      setSearchQuery(search);
    }

    setColumnFilters(prev => {
      let next = prev;
      
      if (status) {
         next = updateColumnFilters(next, 'status', [status]);
      }

      return next;
    });
  }, [searchParams, setColumnFilters, setSearchQuery]);

  return tableState;
}
