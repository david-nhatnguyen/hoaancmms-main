import React from 'react';
import { cn } from '@/lib/utils';
import { ChecklistStatus, STATUS_LABELS } from '../types/checklist.types';

interface ChecklistStatusBadgeProps {
  status: ChecklistStatus;
  className?: string;
}

/**
 * ChecklistStatusBadge component
 * Displays status badge using REAL API ChecklistStatus enum
 */
export const ChecklistStatusBadge: React.FC<ChecklistStatusBadgeProps> = ({ status, className }) => {
  return (
    <span className={cn(
      'status-badge text-[10px] px-3 py-1',
      status === ChecklistStatus.ACTIVE && 'bg-status-active/20 text-status-active',
      status === ChecklistStatus.DRAFT && 'bg-muted text-muted-foreground',
      status === ChecklistStatus.INACTIVE && 'bg-status-inactive/20 text-status-inactive',
      className
    )}>
      {STATUS_LABELS[status]}
    </span>
  );
};
