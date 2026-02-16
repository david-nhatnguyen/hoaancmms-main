import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { equipmentsApi } from '@/api/endpoints/equipments.api';
import { Equipment } from '@/api/types/equipment.types';

/**
 * Hook to manage equipment detail state and logic.
 * Decoupled from UI and designed to be test-friendly.
 */
export const useEquipmentDetail = (overrideCode?: string) => {
  const { code: paramCode } = useParams<{ code: string }>();
  const code = overrideCode || paramCode;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');

  // Fetch equipment from API using React Query
  const {
    data: equipment,
    isLoading,
    error,
    refetch,
  } = useQuery<any, Error, Equipment>({
    queryKey: ['equipment', code],
    queryFn: () => equipmentsApi.getByCode(code!),
    select: (response) => response.data,
    enabled: !!code,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Handlers
  const handleGoBack = useCallback(() => {
    navigate('/equipments');
  }, [navigate]);

  const handleEdit = useCallback((editCode: string) => {
    navigate(`/equipments/${editCode}/edit`);
  }, [navigate]);

  const handleCreateWorkOrder = useCallback((id: string) => {
    toast.info('Tính năng tạo phiếu bảo trì đang được phát triển');
    // navigate(`/work-orders/new?equipmentId=${id}`);
  }, []);

  return {
    equipment: equipment || null,
    isLoading,
    error,
    refetch,
    activeTab,
    setActiveTab,
    handlers: {
      handleGoBack,
      handleEdit,
      handleCreateWorkOrder,
    },
  };
};
