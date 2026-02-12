import { useQuery } from '@tanstack/react-query';
import { checklistTemplatesApi } from '../api/checklist-templates.api';
import type { QueryTemplateParams } from '../types/checklist.types';

/**
 * Custom hook to fetch checklist templates with filtering and pagination
 * Uses React Query for caching and automatic refetching
 */
export const useChecklistTemplates = (params?: QueryTemplateParams) => {
  return useQuery({
    queryKey: ['checklist-templates', params],
    queryFn: () => checklistTemplatesApi.getAll(params),
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes (renamed from cacheTime)
  });
};

/**
 * Hook to fetch a single checklist template by ID
 */
export const useChecklistTemplate = (id: string) => {
  return useQuery({
    queryKey: ['checklist-template', id],
    queryFn: () => checklistTemplatesApi.getById(id),
    enabled: !!id, // Only run query if ID is provided
    staleTime: 60000, // Individual templates can be cached longer
  });
};
