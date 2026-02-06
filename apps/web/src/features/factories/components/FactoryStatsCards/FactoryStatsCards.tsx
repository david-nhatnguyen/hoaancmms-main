import { MobileStatsGrid } from '@/components/shared/MobileStatsGrid';
import type { FactoryStat } from '../../hooks/useFactoryTableStats';

// ============================================================================
// TYPES
// ============================================================================

export interface FactoryStatsCardsProps {
  stats: FactoryStat[];
  loading?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Factory Stats Cards Component
 * 
 * Displays factory statistics in a responsive grid
 * 
 * @param stats - Array of factory statistics
 * @param loading - Whether stats are loading
 * 
 * @example
 * ```tsx
 * const { stats, isLoading } = useFactoryTableStats();
 * 
 * <FactoryStatsCards stats={stats} loading={isLoading} />
 * ```
 */
export function FactoryStatsCards({ stats, loading = false }: FactoryStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border bg-card p-6 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-6 w-16 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <MobileStatsGrid stats={stats} />;
}
