import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { KPICard as KPICardType } from '@/api/mock/dashboardData';

interface KPICardProps {
  data: KPICardType;
  className?: string;
}

const iconMap: Record<string, React.ElementType> = {
  'pm-completion': CheckCircle2,
  'pm-overdue': Clock,
  'incidents': AlertTriangle,
  'downtime': XCircle,
  'high-risk': AlertCircle
};

export function KPICard({ data, className }: KPICardProps) {
  const Icon = iconMap[data.id] || Wrench;
  
  const statusStyles = {
    success: 'border-status-active/30 bg-status-active/5',
    warning: 'border-status-maintenance/30 bg-status-maintenance/5',
    danger: 'border-destructive/30 bg-destructive/5'
  };

  const iconStyles = {
    success: 'bg-status-active/20 text-[hsl(var(--status-active))]',
    warning: 'bg-status-maintenance/20 text-[hsl(var(--status-maintenance))]',
    danger: 'bg-destructive/20 text-destructive'
  };

  const valueStyles = {
    success: 'text-[hsl(var(--status-active))]',
    warning: 'text-[hsl(var(--status-maintenance))]',
    danger: 'text-destructive'
  };

  const TrendIcon = data.trend === 'up' ? TrendingUp : data.trend === 'down' ? TrendingDown : Minus;

  return (
    <div className={cn(
      "bg-card rounded-xl border-2 p-4 transition-all hover:shadow-lg",
      statusStyles[data.status],
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2 rounded-lg", iconStyles[data.status])}>
          <Icon className="h-5 w-5" />
        </div>
        {data.trendValue && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            data.trend === 'up' && data.status === 'danger' && "bg-destructive/10 text-destructive",
            data.trend === 'up' && data.status !== 'danger' && "bg-status-active/10 text-[hsl(var(--status-active))]",
            data.trend === 'down' && data.status === 'danger' && "bg-status-active/10 text-[hsl(var(--status-active))]",
            data.trend === 'down' && data.status !== 'danger' && "bg-destructive/10 text-destructive",
            data.trend === 'stable' && "bg-muted text-muted-foreground"
          )}>
            <TrendIcon className="h-3 w-3" />
            {data.trendValue}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{data.label}</p>
        <div className="flex items-baseline gap-1">
          <span className={cn("text-3xl font-bold", valueStyles[data.status])}>
            {data.value}
          </span>
          {data.unit && (
            <span className="text-lg text-muted-foreground">{data.unit}</span>
          )}
        </div>
      </div>
    </div>
  );
}
