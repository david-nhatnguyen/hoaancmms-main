import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { searchUsers } from '../api/user-search.api';
import { User } from '../types/checklist.types';

/**
 * Hook for searching users with debounce
 */
export const useUserSearch = (query: string, debounceMs: number = 300) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return useQuery<User[], Error>({
    queryKey: ['users', 'search', debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled, backend returns recent if empty query
  });
};
