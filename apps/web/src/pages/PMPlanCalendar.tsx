import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  AlertTriangle,
  Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  pmPlans, 
  getDaysInMonth, 
  getFirstDayOfMonth,
  PMPlanItem,
  PM_ITEM_STATUS_LABELS
} from '@/data/pmPlanData';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function PMPlanCalendar() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const plan = pmPlans.find(p => p.id === id);
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Group items by date
  const itemsByDate = useMemo(() => {
    if (!plan) return {};
    const grouped: Record<string, PMPlanItem[]> = {};
    plan.items.forEach(item => {
      if (item.plannedDate) {
        const date = item.plannedDate;
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(item);
      }
    });
    return grouped;
  }, [plan]);

  // Early return IF plan is missing, but Hook is now safe
  if (!plan) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Không tìm thấy kế hoạch</p>
        <Button variant="link" onClick={() => navigate('/pm-plans')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(plan.month, plan.year);
  const firstDayOfMonth = getFirstDayOfMonth(plan.month, plan.year);

  // Unscheduled items
  const unscheduledItems = plan.items.filter(i => !i.plannedDate);

  // Check overload (more than 3 items per day)
  const isOverloaded = (date: string) => {
    return (itemsByDate[date]?.length || 0) > 3;
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${plan.year}-${String(plan.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setShowDetailDialog(true);
  };

  const selectedDateItems = selectedDate ? itemsByDate[selectedDate] || [] : [];

  // Generate calendar grid
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/pm-plans/${plan.id}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <p className="page-subtitle">LỊCH BẢO DƯỠNG</p>
            <h1 className="page-title">{plan.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="action-btn-secondary">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-4 py-2 bg-secondary rounded-lg font-medium">
            Tháng {plan.month}/{plan.year}
          </span>
          <Button variant="outline" size="icon" className="action-btn-secondary">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Unscheduled Warning */}
      {unscheduledItems.length > 0 && (
        <div className="mb-6 p-4 bg-status-maintenance/10 border border-status-maintenance/30 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-[hsl(var(--status-maintenance))]" />
          <div>
            <p className="font-medium text-[hsl(var(--status-maintenance))]">
              {unscheduledItems.length} thiết bị chưa được lên lịch
            </p>
            <p className="text-sm text-muted-foreground">
              {unscheduledItems.map(i => i.equipmentCode).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-border/50">
          {WEEKDAYS.map((day, idx) => (
            <div 
              key={day} 
              className={cn(
                "py-3 text-center text-sm font-medium text-muted-foreground",
                idx === 0 && "text-destructive/70"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="min-h-[120px] border-b border-r border-border/30 bg-secondary/20" />;
            }

            const dateStr = `${plan.year}-${String(plan.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayItems = itemsByDate[dateStr] || [];
            const overloaded = isOverloaded(dateStr);
            const isWeekend = (firstDayOfMonth + day - 1) % 7 === 0;

            return (
              <div 
                key={day}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "min-h-[120px] p-2 border-b border-r border-border/30 cursor-pointer transition-colors hover:bg-secondary/30",
                  isWeekend && "bg-secondary/10",
                  overloaded && "bg-destructive/5"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-sm font-medium",
                    isWeekend && "text-destructive/70"
                  )}>
                    {day}
                  </span>
                  {overloaded && (
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayItems.slice(0, 3).map(item => (
                    <div 
                      key={item.id}
                      className={cn(
                        "px-2 py-1 rounded text-xs truncate",
                        item.status === 'work-order-created' 
                          ? "bg-status-active/20 text-[hsl(var(--status-active))]"
                          : "bg-primary/20 text-primary"
                      )}
                    >
                      {item.equipmentCode}
                    </div>
                  ))}
                  {dayItems.length > 3 && (
                    <div className="text-xs text-muted-foreground px-2">
                      +{dayItems.length - 3} thiết bị khác
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary/20" />
          <span className="text-muted-foreground">Đã lên lịch</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-status-active/20" />
          <span className="text-muted-foreground">Đã tạo Work Order</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
          <span className="text-muted-foreground">Quá tải (&gt;3 công việc)</span>
        </div>
      </div>

      {/* Date Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Công việc ngày {selectedDate ? new Date(selectedDate).toLocaleDateString('vi-VN') : ''}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            {selectedDateItems.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">
                Không có công việc bảo dưỡng
              </p>
            ) : (
              selectedDateItems.map(item => (
                <div 
                  key={item.id}
                  className="p-4 bg-secondary/30 rounded-lg border border-border/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        <span className="text-primary font-mono">{item.equipmentCode}</span>
                        {' '}- {item.equipmentName}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.machineType}
                      </p>
                    </div>
                    <span className={cn(
                      "status-badge text-xs",
                      item.status === 'work-order-created' 
                        ? "bg-status-active/20 text-[hsl(var(--status-active))]"
                        : "bg-primary/20 text-primary"
                    )}>
                      {PM_ITEM_STATUS_LABELS[item.status]}
                    </span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Checklist:</span>
                      <p className="font-medium">{item.checklistName || '-'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Người phụ trách:</span>
                      <p className="font-medium">{item.assignee || '-'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
