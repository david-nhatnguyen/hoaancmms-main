import { useQuery } from '@tanstack/react-query';
import { factoriesApi } from '@/api/endpoints/factories.api';

/**
 * Hook to fetch factory statistics
 * 
 * @example
 * const { data: stats } = useFactoryStats();
 */
export function useFactoryStats() {
    return useQuery({
        queryKey: ['factory-stats'],
        queryFn: () => factoriesApi.getStats(),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}
