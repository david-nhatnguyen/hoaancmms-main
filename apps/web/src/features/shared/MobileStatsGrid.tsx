import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export interface StatItem {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBgClass: string;
  valueClass?: string;
  cardClass?: string;
}

interface MobileStatsGridProps {
  stats: StatItem[];
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  className?: string;
}

export function MobileStatsGrid({ 
  stats, 
  columns = { mobile: 2, tablet: 3, desktop: 4 },
  className
}: MobileStatsGridProps) {
  const isMobile = useIsMobile();

  // On mobile, show compact 2-column grid with smaller cards
  if (isMobile) {
    return (
      <div className={cn(
        "grid gap-2 mb-3 max-w-full overflow-hidden",
        columns.mobile === 2 && "grid-cols-2",
        columns.mobile === 3 && "grid-cols-3",
        columns.mobile === 1 && "grid-cols-1",
        className
      )}>
        {stats.map((stat, idx) => (
          <div key={idx} className={cn("stat-card p-2.5 min-w-0 overflow-hidden", stat.cardClass)}>
            <div className="flex items-center gap-1.5 mb-1">
              <div className={cn("h-6 w-6 rounded-md flex items-center justify-center shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5", stat.iconBgClass)}>
                {stat.icon}
              </div>
              <p className="text-[10px] text-muted-foreground truncate leading-tight">{stat.label}</p>
            </div>
            <p className={cn("text-lg font-bold", stat.valueClass)}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    );
  }

  // Desktop/Tablet - larger cards in row
  return (
    <div className={cn(
      "grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      className
    )}>
      {stats.map((stat, idx) => (
        <div key={idx} className={cn("stat-card flex items-center justify-between", stat.cardClass)}>
          <div>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className={cn("text-3xl font-bold", stat.valueClass)}>
              {stat.value}
            </p>
          </div>
          <div className={cn("stat-card-icon", stat.iconBgClass)}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
