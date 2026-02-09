import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { equipmentsApi } from '@/api/endpoints/equipments.api';
import { toast } from 'sonner';

export interface ImportHistory {
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

export interface UseImportProgressProps {
  jobId: string;
}

export function useImportProgress({ jobId }: UseImportProgressProps) {
  const [history, setHistory] = useState<ImportHistory | null>(null);
  const [progress, setProgress] = useState(0);
  const [isSimulationDone, setIsSimulationDone] = useState(false);
  const queryClient = useQueryClient();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);

  const startPolling = useCallback(() => {
    const poll = async () => {
      try {
        const res = await equipmentsApi.getImportStatus(jobId);
        const data = (res as any)?.data || res;
        setHistory(data);

        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          setProgress(100);
          if (pollingRef.current) clearInterval(pollingRef.current);
          queryClient.invalidateQueries({ queryKey: ['equipments'] });
          
          if (data.status === 'COMPLETED') {
            if (data.failedCount > 0) {
              toast.warning(`Hoàn tất: ${data.failedCount} lỗi`);
            } else {
              toast.success('Import thành công!');

            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    // Initial Call after simulation
    poll();
    // Then fallback polling every 3s
    pollingRef.current = setInterval(poll, 3000);
  }, [jobId, queryClient]);

  useEffect(() => {
    if (!jobId) return;

    // 1. Recover metrics for refresh persistence
    const savedDuration = Number(localStorage.getItem('import_duration') || 10000);
    const savedStart = Number(localStorage.getItem('import_start_time') || Date.now());
    const now = Date.now();
    const elapsedTime = now - savedStart;
    const remainingWait = Math.max(0, savedDuration - elapsedTime);

    // 2. Simulation Logic (Exactly 4 Jumps: 0 -> 22.5 -> 45 -> 67.5 -> 90)
    const totalSimulationSteps = 4;
    const incrementPerStep = 90 / totalSimulationSteps;

    const updateSimulation = () => {
      const currentNow = Date.now();
      const currentElapsed = currentNow - savedStart;
      
      const currentStep = Math.min(totalSimulationSteps, Math.floor(currentElapsed / (savedDuration / totalSimulationSteps)));
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

    // 3. Trigger Polling after remaining wait
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
    isSimulationDone
  };
}
