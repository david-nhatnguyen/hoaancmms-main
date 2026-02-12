import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { searchEquipments, getEquipmentById } from '../api/equipment-search.api';
import { Equipment } from '../types/checklist.types';

/**
 * Hook for searching equipments with debounce
 */
export const useEquipmentSearch = (query: string, debounceMs: number = 300) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return useQuery<Equipment[], Error>({
    queryKey: ['equipments', 'search', debouncedQuery],
    queryFn: () => searchEquipments(debouncedQuery),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled, backend returns recent if empty query
  });
};

/**
 * Hook for fetching a single equipment by ID
 */
export const useEquipment = (id: string | undefined) => {
  return useQuery<Equipment, Error>({
    queryKey: ['equipment', id],
    queryFn: () => getEquipmentById(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
