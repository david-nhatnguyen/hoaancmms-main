import { STATUS_OPTIONS } from '../hooks/useEquipmentFilters';

/**
 * Pure function to get human-readable labels for equipment filters
 */
export const getEquipmentFilterLabel = (
  id: string, 
  value: any, 
  factoryOptions: { label: string; value: string; code?: string; id?: string }[]
): string => {
  if (id === 'status') {
    return STATUS_OPTIONS.find(opt => opt.value === value)?.label || value;
  }
  
  if (id === 'factoryName' || id === 'factoryId') {
    const factory = factoryOptions.find(opt => 
      opt.id === value || 
      opt.value === value
    );
    return factory ? factory.label : value;
  }
  
  return value;
};
