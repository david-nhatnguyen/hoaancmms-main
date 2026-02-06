import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightPanelProps {
  title: string;
  insights: string[];
  type?: 'info' | 'warning' | 'success';
}

export function InsightPanel({ title, insights, type = 'info' }: InsightPanelProps) {
  const typeStyles = {
    info: {
      container: 'bg-primary/5 border-primary/20',
      icon: 'bg-primary/20 text-primary',
      dot: 'bg-primary'
    },
    warning: {
      container: 'bg-status-maintenance/5 border-status-maintenance/20',
      icon: 'bg-status-maintenance/20 text-[hsl(var(--status-maintenance))]',
      dot: 'bg-status-maintenance'
    },
    success: {
      container: 'bg-status-active/5 border-status-active/20',
      icon: 'bg-status-active/20 text-[hsl(var(--status-active))]',
      dot: 'bg-status-active'
    }
  };

  const styles = typeStyles[type];

  return (
    <div className={cn(
      "rounded-xl border p-2.5 md:p-4 max-w-full overflow-hidden",
      styles.container
    )}>
      <div className="flex items-center gap-1.5 mb-1.5 md:mb-3">
        <div className={cn("p-1 md:p-1.5 rounded-lg shrink-0", styles.icon)}>
          <Lightbulb className="h-3 w-3 md:h-4 md:w-4" />
        </div>
        <h4 className="font-semibold text-xs md:text-sm truncate">{title}</h4>
      </div>
      
      <ul className="space-y-1 md:space-y-2">
        {insights.slice(0, 3).map((insight, idx) => (
          <li key={idx} className="flex items-start gap-1.5 text-[11px] md:text-sm">
            <span className={cn("h-1 w-1 md:h-1.5 md:w-1.5 rounded-full mt-1.5 shrink-0", styles.dot)} />
            <span className="text-muted-foreground line-clamp-2 leading-snug">{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
