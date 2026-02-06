import { useMutation, useQueryClient } from '@tanstack/react-query';
import { factoriesApi } from '@/api/endpoints/factories.api';
import { toast } from 'sonner';
import type { UpdateFactoryDto } from '@/api/types/factory.types';

/**
 * Hook to update an existing factory
 * 
 * @example
 * const updateFactory = useUpdateFactory();
 * updateFactory.mutate({ id: 'factory-id', data: { name: 'New Name' } });
 */
export function useUpdateFactory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateFactoryDto }) =>
            factoriesApi.update(id, data),
        onSuccess: (_, variables) => {
            // Invalidate both list and detail queries
            queryClient.invalidateQueries({ queryKey: ['factories'] });
            queryClient.invalidateQueries({ queryKey: ['factory-stats'] });
            queryClient.invalidateQueries({ queryKey: ['factory', variables.id] });
            toast.success('Cập nhật nhà máy thành công');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật nhà máy';
            toast.error(Array.isArray(message) ? message[0] : message);
        },
    });
}
