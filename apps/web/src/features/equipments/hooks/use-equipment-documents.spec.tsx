import { renderHook, waitFor } from '@testing-library/react';
import { useUploadDocument, useDeleteDocument } from './use-equipment-documents';
import { equipmentsApi } from '@/api/endpoints/equipments.api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import React from 'react';

// Mock dependencies
jest.mock('@/api/endpoints/equipments.api', () => ({
  equipmentsApi: {
    uploadDocument: jest.fn(),
    deleteDocument: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Setup QueryClient for testing
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useEquipmentDocuments', () => {
    
  describe('useUploadDocument', () => {
    it('should call uploadDocument and show success toast', async () => {
      (equipmentsApi.uploadDocument as jest.Mock).mockResolvedValue({});
      
      const { result } = renderHook(() => useUploadDocument(), { wrapper: createWrapper() });
      
      const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
      result.current.mutate({ id: 'eq-1', file });
      
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      expect(equipmentsApi.uploadDocument).toHaveBeenCalledWith('eq-1', file);
      expect(toast.success).toHaveBeenCalledWith('Tài liệu đã được tải lên thành công');
    });

    it('should show error toast on failure', async () => {
        (equipmentsApi.uploadDocument as jest.Mock).mockRejectedValue(new Error('Upload failed'));
        
        const { result } = renderHook(() => useUploadDocument(), { wrapper: createWrapper() });
        
        const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
        result.current.mutate({ id: 'eq-1', file });
        
        await waitFor(() => expect(result.current.isError).toBe(true));
        
        expect(toast.error).toHaveBeenCalledWith('Không thể tải lên tài liệu. Vui lòng thử lại.');
      });
  });

  describe('useDeleteDocument', () => {
    it('should call deleteDocument and show success toast', async () => {
      (equipmentsApi.deleteDocument as jest.Mock).mockResolvedValue({});
      
      const { result } = renderHook(() => useDeleteDocument(), { wrapper: createWrapper() });
      
      result.current.mutate({ docId: 'doc-1', equipmentId: 'eq-1' });
      
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      expect(equipmentsApi.deleteDocument).toHaveBeenCalledWith('doc-1');
      expect(toast.success).toHaveBeenCalledWith('Đã xóa tài liệu');
    });
  });
  
});
