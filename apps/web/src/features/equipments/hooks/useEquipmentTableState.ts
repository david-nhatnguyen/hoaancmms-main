import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDataTableState } from '@/features/shared/table/hooks/use-table-state';
import { updateColumnFilters } from '@/features/shared/table/handlers/table-logic.handlers';
import { EquipmentQueryParams, EquipmentStatus } from '@/api/types/equipment.types';

interface UseEquipmentTableStateOptions {
  factoryOptions: { label: string; value: string; code?: string; id?: string }[];
}

/**
 * Custom hook to manage Equipment Table state with URL synchronization
 * Follows PREMIUM_EXECUTION_STANDARDS for logic decoupling.
 */
export function useEquipmentTableState({ factoryOptions }: UseEquipmentTableStateOptions) {
  const [searchParams] = useSearchParams();

  const tableState = useDataTableState<EquipmentQueryParams>({
    initialParams: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: [] as EquipmentStatus[],
      factoryId: [] as string[],
    },
    filterMapping: {
      factoryName: 'factoryId'
    }
  });

  const { setColumnFilters } = tableState;

  // URL Parameter Sync (Initial load and searchParams changes)
  useEffect(() => {
    const factoryCode = searchParams.get('factoryCode');
    const factoryId = searchParams.get('factoryId');
    const status = searchParams.get('status');

    setColumnFilters(prev => {
      let next = prev;

      // Handle Factory identification
      if (factoryId) {
        next = updateColumnFilters(next, 'factoryName', [factoryId]);
      } else if (factoryCode && factoryOptions.length > 0) {
        // Fallback: Resolve factoryCode to factoryId if provided in URL (backwards compat/SEO)
        const targetFactory = factoryOptions.find(f => f.code === factoryCode);
        if (targetFactory) {
          next = updateColumnFilters(next, 'factoryName', [targetFactory.id || targetFactory.value]);
        }
      }
      
      if (status) {
         next = updateColumnFilters(next, 'status', [status]);
      }

      return next;
    });
  }, [searchParams, setColumnFilters, factoryOptions]);

  return tableState;
}
