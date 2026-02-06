import { cn } from '@/lib/utils';
import { STATUS_LABELS } from '@/data/mockData';

export type StatusType = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "status-badge",
        status === 'ACTIVE' && "status-active",
        status === 'MAINTENANCE' && "status-maintenance",
        status === 'INACTIVE' && "status-inactive",
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
