
import { FactoryStatus } from "@/api/types/factory.types";

/**
 * Factory Status options for filters and display
 */
export const STATUS_OPTIONS: { value: FactoryStatus; label: string; color: string }[] = [
  { value: 'ACTIVE', label: 'Hoạt động', color: 'bg-status-active' },
  { value: 'INACTIVE', label: 'Ngừng hoạt động', color: 'bg-status-inactive' }
];

/**
 * Pure function to get human-readable labels for factory filters
 */
export const getFactoryFilterLabel = (
  id: string, 
  value: any, 
): string => {
  if (id === 'status') {
    return STATUS_OPTIONS.find(opt => opt.value === value)?.label || value;
  }
  
  return value;
};
