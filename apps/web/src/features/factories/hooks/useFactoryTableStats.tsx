import { useMemo } from 'react';
import { Building2, Settings2 } from 'lucide-react';
import { useFactoryStats } from './useFactoryStats';

// ============================================================================
// TYPES
// ============================================================================

export interface FactoryStat {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBgClass: string;
  valueClass?: string;
}

export interface UseFactoryTableStatsReturn {
  stats: FactoryStat[];
  isLoading: boolean;
  error: Error | null;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook for factory table statistics
 * 
 * Transforms API stats data into UI-ready format with icons and styling
 * 
 * @returns Formatted stats array with loading/error states
 * 
 * @example
 * ```tsx
 * const { stats, isLoading } = useFactoryTableStats();
 * 
 * if (isLoading) return <Skeleton />;
 * 
 * <MobileStatsGrid stats={stats} />
 * ```
 */
export function useFactoryTableStats(): UseFactoryTableStatsReturn {
  // Fetch stats from API
  const { data: statsData, isLoading, error } = useFactoryStats();

  // ============================================================================
  // TRANSFORM STATS
  // ============================================================================

  const stats = useMemo<FactoryStat[]>(() => {
    if (!statsData?.data) {
      return [
        {
          label: 'Tổng số Nhà máy',
          value: 0,
          icon: <Building2 className="h-5 w-5 text-primary" />,
          iconBgClass: 'bg-primary/20',
        },
        {
          label: 'Đang hoạt động',
          value: 0,
          icon: <Building2 className="h-5 w-5 text-status-active" />,
          iconBgClass: 'bg-status-active/20',
          valueClass: 'text-[hsl(var(--status-active))]',
        },
        {
          label: 'Tổng số Thiết bị',
          value: 0,
          icon: <Settings2 className="h-5 w-5 text-accent" />,
          iconBgClass: 'bg-accent/20',
        },
      ];
    }

    return [
      {
        label: 'Tổng số Nhà máy',
        value: statsData.data.totalFactories,
        icon: <Building2 className="h-5 w-5 text-primary" />,
        iconBgClass: 'bg-primary/20',
      },
      {
        label: 'Đang hoạt động',
        value: statsData.data.activeFactories,
        icon: <Building2 className="h-5 w-5 text-status-active" />,
        iconBgClass: 'bg-status-active/20',
        valueClass: 'text-[hsl(var(--status-active))]',
      },
      {
        label: 'Tổng số Thiết bị',
        value: statsData.data.totalEquipment,
        icon: <Settings2 className="h-5 w-5 text-accent" />,
        iconBgClass: 'bg-accent/20',
      },
    ];
  }, [statsData]);

  return {
    stats,
    isLoading,
    error: error as Error | null,
  };
}
