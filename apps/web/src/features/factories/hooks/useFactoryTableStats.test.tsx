import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFactoryTableStats } from './useFactoryTableStats';

// Mock useFactoryStats hook
const mockUseFactoryStats = jest.fn();
jest.mock('./useFactoryStats', () => ({
  useFactoryStats: () => mockUseFactoryStats(),
}));

describe('useFactoryTableStats', () => {
  // ============================================================================
  // TEST SETUP
  // ============================================================================

  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  // ============================================================================
  // MOCK DATA
  // ============================================================================

  const mockStatsData = {
    data: {
      totalFactories: 10,
      activeFactories: 8,
      totalEquipment: 50,
    },
  };

  // ============================================================================
  // INITIALIZATION TESTS
  // ============================================================================

  describe('Initialization', () => {
    it('should return stats array', () => {
      mockUseFactoryStats.mockReturnValue({
        data: mockStatsData,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      expect(result.current.stats).toBeDefined();
      expect(Array.isArray(result.current.stats)).toBe(true);
    });

    it('should return 3 stats', () => {
      mockUseFactoryStats.mockReturnValue({
        data: mockStatsData,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      expect(result.current.stats).toHaveLength(3);
    });

    it('should return loading state', () => {
      mockUseFactoryStats.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });

    it('should return error state', () => {
      const mockError = new Error('Failed to fetch');
      mockUseFactoryStats.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
      });

      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      expect(result.current.error).toBe(mockError);
    });
  });

  // ============================================================================
  // STATS STRUCTURE TESTS
  // ============================================================================

  describe('Stats Structure', () => {
    beforeEach(() => {
      mockUseFactoryStats.mockReturnValue({
        data: mockStatsData,
        isLoading: false,
        error: null,
      });
    });

    it('should have correct labels', () => {
      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      const labels = result.current.stats.map(stat => stat.label);
      expect(labels).toEqual([
        'Tổng số Nhà máy',
        'Đang hoạt động',
        'Tổng số Thiết bị',
      ]);
    });

    it('should have correct values from API', () => {
      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      const values = result.current.stats.map(stat => stat.value);
      expect(values).toEqual([10, 8, 50]);
    });

    it('should have icons for all stats', () => {
      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      result.current.stats.forEach(stat => {
        expect(stat.icon).toBeDefined();
      });
    });

    it('should have iconBgClass for all stats', () => {
      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      result.current.stats.forEach(stat => {
        expect(stat.iconBgClass).toBeDefined();
        expect(typeof stat.iconBgClass).toBe('string');
      });
    });

    it('should have valueClass for active factories', () => {
      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      const activeStat = result.current.stats.find(s => s.label === 'Đang hoạt động');
      expect(activeStat?.valueClass).toBeDefined();
      expect(activeStat?.valueClass).toContain('text-');
    });
  });

  // ============================================================================
  // EMPTY DATA TESTS
  // ============================================================================

  describe('Empty Data Handling', () => {
    it('should return zero values when data is undefined', () => {
      mockUseFactoryStats.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      const values = result.current.stats.map(stat => stat.value);
      expect(values).toEqual([0, 0, 0]);
    });

    it('should return zero values when data.data is undefined', () => {
      mockUseFactoryStats.mockReturnValue({
        data: { data: undefined },
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      const values = result.current.stats.map(stat => stat.value);
      expect(values).toEqual([0, 0, 0]);
    });

    it('should still have correct structure with zero values', () => {
      mockUseFactoryStats.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      expect(result.current.stats).toHaveLength(3);
      result.current.stats.forEach(stat => {
        expect(stat.label).toBeDefined();
        expect(stat.icon).toBeDefined();
        expect(stat.iconBgClass).toBeDefined();
      });
    });
  });

  // ============================================================================
  // INDIVIDUAL STAT TESTS
  // ============================================================================

  describe('Total Factories Stat', () => {
    beforeEach(() => {
      mockUseFactoryStats.mockReturnValue({
        data: mockStatsData,
        isLoading: false,
        error: null,
      });
    });

    it('should have correct label', () => {
      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      const stat = result.current.stats[0];
      expect(stat.label).toBe('Tổng số Nhà máy');
    });

    it('should have correct value', () => {
      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      const stat = result.current.stats[0];
      expect(stat.value).toBe(10);
    });

    it('should have primary icon background', () => {
      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      const stat = result.current.stats[0];
      expect(stat.iconBgClass).toBe('bg-primary/20');
    });
  });

  describe('Active Factories Stat', () => {
    beforeEach(() => {
      mockUseFactoryStats.mockReturnValue({
        data: mockStatsData,
        isLoading: false,
        error: null,
      });
    });

    it('should have correct label', () => {
      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      const stat = result.current.stats[1];
      expect(stat.label).toBe('Đang hoạt động');
    });

    it('should have correct value', () => {
      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      const stat = result.current.stats[1];
      expect(stat.value).toBe(8);
    });

    it('should have status-active icon background', () => {
      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      const stat = result.current.stats[1];
      expect(stat.iconBgClass).toBe('bg-status-active/20');
    });

    it('should have status-active value class', () => {
      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      const stat = result.current.stats[1];
      expect(stat.valueClass).toContain('status-active');
    });
  });

  describe('Total Equipment Stat', () => {
    beforeEach(() => {
      mockUseFactoryStats.mockReturnValue({
        data: mockStatsData,
        isLoading: false,
        error: null,
      });
    });

    it('should have correct label', () => {
      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      const stat = result.current.stats[2];
      expect(stat.label).toBe('Tổng số Thiết bị');
    });

    it('should have correct value', () => {
      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      const stat = result.current.stats[2];
      expect(stat.value).toBe(50);
    });

    it('should have accent icon background', () => {
      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      const stat = result.current.stats[2];
      expect(stat.iconBgClass).toBe('bg-accent/20');
    });
  });

  // ============================================================================
  // MEMOIZATION TESTS
  // ============================================================================

  describe('Memoization', () => {
    it('should return same stats reference when data unchanged', () => {
      mockUseFactoryStats.mockReturnValue({
        data: mockStatsData,
        isLoading: false,
        error: null,
      });

      const { result, rerender } = renderHook(() => useFactoryTableStats(), { wrapper });

      const firstStats = result.current.stats;
      
      rerender();
      
      const secondStats = result.current.stats;
      
      expect(firstStats).toBe(secondStats);
    });

    it('should return new stats when data changes', () => {
      mockUseFactoryStats.mockReturnValue({
        data: mockStatsData,
        isLoading: false,
        error: null,
      });

      const { result, rerender } = renderHook(() => useFactoryTableStats(), { wrapper });

      const firstStats = result.current.stats;
      
      // Change data
      mockUseFactoryStats.mockReturnValue({
        data: {
          data: {
            totalFactories: 20,
            activeFactories: 15,
            totalEquipment: 100,
          },
        },
        isLoading: false,
        error: null,
      });
      
      rerender();
      
      const secondStats = result.current.stats;
      
      expect(firstStats).not.toBe(secondStats);
      expect(secondStats[0].value).toBe(20);
    });
  });

  // ============================================================================
  // LOADING STATE TESTS
  // ============================================================================

  describe('Loading State', () => {
    it('should show loading when fetching', () => {
      mockUseFactoryStats.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });

    it('should not show loading when data loaded', () => {
      mockUseFactoryStats.mockReturnValue({
        data: mockStatsData,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      expect(result.current.isLoading).toBe(false);
    });

    it('should return zero values while loading', () => {
      mockUseFactoryStats.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      const values = result.current.stats.map(stat => stat.value);
      expect(values).toEqual([0, 0, 0]);
    });
  });

  // ============================================================================
  // ERROR STATE TESTS
  // ============================================================================

  describe('Error State', () => {
    it('should return error when fetch fails', () => {
      const mockError = new Error('Network error');
      mockUseFactoryStats.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
      });

      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      expect(result.current.error).toBe(mockError);
    });

    it('should return null error when no error', () => {
      mockUseFactoryStats.mockReturnValue({
        data: mockStatsData,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      expect(result.current.error).toBeNull();
    });

    it('should return zero values on error', () => {
      mockUseFactoryStats.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Error'),
      });

      const { result } = renderHook(() => useFactoryTableStats(), { wrapper });

      const values = result.current.stats.map(stat => stat.value);
      expect(values).toEqual([0, 0, 0]);
    });
  });
});
