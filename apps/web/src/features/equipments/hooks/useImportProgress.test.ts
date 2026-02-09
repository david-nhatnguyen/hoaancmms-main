import { renderHook, act } from '@testing-library/react';
import { useImportProgress } from './useImportProgress';
import { equipmentsApi } from '@/api/endpoints/equipments.api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/api/endpoints/equipments.api');
jest.mock('@tanstack/react-query');
jest.mock('sonner');

describe('useImportProgress', () => {
  const jobId = 'test-job-id';
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });

    // Default mock for polling
    (equipmentsApi.getImportStatus as jest.Mock).mockResolvedValue({
      id: jobId,
      status: 'PROCESSING',
      processedRecords: 0,
      totalRecords: 100
    });

    (toast.success as jest.Mock).mockReturnValue('success-id');
    (toast.warning as jest.Mock).mockReturnValue('warning-id');
    (toast.info as jest.Mock).mockReturnValue('info-id');

    localStorage.clear();
    mockInvalidateQueries.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with 0 progress and null history', () => {
    const { result } = renderHook(() => useImportProgress({ jobId }));
    
    expect(result.current.progress).toBe(0);
    expect(result.current.history).toBeNull();
    expect(result.current.isSimulationDone).toBe(false);
  });

  it('should jump progress 4 times during simulation (0 to 90%)', () => {
    localStorage.setItem('import_duration', '10000');
    localStorage.setItem('import_start_time', Date.now().toString());

    const { result } = renderHook(() => useImportProgress({ jobId }));

    // Step 0: Initial
    expect(result.current.progress).toBe(0);

    // Step 1: 2.5s (25% of 10s)
    act(() => {
      jest.advanceTimersByTime(2500);
    });
    expect(result.current.progress).toBe(22.5);

    // Step 2: 5s (50% of 10s)
    act(() => {
      jest.advanceTimersByTime(2500);
    });
    expect(result.current.progress).toBe(45);

    // Step 3: 7.5s (75% of 10s)
    act(() => {
      jest.advanceTimersByTime(2500);
    });
    expect(result.current.progress).toBe(67.5);

    // Step 4: 10s (100% of 10s)
    act(() => {
      jest.advanceTimersByTime(2500);
    });
    expect(result.current.progress).toBe(90);
  });

  it('should recover progress based on elapsed time when refreshed', () => {
    const duration = 10000;
    const startTime = Date.now() - 5000; // 5s elapsed
    localStorage.setItem('import_duration', duration.toString());
    localStorage.setItem('import_start_time', startTime.toString());

    const { result } = renderHook(() => useImportProgress({ jobId }));

    // Should immediately jump to 45% (Step 2)
    expect(result.current.progress).toBe(45);
  });

  it('should start polling after duration and update history', async () => {
    const duration = 1000; // 1s for faster test
    localStorage.setItem('import_duration', duration.toString());
    localStorage.setItem('import_start_time', Date.now().toString());

    const mockHistory = {
      id: jobId,
      status: 'PROCESSING',
      processedRecords: 10,
      totalRecords: 100,
    };

    (equipmentsApi.getImportStatus as jest.Mock).mockResolvedValue(mockHistory);

    const { result } = renderHook(() => useImportProgress({ jobId }));

    // Wait for simulation to finish
    await act(async () => {
      jest.advanceTimersByTime(duration + 100);
      await Promise.resolve(); // Flush microtasks for the first poll
    });

    expect(result.current.isSimulationDone).toBe(true);
    
    // Check if progress updated to match mock processing if any (logic not implemented yet, just history)
    expect(result.current.history).toEqual(mockHistory);
    expect(equipmentsApi.getImportStatus).toHaveBeenCalledWith(jobId);
  });

  it('should finish import when status is COMPLETED', async () => {
    const duration = 1000;
    localStorage.setItem('import_duration', duration.toString());
    localStorage.setItem('import_start_time', Date.now().toString());

    const completedHistory = {
      id: jobId,
      status: 'COMPLETED',
      successCount: 10,
      failedCount: 0,
    };

    (equipmentsApi.getImportStatus as jest.Mock).mockResolvedValue(completedHistory);

    const { result } = renderHook(() => useImportProgress({ jobId }));

    await act(async () => {
      jest.advanceTimersByTime(duration + 100);
      await Promise.resolve();
    });

    expect(result.current.progress).toBe(100);
    expect(toast.success).toHaveBeenCalled();
    expect(mockInvalidateQueries).toHaveBeenCalled();
  });
});
