// ============================================================================
// FACTORY HOOKS - BARREL EXPORT
// ============================================================================

// API Hooks
export { useFactories } from './useFactories';
export { useFactory } from './useFactory';
export { useCreateFactory } from './useCreateFactory';
export { useUpdateFactory } from './useUpdateFactory';

export { useDeleteFactory } from './useDeleteFactory';
export { useBulkDeleteFactories } from './useBulkDeleteFactories';
export { useFactoryStats } from './useFactoryStats';

// UI Hooks
export { useFactoryForm } from './useFactoryForm';
export { useFactoryColumns } from './useFactoryColumns';
export { useFactoryTableStats } from './useFactoryTableStats';

// Types
export type { FactoryFormData, FactoryFormErrors, UseFactoryFormReturn } from './useFactoryForm';
export type { UseFactoryColumnsOptions, UseFactoryColumnsReturn } from './useFactoryColumns';
export type { FactoryStat, UseFactoryTableStatsReturn } from './useFactoryTableStats';
