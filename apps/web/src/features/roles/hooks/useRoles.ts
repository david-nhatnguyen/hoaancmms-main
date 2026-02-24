import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '../api/roles.api';

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.getAll,
  });
};
