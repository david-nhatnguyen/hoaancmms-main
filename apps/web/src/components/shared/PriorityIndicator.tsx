import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { PRIORITY_LABELS } from '@/api/mock/mockData';

type PriorityType = 'high' | 'medium' | 'low';

interface PriorityIndicatorProps {
  priority: PriorityType;
  showLabel?: boolean;
  className?: string;
}

export function PriorityIndicator({ priority, showLabel = true, className }: PriorityIndicatorProps) {
  const Icon = priority === 'high' ? AlertTriangle : priority === 'medium' ? AlertCircle : CheckCircle;
  
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Icon 
        className={cn(
          "h-4 w-4",
          priority === 'high' && "priority-high",
          priority === 'medium' && "priority-medium",
          priority === 'low' && "priority-low"
        )} 
      />
      {showLabel && (
        <span className={cn(
          "text-sm",
          priority === 'high' && "priority-high",
          priority === 'medium' && "priority-medium",
          priority === 'low' && "priority-low"
        )}>
          {PRIORITY_LABELS[priority]}
        </span>
      )}
    </div>
  );
}
