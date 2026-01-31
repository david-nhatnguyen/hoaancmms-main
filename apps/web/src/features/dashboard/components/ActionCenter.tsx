import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  AlertTriangle, 
  AlertCircle,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionItem } from '@/api/mock/dashboardData';
import { cn } from '@/lib/utils';

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
  const displayData = compact ? data.slice(0, 4) : data;

  return (
    <div className={cn("bg-card rounded-xl border border-border/50 overflow-hidden flex flex-col", className)}>
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          Hành động cần xử lý
          <span className="ml-1 px-2 py-0.5 bg-destructive/20 text-destructive text-xs rounded-full font-bold">
            {data.length}
          </span>
        </h3>
        {compact && (
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/actions')}>
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
                "p-4 transition-colors hover:bg-secondary/30",
                action.priority === 'critical' && "bg-destructive/5"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg shrink-0",
                  action.priority === 'critical' ? "bg-destructive/20" : "bg-secondary"
                )}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-primary text-sm font-medium">
                      {action.equipmentCode}
                    </span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full border font-medium",
                      priorityStyles[action.priority]
                    )}>
                      {priorityLabels[action.priority]}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1">{action.equipmentName}</p>
                  <p className="text-sm text-muted-foreground">{action.issue}</p>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {action.actions.map((act, idx) => (
                      <Button
                        key={idx}
                        variant={idx === 0 ? "default" : "outline"}
                        size="sm"
                        onClick={() => navigate(act.url)}
                        className={idx === 0 ? "action-btn-primary" : ""}
                      >
                        {act.label}
                        <ExternalLink className="h-3 w-3 ml-1" />
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
        <div className="p-8 text-center text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Không có hành động cần xử lý</p>
        </div>
      )}
    </div>
  );
}
