import { useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentsApi } from '@/api/endpoints/equipments.api';
import { toast } from 'sonner';

export const useUploadDocument = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) => 
            equipmentsApi.uploadDocument(id, file),
        onSuccess: (data, variables) => {
            toast.success('Tài liệu đã được tải lên thành công');
            // Invalidate specific equipment query
            queryClient.invalidateQueries({ queryKey: ['equipment', variables.id] });
        },
        onError: (error) => {
            console.error('Upload document error:', error);
            toast.error('Không thể tải lên tài liệu. Vui lòng thử lại.');
        }
    });
};

export const useDeleteDocument = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ docId }: { docId: string; equipmentId: string }) => 
            equipmentsApi.deleteDocument(docId),
        onSuccess: (_, variables) => {
            toast.success('Đã xóa tài liệu');
            if (variables.equipmentId) {
                queryClient.invalidateQueries({ queryKey: ['equipment', variables.equipmentId] });
            }
        },
        onError: (error) => {
            console.error('Delete document error:', error);
            toast.error('Không thể xóa tài liệu');
        }
    });
};
