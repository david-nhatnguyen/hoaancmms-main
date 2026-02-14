import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { checklistTemplatesApi } from '../api/checklist-templates.api';
import { ChecklistTemplate, ApiResponse } from '../types/checklist.types';

/**
 * Hook to manage checklist detail state and logic.
 * Designed to be test-friendly by allowing an optional ID override.
 * 
 * NOW USES: Real API calls via React Query
 */
export const useChecklistDetail = (overrideId?: string) => {
  const { id: paramId } = useParams<{ id: string }>();
  const id = overrideId || paramId;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('preview');

  // Fetch checklist from API using React Query
  const {
    data: checklist,
    isLoading,
    error,
    refetch,
  } = useQuery<ApiResponse<ChecklistTemplate>, Error, ChecklistTemplate>({
    queryKey: ['checklist-template', id],
    queryFn: () => checklistTemplatesApi.getById(id!),
    select: (response) => response.data,
    enabled: !!id, // Only fetch if ID exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Handlers
  const handleGoBack = () => {
    navigate('/checklists');
  };

  const handleCopy = () => {
    toast.success('Đang sao chép checklist...');
    navigate(`/checklists/new?copy=${id}`);
  };

  const handleEdit = (editId: string) => {
    navigate(`/checklists/${editId}/edit`);
  };

  return {
    checklist: checklist || null,
    isLoading,
    error,
    refetch,
    activeTab,
    setActiveTab,
    handlers: {
      handleGoBack,
      handleCopy,
      handleEdit,
    },
  };
};
