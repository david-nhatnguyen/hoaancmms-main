import { useDataTableState } from '@/features/shared/table/hooks/use-table-state';
import { QueryTemplateParams, ChecklistCycle, ChecklistStatus } from '../types/checklist.types';

/**
 * Custom hook to manage Checklist Table state with URL synchronization
 */
export function useChecklistTableState() {
  return useDataTableState<QueryTemplateParams>({
    initialParams: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: [] as ChecklistStatus[],
      cycle: [] as ChecklistCycle[],
    },
  });
}
