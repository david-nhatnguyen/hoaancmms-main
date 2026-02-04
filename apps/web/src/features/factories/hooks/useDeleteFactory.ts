import { useMutation, useQueryClient } from '@tanstack/react-query';
import { factoriesApi } from '@/api/endpoints/factories.api';
import { toast } from 'sonner';

/**
 * Hook to delete a factory
 * 
 * @example
 * const deleteFactory = useDeleteFactory();
 * deleteFactory.mutate('factory-id');
 */
export function useDeleteFactory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => factoriesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['factories'] });
            toast.success('Xóa nhà máy thành công');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi xóa nhà máy';
            toast.error(Array.isArray(message) ? message[0] : message);
        },
    });
}
