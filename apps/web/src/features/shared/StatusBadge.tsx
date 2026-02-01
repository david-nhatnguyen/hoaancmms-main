import { cn } from '@/lib/utils';
import { STATUS_LABELS } from '@/data/mockData';

type StatusType = 'active' | 'maintenance' | 'inactive';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "status-badge",
        status === 'active' && "status-active",
        status === 'maintenance' && "status-maintenance",
        status === 'inactive' && "status-inactive",
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
