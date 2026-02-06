import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  AlertTriangle, 
  AlertCircle,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionItem } from '@/data/dashboardData';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ActionCenterProps {
  data: ActionItem[];
  compact?: boolean;
  className?: string;
}

const typeConfig = {
  'pm-overdue': { icon: Clock, label: 'PM quá hạn', color: 'text-destructive' },
  'high-risk': { icon: AlertTriangle, label: 'Rủi ro cao', color: 'text-[hsl(var(--status-maintenance))]' },
  'incident-open': { icon: AlertCircle, label: 'Sự cố mở', color: 'text-destructive' }
};

const priorityStyles = {
  critical: 'bg-destructive/20 text-destructive border-destructive/30',
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-status-maintenance/10 text-[hsl(var(--status-maintenance))] border-status-maintenance/20',
  low: 'bg-muted text-muted-foreground border-border'
};

const priorityLabels = {
  critical: 'Khẩn cấp',
  high: 'Cao',
  medium: 'Trung bình',
  low: 'Thấp'
};

export function ActionCenter({ data, compact = false, className }: ActionCenterProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const displayData = compact ? data.slice(0, isMobile ? 3 : 4) : data;

  return (
    <div className={cn("bg-card rounded-xl border border-border/50 overflow-hidden flex flex-col", className)}>
      <div className={cn(
        "border-b border-border/50 flex items-center justify-between",
        isMobile ? "p-3" : "p-4"
      )}>
        <h3 className={cn(
          "font-semibold flex items-center gap-2",
          isMobile && "text-sm"
        )}>
          <AlertCircle className="h-4 w-4 text-primary" />
          {isMobile ? "Cần xử lý" : "Hành động cần xử lý"}
          <span className="ml-1 px-1.5 py-0.5 bg-destructive/20 text-destructive text-xs rounded-full font-bold">
            {data.length}
          </span>
        </h3>
        {compact && (
          <Button variant="ghost" size="sm" className={cn(isMobile && "h-7 text-xs")} onClick={() => navigate('/dashboard/actions')}>
            Xem tất cả
          </Button>
        )}
      </div>

      <div className="divide-y divide-border/50">
        {displayData.map((action) => {
          const config = typeConfig[action.type];
          const Icon = config.icon;
          
          return (
            <div 
              key={action.id}
              className={cn(
                "transition-colors",
                isMobile ? "p-3" : "p-4 hover:bg-secondary/30",
                action.priority === 'critical' && "bg-destructive/5"
              )}
            >
              <div className="flex items-start gap-2 md:gap-3">
                <div className={cn(
                  "p-1.5 md:p-2 rounded-lg shrink-0",
                  action.priority === 'critical' ? "bg-destructive/20" : "bg-secondary"
                )}>
                  <Icon className={cn("h-3.5 w-3.5 md:h-4 md:w-4", config.color)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 md:gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-primary text-xs md:text-sm font-medium truncate">
                      {action.equipmentCode}
                    </span>
                    <span className={cn(
                      "text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full border font-medium shrink-0",
                      priorityStyles[action.priority]
                    )}>
                      {priorityLabels[action.priority]}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm font-medium mb-0.5 md:mb-1 truncate">{action.equipmentName}</p>
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{action.issue}</p>
                  
                  {/* Action Buttons - Simplified on mobile */}
                  <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2 md:mt-3">
                    {action.actions.slice(0, isMobile ? 1 : action.actions.length).map((act, idx) => (
                      <Button
                        key={idx}
                        variant={idx === 0 ? "default" : "outline"}
                        size="sm"
                        onClick={() => navigate(act.url)}
                        className={cn(
                          idx === 0 ? "action-btn-primary" : "",
                          isMobile && "h-7 text-xs px-2"
                        )}
                      >
                        {act.label}
                        {!isMobile && <ExternalLink className="h-3 w-3 ml-1" />}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {data.length === 0 && (
        <div className={cn(
          "text-center text-muted-foreground",
          isMobile ? "p-6" : "p-8"
        )}>
          <AlertCircle className={cn(
            "mx-auto mb-2 opacity-50",
            isMobile ? "h-6 w-6" : "h-8 w-8"
          )} />
          <p className={cn(isMobile && "text-sm")}>Không có hành động cần xử lý</p>
        </div>
      )}
    </div>
  );
}
