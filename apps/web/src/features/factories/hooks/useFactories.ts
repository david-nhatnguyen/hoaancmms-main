import { useQuery } from '@tanstack/react-query';
import { factoriesApi } from '@/api/endpoints/factories.api';
import type { FactoryQueryParams } from '@/api/types/factory.types';

/**
 * Hook to fetch all factories with pagination and filters
 * 
 * @example
 * const { data, isLoading, error } = useFactories({ page: 1, limit: 10 });
 */
export function useFactories(params?: FactoryQueryParams) {
    return useQuery({
        queryKey: ['factories', params],
        queryFn: () => factoriesApi.getAll(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
}
