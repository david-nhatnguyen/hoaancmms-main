import { useMutation, useQueryClient } from '@tanstack/react-query';
import { factoriesApi } from '@/api/endpoints/factories.api';
import { toast } from 'sonner';

/**
 * Hook to bulk delete factories
 * 
 * @example
 * const bulkDelete = useBulkDeleteFactories();
 * bulkDelete.mutate(['id1', 'id2']);
 */
export function useBulkDeleteFactories() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ids: string[]) => factoriesApi.bulkDelete(ids),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['factories'] });
            queryClient.invalidateQueries({ queryKey: ['factory-stats'] });
            
            const { success, failed } = response.data;
            
            if (failed.length === 0) {
                toast.success(`Đã xóa ${success.length} nhà máy thành công`);
            } else if (success.length > 0) {
                toast.warning(`Đã xóa ${success.length} nhà máy. ${failed.length} mục không thể xóa do còn thiết bị.`);
            } else {
                toast.error(`Không thể xóa nhà máy nào. Vui lòng kiểm tra lại thiết bị bên trong.`);
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi xóa nhà máy';
            toast.error(Array.isArray(message) ? message[0] : message);
        },
    });
}
