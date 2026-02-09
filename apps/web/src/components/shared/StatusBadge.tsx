import { cn } from '@/lib/utils';
import { STATUS_LABELS } from '@/data/mockData';

type StatusType = 'active' | 'maintenance' | 'inactive' | 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

/**
 * Normalize status to lowercase for consistent rendering
 */
function normalizeStatus(status: StatusType): 'active' | 'maintenance' | 'inactive' {
  return status.toLowerCase() as 'active' | 'maintenance' | 'inactive';
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return null;
  
  const normalizedStatus = normalizeStatus(status);
  
  // STATUS_LABELS use uppercase keys, so we need to convert back for lookup
  const labelKey = normalizedStatus.toUpperCase() as keyof typeof STATUS_LABELS;
  
  return (
    <span
      className={cn(
        "status-badge",
        normalizedStatus === 'active' && "status-active",
        normalizedStatus === 'maintenance' && "status-maintenance",
        normalizedStatus === 'inactive' && "status-inactive",
        className
      )}
    >
      {STATUS_LABELS[labelKey] || status}
    </span>
  );
}
