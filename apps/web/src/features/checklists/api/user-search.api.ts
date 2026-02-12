import { apiClient } from '@/api/client';
import { User } from '../types/checklist.types';

/**
 * Search users for autocomplete
 */
export const searchUsers = async (query: string): Promise<User[]> => {
  const response = await apiClient.get<any>('/users/search', {
    params: { q: query },
  });
  return response.data;
};
