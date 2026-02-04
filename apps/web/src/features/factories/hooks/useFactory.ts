import { useQuery } from '@tanstack/react-query';
import { factoriesApi } from '@/api/endpoints/factories.api';

/**
 * Hook to fetch a single factory by ID
 * 
 * @example
 * const { data, isLoading } = useFactory('factory-id');
 */
export function useFactory(id: string) {
    return useQuery({
        queryKey: ['factory', id],
        queryFn: () => factoriesApi.getById(id),
        enabled: !!id, // Only fetch if ID exists
        staleTime: 5 * 60 * 1000,
    });
}
