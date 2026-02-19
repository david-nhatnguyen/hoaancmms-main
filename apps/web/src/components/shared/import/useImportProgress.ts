import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ImportJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ImportJobHistory {
  id: string;
  fileName: string;
  totalRecords: number;
  processedRecords: number;
  successCount: number;
  failedCount: number;
  status: ImportJobStatus;
  errorFileUrl?: string;
  createdAt?: string;
}

export interface UseImportProgressOptions {
  /** Job ID to poll */
  jobId: string;
  /**
   * Async function that fetches current job status from the API.
   * This decouples the hook from any specific API endpoint.
   */
  getStatus: (jobId: string) => Promise<ImportJobHistory>;
  /**
   * React Query cache keys to invalidate when the job completes.
   * E.g. ['equipments'] or ['checklist-templates']
   */
  invalidateKeys?: string[];
  /**
   * Prefix for the localStorage keys that persist timing across reloads.
   * E.g. 'equipment_import' or 'checklist_import'
   */
  storagePrefix?: string;
  /** Toast messages – can be overridden per-feature */
  messages?: {
    success?: string;
    warning?: (failedCount: number) => string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generic import-progress hook.
 *
 * Drives a simulated progress bar while a background import job runs
 * and polls the given `getStatus` endpoint for real completion data.
 *
 * ### Continuous-polling fix
 * `getStatus` / `messages` / `invalidateKeys` can be inline functions/objects
 * that get new references on every parent render. Putting them in the effect
 * deps array would cause the effect to re-run → new intervals → runaway polling.
 * We store them in refs so the effect only depends on stable values (`jobId` and
 * the two localStorage key strings), while still reading the latest values
 * inside async callbacks.
 */
export function useImportProgress({
  jobId,
  getStatus,
  invalidateKeys = [],
  storagePrefix = 'import',
  messages,
}: UseImportProgressOptions) {
  // Start at 1 so ImportProgress renders immediately (avoids the `progress===0`
  // early-return guard while history is still null).
  const [progress, setProgress] = useState(1);
  const [history, setHistory] = useState<ImportJobHistory | null>(null);
  const [isSimulationDone, setIsSimulationDone] = useState(false);

  const queryClient = useQueryClient();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);

  // Keep latest prop values accessible inside intervals without making them
  // effect dependencies (which would restart the effect on every render).
  const getStatusRef = useRef(getStatus);
  const invalidateKeysRef = useRef(invalidateKeys);
  const messagesRef = useRef(messages);
  getStatusRef.current = getStatus;
  invalidateKeysRef.current = invalidateKeys;
  messagesRef.current = messages;

  const durationKey = `${storagePrefix}_duration`;
  const startTimeKey = `${storagePrefix}_start_time`;

  useEffect(() => {
    if (!jobId) return;

    // Recover timing from localStorage so progress survives page reloads
    const savedDuration = Number(localStorage.getItem(durationKey) || 10_000);
    const savedStart = Number(localStorage.getItem(startTimeKey) || Date.now());

    // ── Simulate progress animation up to 90% ──────────────────────────────
    const TOTAL_STEPS = 4;
    const INCREMENT = 90 / TOTAL_STEPS;

    const updateSimulation = () => {
      const currentElapsed = Date.now() - savedStart;
      const step = Math.min(
        TOTAL_STEPS,
        Math.floor(currentElapsed / (savedDuration / TOTAL_STEPS)),
      );
      setProgress(Math.max(1, Math.min(90, step * INCREMENT)));

      if (currentElapsed >= savedDuration) {
        if (simulationRef.current) {
          clearInterval(simulationRef.current);
          simulationRef.current = null;
        }
      }
    };

    updateSimulation();
    simulationRef.current = setInterval(updateSimulation, 500);

    // ── Begin real polling after the estimated simulation duration ─────────
    const elapsed = Date.now() - savedStart;
    const remainingWait = Math.max(0, savedDuration - elapsed);

    const waitTimer = setTimeout(() => {
      setIsSimulationDone(true);

      const poll = async () => {
        try {
          const res = await getStatusRef.current(jobId);
          // Support both raw response and `{ data: ... }` wrapped response
          const data: ImportJobHistory = (res as any)?.data ?? res;
          setHistory(data);

          if (data.status === 'COMPLETED' || data.status === 'FAILED') {
            // ✅ Stop polling — job is done
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            setProgress(100);

            for (const key of invalidateKeysRef.current) {
              queryClient.invalidateQueries({ queryKey: [key] });
            }

            if (data.status === 'COMPLETED') {
              if (data.failedCount > 0) {
                const warnMsg =
                  messagesRef.current?.warning?.(data.failedCount) ??
                  `Hoàn tất: ${data.failedCount} dòng lỗi`;
                toast.warning(warnMsg);
              } else {
                const successMsg = messagesRef.current?.success ?? 'Import thành công!';
                toast.success(successMsg);
              }
            }
          }
        } catch (err) {
          console.error('[useImportProgress] Polling error:', err);
        }
      };

      poll();
      pollingRef.current = setInterval(poll, 3000);
    }, remainingWait);

    return () => {
      if (simulationRef.current) clearInterval(simulationRef.current);
      if (pollingRef.current) clearInterval(pollingRef.current);
      clearTimeout(waitTimer);
    };

    // ⚠ Only jobId + storage keys — all other values are read via refs so
    // that re-renders with new inline function references do NOT restart
    // the effect (which caused the continuous-polling bug).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, durationKey, startTimeKey]);

  return { progress, history, isSimulationDone };
}
