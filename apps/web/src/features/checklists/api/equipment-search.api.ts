import { apiClient } from '@/api/client';
import { Equipment } from '../types/checklist.types';

/**
 * Search equipments for autocomplete
 */
export const searchEquipments = async (query: string): Promise<Equipment[]> => {
  const response = await apiClient.get<any>('/equipments/search', {
    params: { q: query },
  });
  return response.data;
};

/**
 * Get a single equipment by ID
 */
export const getEquipmentById = async (id: string): Promise<Equipment> => {
  const response = await apiClient.get<any>(`/equipments/${id}`);
  return response.data;
};
