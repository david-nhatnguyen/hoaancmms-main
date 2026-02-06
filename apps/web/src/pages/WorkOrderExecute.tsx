import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Square,
  CheckCircle,
  Camera,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  workOrders, 
  WO_STATUS_LABELS,
  WorkOrder,
  WorkOrderChecklistItem,
  calculateProgress,
  calculateDuration,
  RESULT_LABELS
} from '@/data/workOrderData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

export default function WorkOrderExecute() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isMobile = useIsMobile();
  
  const wo = workOrders.find(w => w.id === id);
  
  const [items, setItems] = useState<WorkOrderChecklistItem[]>(wo?.items || []);
  const [status, setStatus] = useState<WorkOrder['status']>(wo?.status || 'new');
  const [startTime, setStartTime] = useState<string | null>(wo?.startTime || null);
  const [endTime, setEndTime] = useState<string | null>(wo?.endTime || null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [totalNotes, setTotalNotes] = useState(wo?.totalNotes || '');

  if (!wo) {
    return (
      <div className={cn(
        "text-center py-12",
        isMobile ? "px-4" : "p-6"
      )}>
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">Không tìm thấy phiếu công việc</p>
        <Button variant="outline" onClick={() => navigate('/work-orders')} className="border-border">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const progress = calculateProgress(items);
  const okCount = items.filter(i => i.result === 'ok').length;
  const ngCount = items.filter(i => i.result === 'ng').length;
  const naCount = items.filter(i => i.result === 'na').length;
  const ngItems = items.filter(i => i.result === 'ng');
  const pendingItems = items.filter(i => i.result === null);

  const handleStart = () => {
    const now = new Date().toISOString();
    setStartTime(now);
    setStatus('in-progress');
    toast.success('Đã bắt đầu thực hiện công việc');
  };

  const handleSetResult = (itemId: string, result: 'ok' | 'ng' | 'na') => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        // If NG, expand to require notes
        if (result === 'ng') {
          setExpandedItem(itemId);
        }
        return { ...item, result };
      }
      return item;
    }));
  };

  const handleUpdateNotes = (itemId: string, notes: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, notes } : item
    ));
  };

  const handleSave = () => {
    toast.success('Đã lưu tiến độ');
  };

  const handleComplete = () => {
    // Validate: all items must have results
    if (pendingItems.length > 0) {
      toast.error(`Còn ${pendingItems.length} mục chưa hoàn thành`);
      return;
    }
    
    // Validate: NG items must have notes
    const ngWithoutNotes = ngItems.filter(i => !i.notes.trim());
    if (ngWithoutNotes.length > 0) {
      toast.error('Các mục NG phải có ghi chú');
      return;
    }

    setShowCompleteDialog(true);
  };

  const confirmComplete = () => {
    const now = new Date().toISOString();
    setEndTime(now);
    setStatus('completed');
    setShowCompleteDialog(false);
    toast.success('Đã hoàn thành phiếu công việc');
    navigate('/work-orders');
  };

  const getStatusBadge = (status: WorkOrder['status']) => {
    const styles = {
      'new': 'bg-muted text-muted-foreground',
      'in-progress': 'bg-status-maintenance/20 text-[hsl(var(--status-maintenance))]',
      'completed': 'bg-status-active/20 text-[hsl(var(--status-active))]'
    };
    return (
      <span className={cn('status-badge text-xs', styles[status])}>
        {WO_STATUS_LABELS[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background max-w-full overflow-x-hidden">
      {/* Sticky Header */}
      <div className={cn(
        "sticky top-0 z-40 bg-card border-b border-border shadow-sm",
        isMobile ? "px-4 py-3" : "p-4"
      )}>
        {/* Header row */}
        <div className={cn(
          "flex items-start gap-3 mb-3",
          isMobile && "flex-wrap"
        )}>
          {!isMobile && (
            <Button variant="ghost" size="icon" onClick={() => navigate('/work-orders')} className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                "font-mono text-primary font-medium",
                isMobile ? "text-xs" : "text-sm"
              )}>{wo.code}</span>
              {getStatusBadge(status)}
            </div>
            <p className={cn(
              "text-muted-foreground mt-0.5 truncate",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {wo.equipmentCode} - {wo.equipmentName}
            </p>
          </div>
          <div className={cn(
            "flex items-center gap-2 shrink-0",
            isMobile && "w-full mt-2"
          )}>
            {status === 'new' && (
              <Button 
                onClick={handleStart} 
                className={cn(
                  "action-btn-primary",
                  isMobile && "flex-1 h-9"
                )}
              >
                <Play className="h-4 w-4" />
                <span className={isMobile ? "text-xs" : ""}>Bắt đầu</span>
              </Button>
            )}
            {status === 'in-progress' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleSave}
                  className={cn(isMobile && "flex-1 h-9 text-xs")}
                >
                  Lưu tạm
                </Button>
                <Button 
                  onClick={handleComplete} 
                  className={cn(
                    "bg-[hsl(var(--status-active))] hover:bg-[hsl(var(--status-active))]/90",
                    isMobile && "flex-1 h-9"
                  )}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className={isMobile ? "text-xs" : ""}>Hoàn thành</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {status !== 'new' && (
          <div className="flex items-center gap-3">
            <Progress value={progress} className="flex-1 h-2" />
            <span className={cn(
              "font-medium w-10 text-right",
              isMobile ? "text-xs" : "text-sm"
            )}>{progress}%</span>
          </div>
        )}

        {/* Time Display */}
        {status !== 'new' && (
          <div className={cn(
            "flex items-center gap-3 mt-2",
            isMobile ? "text-[11px]" : "text-sm"
          )}>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
              <span>Bắt đầu: {startTime ? new Date(startTime).toLocaleTimeString('vi-VN') : '-'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span>Thời gian: {calculateDuration(startTime, endTime)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Work Order Info */}
      <div className={cn(isMobile ? "px-4 py-3" : "p-4")}>
        <div className={cn(
          "bg-card rounded-xl border border-border/50 mb-3",
          isMobile ? "p-3" : "p-4 mb-4"
        )}>
          <h3 className={cn("font-semibold mb-2", isMobile && "text-sm")}>Thông tin công việc</h3>
          <div className={cn(
            "grid gap-2",
            isMobile ? "grid-cols-1 text-xs" : "grid-cols-2 gap-3 text-sm"
          )}>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nhóm thiết bị:</span>
              <span className="font-medium text-right ml-2 truncate max-w-[60%]">{wo.equipmentGroup}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Loại máy:</span>
              <span className="font-medium text-right ml-2 truncate max-w-[60%]">{wo.machineType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Checklist:</span>
              <span className="font-medium text-right ml-2 truncate max-w-[60%]">{wo.checklistName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ngày kế hoạch:</span>
              <span className="font-medium">{new Date(wo.plannedDate).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className={cn("flex justify-between", !isMobile && "col-span-2")}>
              <span className="text-muted-foreground">Người thực hiện:</span>
              <span className="font-medium">{wo.assignee}</span>
            </div>
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-2">
          <h3 className={cn("font-semibold", isMobile && "text-sm")}>
            Thực hiện Checklist ({items.length} mục)
          </h3>
          
          {items.map((item, idx) => (
            <div 
              key={item.id}
              className={cn(
                "bg-card rounded-xl border border-border/50 overflow-hidden transition-all",
                item.result === 'ng' && "border-destructive/50",
                item.result === 'ok' && "border-[hsl(var(--status-active))]/30"
              )}
            >
              {/* Item Header */}
              <div 
                className={cn(
                  "cursor-pointer",
                  isMobile ? "p-3" : "p-4"
                )}
                onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
              >
                <div className="flex items-start gap-2.5">
                  <div className={cn(
                    "rounded-full flex items-center justify-center shrink-0 font-medium",
                    isMobile ? "h-7 w-7 text-xs" : "h-8 w-8 text-sm",
                    item.result === 'ok' && "bg-[hsl(var(--status-active))]/20 text-[hsl(var(--status-active))]",
                    item.result === 'ng' && "bg-destructive/20 text-destructive",
                    item.result === 'na' && "bg-muted text-muted-foreground",
                    item.result === null && "bg-secondary text-foreground"
                  )}>
                    {item.result ? (
                      item.result === 'ok' ? <Check className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} /> :
                      item.result === 'ng' ? <X className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} /> :
                      'N/A'
                    ) : idx + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={cn("font-medium", isMobile && "text-sm")}>{item.task}</p>
                      {item.required && (
                        <span className="text-xs text-destructive">*</span>
                      )}
                      {item.requireImage && (
                        <Camera className={cn("text-muted-foreground", isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                      )}
                    </div>
                    <p className={cn(
                      "text-muted-foreground mt-0.5 line-clamp-1",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      {item.standard}
                    </p>
                  </div>

                  {expandedItem === item.id ? (
                    <ChevronUp className={cn("text-muted-foreground shrink-0", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  ) : (
                    <ChevronDown className={cn("text-muted-foreground shrink-0", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  )}
                </div>

                {/* Quick Result Buttons (always visible) */}
                {status === 'in-progress' && (
                  <div 
                    className={cn(
                      "flex gap-2 mt-3",
                      isMobile ? "ml-9" : "ml-11"
                    )} 
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleSetResult(item.id, 'ok')}
                      className={cn(
                        "flex-1 rounded-lg font-medium transition-all border-2",
                        isMobile ? "py-2 text-xs" : "py-2.5 text-sm",
                        item.result === 'ok' 
                          ? "bg-[hsl(var(--status-active))] text-white border-[hsl(var(--status-active))]" 
                          : "bg-[hsl(var(--status-active))]/10 text-[hsl(var(--status-active))] border-[hsl(var(--status-active))]/30 hover:bg-[hsl(var(--status-active))]/20"
                      )}
                    >
                      OK
                    </button>
                    <button
                      onClick={() => handleSetResult(item.id, 'ng')}
                      className={cn(
                        "flex-1 rounded-lg font-medium transition-all border-2",
                        isMobile ? "py-2 text-xs" : "py-2.5 text-sm",
                        item.result === 'ng' 
                          ? "bg-destructive text-white border-destructive" 
                          : "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
                      )}
                    >
                      NG
                    </button>
                    <button
                      onClick={() => handleSetResult(item.id, 'na')}
                      className={cn(
                        "flex-1 rounded-lg font-medium transition-all border-2",
                        isMobile ? "py-2 text-xs" : "py-2.5 text-sm",
                        item.result === 'na' 
                          ? "bg-muted-foreground text-white border-muted-foreground" 
                          : "bg-muted text-muted-foreground border-muted hover:bg-muted/80"
                      )}
                    >
                      N/A
                    </button>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {expandedItem === item.id && (
                <div className={cn(
                  "space-y-2.5 border-t border-border/50",
                  isMobile ? "px-3 pb-3 pt-2.5" : "px-4 pb-4 pt-3 space-y-3"
                )}>
                  <div className={cn(
                    "grid gap-2",
                    isMobile ? "grid-cols-1 text-xs" : "grid-cols-1 gap-2 text-sm"
                  )}>
                    <div className={cn(
                      "bg-secondary/30 rounded-lg",
                      isMobile ? "p-2.5" : "p-3"
                    )}>
                      <span className="text-muted-foreground block mb-1">Tiêu chuẩn phán định:</span>
                      <p>{item.standard}</p>
                    </div>
                    <div className={cn(
                      "bg-secondary/30 rounded-lg",
                      isMobile ? "p-2.5" : "p-3"
                    )}>
                      <span className="text-muted-foreground block mb-1">Phương pháp kiểm tra:</span>
                      <p>{item.method}</p>
                    </div>
                    <div className={cn(
                      "bg-secondary/30 rounded-lg",
                      isMobile ? "p-2.5" : "p-3"
                    )}>
                      <span className="text-muted-foreground block mb-1">Nội dung bảo dưỡng:</span>
                      <p>{item.content}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className={cn(
                      "text-muted-foreground mb-1.5 block",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      Ghi chú {item.result === 'ng' && <span className="text-destructive">*</span>}
                    </label>
                    <Textarea
                      value={item.notes}
                      onChange={(e) => handleUpdateNotes(item.id, e.target.value)}
                      placeholder={item.result === 'ng' ? 'Bắt buộc ghi chú khi NG...' : 'Ghi chú thêm...'}
                      className={cn(
                        "bg-secondary/50 border-border resize-none",
                        isMobile && "text-sm",
                        item.result === 'ng' && !item.notes && "border-destructive/50"
                      )}
                      rows={2}
                    />
                  </div>

                  {/* Image Upload */}
                  {item.requireImage && (
                    <div>
                      <label className={cn(
                        "text-muted-foreground mb-1.5 block",
                        isMobile ? "text-xs" : "text-sm"
                      )}>
                        Hình ảnh đính kèm <span className="text-destructive">*</span>
                      </label>
                      <Button 
                        variant="outline" 
                        className={cn(
                          "w-full border-dashed",
                          isMobile ? "h-16" : "h-20"
                        )}
                      >
                        <Camera className={cn(isMobile ? "h-4 w-4 mr-1.5" : "h-5 w-5 mr-2")} />
                        <span className={isMobile ? "text-xs" : ""}>Chụp / Tải ảnh</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Complete Confirmation Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className={cn(
          "bg-card border-border",
          isMobile ? "max-w-[calc(100vw-32px)] mx-4" : "max-w-md"
        )}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className={cn("text-[hsl(var(--status-active))]", isMobile ? "h-4 w-4" : "h-5 w-5")} />
              <span className={isMobile ? "text-base" : ""}>Xác nhận hoàn thành</span>
            </DialogTitle>
            <DialogDescription className={isMobile ? "text-xs" : ""}>
              Kiểm tra lại kết quả trước khi hoàn thành công việc
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-2">
              <div className={cn(
                "bg-[hsl(var(--status-active))]/10 rounded-lg text-center",
                isMobile ? "p-2.5" : "p-3"
              )}>
                <p className={cn("font-bold text-[hsl(var(--status-active))]", isMobile ? "text-xl" : "text-2xl")}>{okCount}</p>
                <p className={cn("text-muted-foreground", isMobile ? "text-[10px]" : "text-xs")}>OK</p>
              </div>
              <div className={cn(
                "bg-destructive/10 rounded-lg text-center",
                isMobile ? "p-2.5" : "p-3"
              )}>
                <p className={cn("font-bold text-destructive", isMobile ? "text-xl" : "text-2xl")}>{ngCount}</p>
                <p className={cn("text-muted-foreground", isMobile ? "text-[10px]" : "text-xs")}>NG</p>
              </div>
              <div className={cn(
                "bg-muted rounded-lg text-center",
                isMobile ? "p-2.5" : "p-3"
              )}>
                <p className={cn("font-bold text-muted-foreground", isMobile ? "text-xl" : "text-2xl")}>{naCount}</p>
                <p className={cn("text-muted-foreground", isMobile ? "text-[10px]" : "text-xs")}>N/A</p>
              </div>
            </div>

            {/* NG Items Warning */}
            {ngItems.length > 0 && (
              <div className={cn(
                "bg-destructive/10 border border-destructive/30 rounded-lg",
                isMobile ? "p-2.5" : "p-3"
              )}>
                <div className={cn(
                  "flex items-center gap-2 text-destructive font-medium mb-2",
                  isMobile && "text-sm"
                )}>
                  <AlertTriangle className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                  Các mục NG ({ngItems.length})
                </div>
                <ul className={cn("space-y-1", isMobile ? "text-xs" : "text-sm")}>
                  {ngItems.map(item => (
                    <li key={item.id} className="text-muted-foreground">
                      • {item.task}: {item.notes}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Total Notes */}
            <div>
              <label className={cn(
                "text-muted-foreground mb-1.5 block",
                isMobile ? "text-xs" : "text-sm"
              )}>
                Ghi chú tổng
              </label>
              <Textarea
                value={totalNotes}
                onChange={(e) => setTotalNotes(e.target.value)}
                placeholder="Nhận xét chung về công việc..."
                className={cn(
                  "bg-secondary/50 border-border resize-none",
                  isMobile && "text-sm"
                )}
                rows={isMobile ? 2 : 3}
              />
            </div>

            {/* Time Summary */}
            <div className={cn(
              "bg-secondary/30 rounded-lg flex items-center justify-between",
              isMobile ? "p-2.5" : "p-3"
            )}>
              <span className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>Tổng thời gian:</span>
              <span className={cn("font-medium", isMobile ? "text-sm" : "")}>{calculateDuration(startTime, new Date().toISOString())}</span>
            </div>
          </div>

          <DialogFooter className={cn("gap-2", isMobile && "flex-row")}>
            <Button 
              variant="outline" 
              onClick={() => setShowCompleteDialog(false)}
              className={cn(isMobile && "flex-1 h-9 text-xs")}
            >
              Quay lại
            </Button>
            <Button 
              onClick={confirmComplete} 
              className={cn(
                "bg-[hsl(var(--status-active))] hover:bg-[hsl(var(--status-active))]/90",
                isMobile && "flex-1 h-9 text-xs"
              )}
            >
              Xác nhận hoàn thành
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
