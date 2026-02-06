import { useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RiskEquipment } from '@/data/dashboardData';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface RiskTableProps {
  data: RiskEquipment[];
  compact?: boolean;
  className?: string;
}

export function RiskTable({ data, compact = false, className }: RiskTableProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const getRiskBadge = (level: RiskEquipment['riskLevel']) => {
    const styles = {
      low: 'bg-status-active/20 text-[hsl(var(--status-active))]',
      medium: 'bg-status-maintenance/20 text-[hsl(var(--status-maintenance))]',
      high: 'bg-destructive/20 text-destructive'
    };
    const labels = { low: 'Thấp', medium: 'TB', high: 'Cao' };
    return (
      <span className={cn('status-badge text-xs', styles[level])}>
        {labels[level]}
      </span>
    );
  };

  const displayData = compact ? data.slice(0, 5) : data;

  // Mobile Card Layout
  if (isMobile) {
    return (
      <div className={cn("bg-card rounded-xl border border-border/50 overflow-hidden", className)}>
        {compact && (
          <div className="p-3 border-b border-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Top 5 Rủi ro cao
            </h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/dashboard/risk')}>
              Xem tất cả
            </Button>
          </div>
        )}
        <div className="divide-y divide-border/50">
          {displayData.map((eq) => (
            <div 
              key={eq.id}
              onClick={() => navigate(`/equipments/${eq.id}`)}
              className={cn(
                "p-3 active:bg-secondary/50 cursor-pointer",
                eq.riskLevel === 'high' && "bg-destructive/5"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    "font-medium text-sm truncate",
                    eq.riskLevel === 'high' && "text-destructive"
                  )}>
                    {eq.equipmentCode}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {eq.equipmentName}
                  </p>
                </div>
                {getRiskBadge(eq.riskLevel)}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className={cn(eq.pmOverdue > 0 && "text-destructive font-medium")}>
                  PM trễ: {eq.pmOverdue}
                </span>
                <span className={cn(eq.incidents > 1 && "text-[hsl(var(--status-maintenance))] font-medium")}>
                  Sự cố: {eq.incidents}
                </span>
                <span className={cn(eq.downtime > 4 && "text-destructive font-medium")}>
                  {eq.downtime}h
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop Table
  return (
    <div className={cn("bg-card rounded-xl border border-border/50 overflow-hidden flex flex-col", className)}>
      {compact && (
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Top 5 Thiết bị rủi ro cao
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/risk')}>
            Xem tất cả
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/50">
            <TableHead className="table-header-cell">Thiết bị</TableHead>
            {!compact && <TableHead className="table-header-cell">Nhóm</TableHead>}
            <TableHead className="table-header-cell text-center">PM trễ</TableHead>
            <TableHead className="table-header-cell text-center">Sự cố</TableHead>
            <TableHead className="table-header-cell text-center">Downtime</TableHead>
            <TableHead className="table-header-cell text-center">Rủi ro</TableHead>
            {!compact && <TableHead className="table-header-cell text-right">Thao tác</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.map((eq) => (
            <TableRow 
              key={eq.id} 
              className={cn(
                "table-row-interactive",
                eq.riskLevel === 'high' && "bg-destructive/5"
              )}
            >
              <TableCell>
                <div>
                  <p className={cn(
                    "font-medium",
                    eq.riskLevel === 'high' && "text-destructive"
                  )}>
                    {eq.equipmentCode}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {eq.equipmentName}
                  </p>
                </div>
              </TableCell>
              {!compact && (
                <TableCell className="text-sm text-muted-foreground">
                  {eq.equipmentGroup}
                </TableCell>
              )}
              <TableCell className="text-center">
                <span className={cn(
                  "font-semibold",
                  eq.pmOverdue > 0 && "text-destructive"
                )}>
                  {eq.pmOverdue}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <span className={cn(
                  "font-semibold",
                  eq.incidents > 1 && "text-[hsl(var(--status-maintenance))]"
                )}>
                  {eq.incidents}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <span className={cn(
                  "font-semibold",
                  eq.downtime > 4 && "text-destructive"
                )}>
                  {eq.downtime}h
                </span>
              </TableCell>
              <TableCell className="text-center">
                {getRiskBadge(eq.riskLevel)}
              </TableCell>
              {!compact && (
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/equipments/${eq.id}`)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
