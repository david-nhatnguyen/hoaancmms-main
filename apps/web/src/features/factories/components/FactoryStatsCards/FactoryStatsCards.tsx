import { StatsGrid } from '@/components/shared/layout/StatsGrid';
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
  return <StatsGrid stats={stats} loading={loading} />;
}
