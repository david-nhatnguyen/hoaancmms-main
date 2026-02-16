import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Eye, Clock, User, Wrench, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WorkOrder, WO_STATUS_LABELS, calculateProgress } from '@/data/workOrderData';
import { cn } from '@/lib/utils';

interface WorkOrderCalendarProps {
  workOrders: WorkOrder[];
}

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function WorkOrderCalendar({ workOrders }: WorkOrderCalendarProps) {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // January 2026
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Group work orders by date
  const workOrdersByDate = useMemo(() => {
    const map = new Map<string, WorkOrder[]>();
    workOrders.forEach(wo => {
      const dateKey = wo.plannedDate;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(wo);
    });
    return map;
  }, [workOrders]);

  // Calendar generation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getDateKey = (day: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const getWorkOrdersForDay = (day: number) => {
    return workOrdersByDate.get(getDateKey(day)) || [];
  };

  const isOverloaded = (day: number) => {
    return getWorkOrdersForDay(day).length > 3;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleWorkOrderClick = (wo: WorkOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedWorkOrder(wo);
    setDetailOpen(true);
  };

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'new':
        return 'bg-teal-600 hover:bg-teal-700';
      case 'in-progress':
        return 'bg-amber-600 hover:bg-amber-700';
      case 'completed':
        return 'bg-emerald-600 hover:bg-emerald-700';
      default:
        return 'bg-muted';
    }
  };


  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h3 className="font-semibold text-lg">Lịch Work Orders</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[140px] text-center font-medium">
            {monthNames[month]} {year}
          </div>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-border/50">
        {WEEKDAYS.map((day, idx) => (
          <div
            key={day}
            className={cn(
              "py-3 text-center text-sm font-medium",
              idx === 0 && "text-destructive"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, idx) => {
          const dayWOs = day ? getWorkOrdersForDay(day) : [];
          const overloaded = day ? isOverloaded(day) : false;
          const isSunday = idx % 7 === 0;

          return (
            <div
              key={idx}
              className={cn(
                "min-h-[120px] p-2 border-r border-b border-border/30",
                "transition-colors",
                day && "hover:bg-muted/30",
                idx % 7 === 6 && "border-r-0",
                overloaded && "bg-destructive/5"
              )}
            >
              {day && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-sm font-medium",
                      isSunday && "text-destructive"
                    )}>
                      {day}
                    </span>
                    {overloaded && (
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayWOs.slice(0, 3).map(wo => (
                      <button
                        key={wo.id}
                        onClick={(e) => handleWorkOrderClick(wo, e)}
                        className={cn(
                          "w-full text-left px-2 py-1 rounded text-xs font-medium text-white truncate transition-colors",
                          getStatusColor(wo.status)
                        )}
                        title={`${wo.equipmentCode} - ${wo.equipmentName}`}
                      >
                        {wo.equipmentCode}
                      </button>
                    ))}
                    {dayWOs.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center py-0.5">
                        +{dayWOs.length - 3} công việc khác
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 p-4 border-t border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <span className="text-sm text-muted-foreground">Mới</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-sm text-muted-foreground">Đang làm</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm text-muted-foreground">Hoàn thành</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
          <span className="text-sm text-muted-foreground">Quá tải (&gt;3 công việc)</span>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Chi tiết Work Order
            </DialogTitle>
          </DialogHeader>

          {selectedWorkOrder && (
            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-primary font-semibold text-lg">
                  {selectedWorkOrder.code}
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium text-white",
                  getStatusColor(selectedWorkOrder.status)
                )}>
                  {WO_STATUS_LABELS[selectedWorkOrder.status]}
                </span>
              </div>

              {/* Equipment Info */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Thiết bị</p>
                  <p className="font-semibold">{selectedWorkOrder.equipmentCode} - {selectedWorkOrder.equipmentName}</p>
                  <p className="text-sm text-muted-foreground">{selectedWorkOrder.equipmentGroup}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Checklist</p>
                    <p className="text-sm font-medium">{selectedWorkOrder.checklistName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Nhà máy</p>
                    <p className="text-sm font-medium">{selectedWorkOrder.factoryName}</p>
                  </div>
                </div>
              </div>

              {/* Date & Assignee */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Ngày kế hoạch</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedWorkOrder.plannedDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Người thực hiện</p>
                    <p className="text-sm font-medium">{selectedWorkOrder.assignee}</p>
                  </div>
                </div>
              </div>

              {/* Progress for in-progress */}
              {selectedWorkOrder.status === 'in-progress' && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-amber-600 font-medium">Tiến độ thực hiện</span>
                    <span className="text-sm font-bold text-amber-600">
                      {calculateProgress(selectedWorkOrder.items)}%
                    </span>
                  </div>
                  <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${calculateProgress(selectedWorkOrder.items)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Đã hoàn thành {selectedWorkOrder.items.filter(i => i.result !== null).length}/{selectedWorkOrder.items.length} hạng mục
                  </p>
                </div>
              )}

              {/* Completed info */}
              {selectedWorkOrder.status === 'completed' && selectedWorkOrder.totalNotes && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-xs text-emerald-600 font-medium mb-1">Ghi chú hoàn thành</p>
                  <p className="text-sm">{selectedWorkOrder.totalNotes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setDetailOpen(false);
                    navigate(`/work-orders/${selectedWorkOrder.id}`);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Xem chi tiết
                </Button>
                {selectedWorkOrder.status !== 'completed' && (
                  <Button
                    className={cn(
                      "flex-1",
                      selectedWorkOrder.status === 'new'
                        ? "bg-teal-600 hover:bg-teal-700"
                        : "bg-amber-600 hover:bg-amber-700"
                    )}
                    onClick={() => {
                      setDetailOpen(false);
                      navigate(`/work-orders/${selectedWorkOrder.id}/execute`);
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {selectedWorkOrder.status === 'new' ? 'Bắt đầu' : 'Tiếp tục'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}