import { useMutation, useQueryClient } from '@tanstack/react-query';
import { factoriesApi } from '@/api/endpoints/factories.api';
import { toast } from 'sonner';
import type { CreateFactoryDto } from '@/api/types/factory.types';

/**
 * Hook to create a new factory
 * 
 * @example
 * const createFactory = useCreateFactory();
 * createFactory.mutate({ code: 'F01', name: 'Factory 1' });
 */
export function useCreateFactory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateFactoryDto) => factoriesApi.create(data),
        onSuccess: () => {
            // Invalidate and refetch factories list
            queryClient.invalidateQueries({ queryKey: ['factories'] });
            toast.success('Tạo nhà máy thành công');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi tạo nhà máy';
            toast.error(Array.isArray(message) ? message[0] : message);
        },
    });
}
