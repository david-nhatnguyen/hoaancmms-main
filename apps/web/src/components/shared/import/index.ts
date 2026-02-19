/**
 * Shared Import Module
 *
 * Re-usable across any entity (Equipment, Checklist, etc.)
 *
 * Usage pattern:
 *  1. In the page, manage state with `useImportState` (or manually)
 *  2. Render <ImportDialog config={...} /> to let users upload a file
 *  3. When a job starts, render <ImportProgressCard /> with the hook result
 *
 * @example
 * ```tsx
 * import { ImportDialog, ImportProgress, useImportProgress } from '@/components/shared/import';
 *
 * const { progress, history } = useImportProgress({
 *   jobId,
 *   getStatus: (id) => equipmentsApi.getImportStatus(id),
 *   invalidateKeys: ['equipments'],
 *   storagePrefix: 'equipment_import',
 * });
 * ```
 */

export { ImportDialog } from './ImportDialog';
export type { ImportDialogProps, ImportDialogConfig } from './ImportDialog';

export { ImportProgress } from './ImportProgress';
export type { ImportProgressProps } from './ImportProgress';

export { useImportProgress } from './useImportProgress';
export type {
  UseImportProgressOptions,
  ImportJobHistory,
  ImportJobStatus,
} from './useImportProgress';
