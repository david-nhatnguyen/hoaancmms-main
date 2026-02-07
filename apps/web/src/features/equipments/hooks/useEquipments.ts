import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentsApi } from '@/api/endpoints/equipments.api';
import type { EquipmentQueryParams, CreateEquipmentDto, UpdateEquipmentDto } from '@/api/types/equipment.types';

export const EQUIPMENT_KEYS = {
    all: ['equipments'] as const,
    list: (params: EquipmentQueryParams) => [...EQUIPMENT_KEYS.all, 'list', params] as const,
    details: (id: string) => [...EQUIPMENT_KEYS.all, 'detail', id] as const,
    stats: () => [...EQUIPMENT_KEYS.all, 'stats'] as const,
};

/**
 * Hook to fetch equipments
 */
export function useEquipments(params: EquipmentQueryParams) {
    return useQuery({
        queryKey: EQUIPMENT_KEYS.list(params),
        queryFn: () => equipmentsApi.getAll(params),
        placeholderData: (previousData) => previousData,
    });
}

/**
 * Hook to fetch equipment stats
 */
export function useEquipmentStats() {
    return useQuery({
        queryKey: EQUIPMENT_KEYS.stats(),
        queryFn: () => equipmentsApi.getStats(),
    });
}

/**
 * Hook to fetch a single equipment
 */
export function useEquipment(id: string) {
    return useQuery({
        queryKey: EQUIPMENT_KEYS.details(id),
        queryFn: () => equipmentsApi.getById(id),
        enabled: !!id,
    });
}

/**
 * Hook to create equipment
 */
export function useCreateEquipment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateEquipmentDto) => equipmentsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEYS.all });
        },
    });
}

/**
 * Hook to update equipment
 */
export function useUpdateEquipment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateEquipmentDto }) => 
            equipmentsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEYS.all });
            // In a real generic ApiResponse wrapper, we might need to access data.data.ID
            // But assuming equipmentsApi returns the Equipment object or ApiResponse<Equipment>
            // Ideally should invalidate by the ID returned.
            // For safety just invalidate the specific detail if ID is available.
            // Using logic from input is safer:
             // queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEYS.details(data.id) }); 
             // BE CAREFUL: data might be ApiResponse wrapper.
        },
    });
}

/**
 * Hook to delete equipment
 */
export function useDeleteEquipment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => equipmentsApi.delete(id),
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEYS.all });
        },
    });
}
