import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { checklistTemplatesApi } from '@/features/checklists/api/checklist-templates.api';
import { toast } from 'sonner';

export interface ChecklistImportHistory {
  id: string;
  fileName: string;
  totalRecords: number;
  processedRecords: number;
  successCount: number;
  failedCount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorFileUrl?: string;
  createdAt?: string;
}

export interface UseChecklistImportProgressProps {
  jobId: string;
}

export function useChecklistImportProgress({ jobId }: UseChecklistImportProgressProps) {
  const [history, setHistory] = useState<ChecklistImportHistory | null>(null);
  const [progress, setProgress] = useState(0);
  const [isSimulationDone, setIsSimulationDone] = useState(false);
  const queryClient = useQueryClient();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);

  const startPolling = useCallback(() => {
    const poll = async () => {
      try {
        const res = await checklistTemplatesApi.getImportStatus(jobId);
        const data = (res as any)?.data || res;
        setHistory(data);

        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          setProgress(100);
          if (pollingRef.current) clearInterval(pollingRef.current);
          queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });

          if (data.status === 'COMPLETED') {
            if (data.failedCount > 0) {
              toast.warning(`Hoàn tất: ${data.failedCount} lỗi`);
            } else {
              toast.success('Import checklist thành công!');
            }
          }
        }
      } catch (err) {
        console.error('Checklist import polling error:', err);
      }
    };

    poll();
    pollingRef.current = setInterval(poll, 3000);
  }, [jobId, queryClient]);

  useEffect(() => {
    if (!jobId) return;

    // Recover metrics for refresh persistence
    const savedDuration = Number(localStorage.getItem('checklist_import_duration') || 10000);
    const savedStart = Number(localStorage.getItem('checklist_import_start_time') || Date.now());
    const now = Date.now();
    const elapsedTime = now - savedStart;
    const remainingWait = Math.max(0, savedDuration - elapsedTime);

    // Simulation Logic (4 Jumps: 0 -> 22.5 -> 45 -> 67.5 -> 90)
    const totalSimulationSteps = 4;
    const incrementPerStep = 90 / totalSimulationSteps;

    const updateSimulation = () => {
      const currentNow = Date.now();
      const currentElapsed = currentNow - savedStart;

      const currentStep = Math.min(
        totalSimulationSteps,
        Math.floor(currentElapsed / (savedDuration / totalSimulationSteps))
      );
      const calculatedProgress = Math.min(90, currentStep * incrementPerStep);
      setProgress(calculatedProgress);

      if (currentElapsed >= savedDuration) {
        if (simulationRef.current) {
          clearInterval(simulationRef.current);
          simulationRef.current = null;
        }
      }
    };

    updateSimulation();
    simulationRef.current = setInterval(updateSimulation, 500);

    const waitTimer = setTimeout(() => {
      setIsSimulationDone(true);
      startPolling();
    }, remainingWait);

    return () => {
      if (simulationRef.current) clearInterval(simulationRef.current);
      if (pollingRef.current) clearInterval(pollingRef.current);
      clearTimeout(waitTimer);
    };
  }, [jobId, startPolling]);

  return {
    progress,
    history,
    isSimulationDone,
  };
}
