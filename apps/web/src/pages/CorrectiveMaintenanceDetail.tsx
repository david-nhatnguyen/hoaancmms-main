import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Pause,
  CheckCircle,
  Camera,
  AlertTriangle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  correctiveMaintenances, 
  CM_STATUS_LABELS,
  SEVERITY_LABELS,
  COMMON_CAUSES,
  REPAIR_RESULT_LABELS,
  CorrectiveMaintenance,
  calculateDowntime,
  calculateRepairDuration
} from '@/data/correctiveMaintenanceData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';

export default function CorrectiveMaintenanceDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isMobile = useIsMobile();
  
  const cm = correctiveMaintenances.find(c => c.id === id);
  
  const [status, setStatus] = useState<CorrectiveMaintenance['status']>(cm?.status || 'new');
  const [repairStartTime, setRepairStartTime] = useState<string | null>(cm?.repairStartTime || null);
  const [repairEndTime, setRepairEndTime] = useState<string | null>(cm?.repairEndTime || null);
  
  const [cause, setCause] = useState(cm?.cause || '');
  const [causeDescription, setCauseDescription] = useState(cm?.causeDescription || '');
  const [correctionAction, setCorrectionAction] = useState(cm?.correctionAction || '');
  const [repairResult, setRepairResult] = useState(cm?.repairResult || '');
  
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [confirmedBy, setConfirmedBy] = useState(cm?.confirmedBy || '');
  const [equipmentCondition, setEquipmentCondition] = useState(cm?.equipmentCondition || '');
  const [confirmNotes, setConfirmNotes] = useState(cm?.confirmNotes || '');
  
  const [incidentOpen, setIncidentOpen] = useState(true);
  const [repairOpen, setRepairOpen] = useState(true);
  const [timeOpen, setTimeOpen] = useState(false);

  if (!cm) {
    return (
      <div className={cn(
        "text-center py-12",
        isMobile ? "px-4" : "p-6"
      )}>
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">Không tìm thấy sự cố</p>
        <Button variant="outline" onClick={() => navigate('/corrective-maintenance')} className="border-border">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: CorrectiveMaintenance['status']) => {
    const styles = {
      'new': 'bg-muted text-muted-foreground',
      'in-progress': 'bg-status-maintenance/20 text-[hsl(var(--status-maintenance))]',
      'completed': 'bg-status-active/20 text-[hsl(var(--status-active))]',
      'closed': 'bg-primary/20 text-primary'
    };
    return (
      <span className={cn('status-badge text-xs', styles[status])}>
        {CM_STATUS_LABELS[status]}
      </span>
    );
  };

  const getSeverityBadge = (severity: CorrectiveMaintenance['severity']) => {
    const styles = {
      'low': 'bg-status-active/20 text-[hsl(var(--status-active))]',
      'medium': 'bg-status-maintenance/20 text-[hsl(var(--status-maintenance))]',
      'high': 'bg-destructive/20 text-destructive'
    };
    return (
      <span className={cn('status-badge text-xs', styles[severity])}>
        {SEVERITY_LABELS[severity]}
      </span>
    );
  };

  const handleStartRepair = () => {
    const now = new Date().toISOString();
    setRepairStartTime(now);
    setStatus('in-progress');
    toast.success('Đã bắt đầu sửa chữa');
  };

  const handlePauseRepair = () => {
    toast.info('Đã tạm dừng sửa chữa');
  };

  const handleComplete = () => {
    if (!cause) {
      toast.error('Vui lòng chọn nguyên nhân sự cố');
      return;
    }
    if (!correctionAction.trim()) {
      toast.error('Vui lòng nhập hành động khắc phục');
      return;
    }
    if (!repairResult) {
      toast.error('Vui lòng chọn kết quả sửa chữa');
      return;
    }
    
    setShowCompleteDialog(true);
  };

  const confirmComplete = () => {
    if (!confirmedBy.trim()) {
      toast.error('Vui lòng nhập tên người xác nhận');
      return;
    }
    
    const now = new Date().toISOString();
    setRepairEndTime(now);
    setStatus('closed');
    setShowCompleteDialog(false);
    toast.success('Đã hoàn thành và đóng sự cố');
    navigate('/corrective-maintenance');
  };

  const handleReopen = () => {
    setStatus('in-progress');
    setRepairEndTime(null);
    toast.info('Đã mở lại sự cố');
  };

  // Mobile info row component
  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className={cn(
      "flex border-b border-border/30 last:border-0",
      isMobile ? "flex-col gap-0.5 py-2" : "justify-between py-2"
    )}>
      <span className={cn("text-muted-foreground", isMobile ? "text-[11px]" : "text-sm")}>{label}:</span>
      <span className={cn("font-medium", isMobile ? "text-sm" : "text-sm")}>{value}</span>
    </div>
  );

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
            <Button variant="ghost" size="icon" onClick={() => navigate('/corrective-maintenance')} className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={cn(
                "font-mono text-destructive font-medium",
                isMobile ? "text-xs" : "text-sm"
              )}>{cm.code}</span>
              {getStatusBadge(status)}
              {getSeverityBadge(cm.severity)}
            </div>
            <p className={cn(
              "text-muted-foreground truncate",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {cm.equipmentCode} - {cm.equipmentName}
            </p>
          </div>
          <div className={cn(
            "flex items-center gap-2 shrink-0",
            isMobile && "w-full mt-2"
          )}>
            {status === 'new' && (
              <Button 
                onClick={handleStartRepair} 
                className={cn(
                  "action-btn-primary",
                  isMobile && "flex-1 h-9"
                )}
              >
                <Play className="h-4 w-4" />
                <span className={isMobile ? "text-xs" : ""}>Bắt đầu sửa</span>
              </Button>
            )}
            {status === 'in-progress' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handlePauseRepair}
                  size={isMobile ? "sm" : "default"}
                  className={cn(isMobile && "flex-1 h-9 text-xs")}
                >
                  <Pause className="h-4 w-4" />
                  <span className={isMobile ? "hidden" : ""}>Tạm dừng</span>
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
            {status === 'completed' && (
              <Button 
                variant="outline" 
                onClick={handleReopen}
                className={cn(isMobile && "flex-1 h-9 text-xs")}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Mở lại</span>
              </Button>
            )}
          </div>
        </div>

        {/* Time Display */}
        {status !== 'new' && (
          <div className={cn(
            "flex flex-wrap gap-x-4 gap-y-1",
            isMobile ? "text-[11px]" : "text-sm"
          )}>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
              <span>Bắt đầu: {repairStartTime ? new Date(repairStartTime).toLocaleTimeString('vi-VN') : '-'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span>Thời gian sửa: {calculateRepairDuration(repairStartTime || undefined, repairEndTime || undefined)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-destructive">
              <AlertTriangle className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
              <span>Downtime: {calculateDowntime(cm.reportedAt, repairEndTime || undefined)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn(
        "space-y-3",
        isMobile ? "px-4 py-3" : "p-4 space-y-4"
      )}>
        
        {/* Section A: Incident Info */}
        <Collapsible open={incidentOpen} onOpenChange={setIncidentOpen}>
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between hover:bg-secondary/30 transition-colors",
              isMobile ? "p-3" : "p-4"
            )}>
              <h3 className={cn(
                "font-semibold flex items-center gap-2",
                isMobile && "text-sm"
              )}>
                <AlertTriangle className={cn("text-destructive", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                Thông tin sự cố
              </h3>
              {incidentOpen ? (
                <ChevronUp className={cn("text-muted-foreground", isMobile ? "h-4 w-4" : "h-5 w-5")} />
              ) : (
                <ChevronDown className={cn("text-muted-foreground", isMobile ? "h-4 w-4" : "h-5 w-5")} />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className={cn(
                "border-t border-border/50",
                isMobile ? "px-3 pb-3 pt-2 space-y-2" : "px-4 pb-4 space-y-4 pt-4"
              )}>
                <div className={cn(
                  "grid gap-0",
                  isMobile ? "grid-cols-1" : "grid-cols-2 gap-4"
                )}>
                  <InfoRow label="Thiết bị" value={`${cm.equipmentCode} - ${cm.equipmentName}`} />
                  <InfoRow label="Nhóm thiết bị" value={cm.equipmentGroup} />
                  <InfoRow label="Loại máy" value={cm.machineType} />
                  <InfoRow label="Nhà máy" value={cm.factoryName} />
                  <InfoRow label="Thời điểm báo hỏng" value={new Date(cm.reportedAt).toLocaleString('vi-VN')} />
                  <InfoRow label="Người báo hỏng" value={cm.reportedBy} />
                </div>
                <div className={cn(
                  "bg-secondary/30 rounded-lg",
                  isMobile ? "p-2.5" : "p-3"
                )}>
                  <span className={cn(
                    "text-muted-foreground block mb-1",
                    isMobile ? "text-[11px]" : "text-sm"
                  )}>Mô tả hiện tượng:</span>
                  <p className={cn(isMobile ? "text-xs" : "text-sm")}>{cm.description}</p>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Section B: Repair Execution */}
        <Collapsible open={repairOpen} onOpenChange={setRepairOpen}>
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between hover:bg-secondary/30 transition-colors",
              isMobile ? "p-3" : "p-4"
            )}>
              <h3 className={cn(
                "font-semibold flex items-center gap-2",
                isMobile && "text-sm"
              )}>
                <Play className={cn("text-primary", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                Thực hiện sửa chữa
              </h3>
              {repairOpen ? (
                <ChevronUp className={cn("text-muted-foreground", isMobile ? "h-4 w-4" : "h-5 w-5")} />
              ) : (
                <ChevronDown className={cn("text-muted-foreground", isMobile ? "h-4 w-4" : "h-5 w-5")} />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className={cn(
                "border-t border-border/50",
                isMobile ? "px-3 pb-3 pt-2.5 space-y-3" : "px-4 pb-4 space-y-4 pt-4"
              )}>
                
                {/* Cause Selection */}
                <div className="space-y-1.5">
                  <Label className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
                    Nguyên nhân sự cố <span className="text-destructive">*</span>
                  </Label>
                  <Select value={cause} onValueChange={setCause} disabled={status === 'closed'}>
                    <SelectTrigger className={isMobile ? "h-9 text-sm" : ""}>
                      <SelectValue placeholder="Chọn nguyên nhân..." />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_CAUSES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cause Description */}
                <div className="space-y-1.5">
                  <Label className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>Mô tả nguyên nhân</Label>
                  <Textarea
                    placeholder="Chi tiết nguyên nhân gây ra sự cố..."
                    value={causeDescription}
                    onChange={(e) => setCauseDescription(e.target.value)}
                    rows={2}
                    disabled={status === 'closed'}
                    className={cn("resize-none", isMobile && "text-sm")}
                  />
                </div>

                {/* Correction Action */}
                <div className="space-y-1.5">
                  <Label className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
                    Hành động khắc phục <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    placeholder="Mô tả các bước đã thực hiện để khắc phục..."
                    value={correctionAction}
                    onChange={(e) => setCorrectionAction(e.target.value)}
                    rows={isMobile ? 2 : 3}
                    disabled={status === 'closed'}
                    className={cn("resize-none", isMobile && "text-sm")}
                  />
                </div>

                {/* Repair Result */}
                <div className="space-y-1.5">
                  <Label className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
                    Kết quả sửa chữa <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['fixed', 'temporary', 'pending'] as const).map((result) => (
                      <button
                        key={result}
                        onClick={() => !status.includes('closed') && setRepairResult(result)}
                        disabled={status === 'closed'}
                        className={cn(
                          "rounded-lg border-2 font-medium transition-all",
                          isMobile ? "p-2 text-xs" : "p-3 text-sm",
                          repairResult === result
                            ? result === 'fixed' 
                              ? "border-[hsl(var(--status-active))] bg-[hsl(var(--status-active))]/10 text-[hsl(var(--status-active))]"
                              : result === 'temporary'
                              ? "border-[hsl(var(--status-maintenance))] bg-[hsl(var(--status-maintenance))]/10 text-[hsl(var(--status-maintenance))]"
                              : "border-destructive bg-destructive/10 text-destructive"
                            : "border-border hover:border-muted-foreground/50",
                          status === 'closed' && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {REPAIR_RESULT_LABELS[result]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-1.5">
                  <Label className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>Hình ảnh sau sửa chữa</Label>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full border-dashed",
                      isMobile ? "h-14" : "h-20"
                    )} 
                    disabled={status === 'closed'}
                  >
                    <Camera className={cn(isMobile ? "h-4 w-4 mr-1.5" : "h-5 w-5 mr-2")} />
                    <span className={isMobile ? "text-xs" : ""}>Chụp / Tải ảnh</span>
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Section C: Time Tracking */}
        <Collapsible open={timeOpen} onOpenChange={setTimeOpen}>
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between hover:bg-secondary/30 transition-colors",
              isMobile ? "p-3" : "p-4"
            )}>
              <h3 className={cn(
                "font-semibold flex items-center gap-2",
                isMobile && "text-sm"
              )}>
                <Clock className={cn("text-muted-foreground", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                Thời gian & Downtime
              </h3>
              {timeOpen ? (
                <ChevronUp className={cn("text-muted-foreground", isMobile ? "h-4 w-4" : "h-5 w-5")} />
              ) : (
                <ChevronDown className={cn("text-muted-foreground", isMobile ? "h-4 w-4" : "h-5 w-5")} />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className={cn(
                "border-t border-border/50",
                isMobile ? "px-3 pb-3 pt-2.5" : "px-4 pb-4 space-y-4 pt-4"
              )}>
                <div className={cn(
                  "grid gap-2",
                  isMobile ? "grid-cols-2" : "grid-cols-2 gap-4"
                )}>
                  <div className={cn(
                    "bg-secondary/30 rounded-lg",
                    isMobile ? "p-2.5" : "p-4"
                  )}>
                    <span className={cn("text-muted-foreground", isMobile ? "text-[10px]" : "text-sm")}>Bắt đầu sửa</span>
                    <p className={cn("font-medium mt-0.5", isMobile ? "text-xs" : "")}>
                      {repairStartTime ? new Date(repairStartTime).toLocaleString('vi-VN') : '-'}
                    </p>
                  </div>
                  <div className={cn(
                    "bg-secondary/30 rounded-lg",
                    isMobile ? "p-2.5" : "p-4"
                  )}>
                    <span className={cn("text-muted-foreground", isMobile ? "text-[10px]" : "text-sm")}>Kết thúc sửa</span>
                    <p className={cn("font-medium mt-0.5", isMobile ? "text-xs" : "")}>
                      {repairEndTime ? new Date(repairEndTime).toLocaleString('vi-VN') : '-'}
                    </p>
                  </div>
                  <div className={cn(
                    "bg-primary/10 rounded-lg",
                    isMobile ? "p-2.5" : "p-4"
                  )}>
                    <span className={cn("text-muted-foreground", isMobile ? "text-[10px]" : "text-sm")}>Thời gian sửa</span>
                    <p className={cn("font-bold text-primary mt-0.5", isMobile ? "text-sm" : "text-lg")}>
                      {calculateRepairDuration(repairStartTime || undefined, repairEndTime || undefined)}
                    </p>
                  </div>
                  <div className={cn(
                    "bg-destructive/10 rounded-lg",
                    isMobile ? "p-2.5" : "p-4"
                  )}>
                    <span className={cn("text-muted-foreground", isMobile ? "text-[10px]" : "text-sm")}>Downtime</span>
                    <p className={cn("font-bold text-destructive mt-0.5", isMobile ? "text-sm" : "text-lg")}>
                      {calculateDowntime(cm.reportedAt, repairEndTime || undefined)}
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Confirmation Info (if closed) */}
        {status === 'closed' && cm.confirmedBy && (
          <div className={cn(
            "bg-card rounded-xl border border-[hsl(var(--status-active))]/30",
            isMobile ? "p-3" : "p-4"
          )}>
            <h3 className={cn(
              "font-semibold flex items-center gap-2 mb-2 text-[hsl(var(--status-active))]",
              isMobile && "text-sm"
            )}>
              <CheckCircle className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
              Xác nhận hoàn thành
            </h3>
            <div className={cn(
              "grid gap-0",
              isMobile ? "grid-cols-1" : "grid-cols-2 gap-4"
            )}>
              <InfoRow label="Người xác nhận" value={cm.confirmedBy} />
              <InfoRow label="Tình trạng thiết bị" value={cm.equipmentCondition || 'Hoạt động bình thường'} />
            </div>
          </div>
        )}
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
              <span className={isMobile ? "text-base" : ""}>Xác nhận & Đóng sự cố</span>
            </DialogTitle>
            <DialogDescription className={isMobile ? "text-xs" : ""}>
              Đảm bảo thiết bị đã được kiểm tra trước khi đưa vào sản xuất
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {/* Summary */}
            <div className={cn(
              "bg-secondary/30 rounded-lg",
              isMobile ? "p-2.5" : "p-3"
            )}>
              <div className={cn(
                "flex justify-between mb-2",
                isMobile ? "text-xs" : "text-sm"
              )}>
                <span className="text-muted-foreground">Nguyên nhân:</span>
                <span className="font-medium text-right ml-2 max-w-[60%] truncate">{cause}</span>
              </div>
              <div className={cn(
                "flex justify-between mb-2",
                isMobile ? "text-xs" : "text-sm"
              )}>
                <span className="text-muted-foreground">Kết quả:</span>
                <span className={cn(
                  "font-medium",
                  repairResult === 'fixed' && "text-[hsl(var(--status-active))]",
                  repairResult === 'temporary' && "text-[hsl(var(--status-maintenance))]",
                  repairResult === 'pending' && "text-destructive"
                )}>
                  {REPAIR_RESULT_LABELS[repairResult]}
                </span>
              </div>
              <div className={cn(
                "flex justify-between",
                isMobile ? "text-xs" : "text-sm"
              )}>
                <span className="text-muted-foreground">Tổng downtime:</span>
                <span className="font-medium text-destructive">{calculateDowntime(cm.reportedAt)}</span>
              </div>
            </div>

            {/* Confirmer */}
            <div className="space-y-1.5">
              <Label className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
                Người xác nhận <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Nhập tên người xác nhận..."
                value={confirmedBy}
                onChange={(e) => setConfirmedBy(e.target.value)}
                className={isMobile ? "h-9 text-sm" : ""}
              />
            </div>

            {/* Equipment Condition */}
            <div className="space-y-1.5">
              <Label className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>Đánh giá tình trạng thiết bị</Label>
              <Select value={equipmentCondition} onValueChange={setEquipmentCondition}>
                <SelectTrigger className={isMobile ? "h-9 text-sm" : ""}>
                  <SelectValue placeholder="Chọn tình trạng..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Hoạt động bình thường</SelectItem>
                  <SelectItem value="limited">Hoạt động hạn chế</SelectItem>
                  <SelectItem value="monitor">Cần theo dõi thêm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>Ghi chú</Label>
              <Textarea
                value={confirmNotes}
                onChange={(e) => setConfirmNotes(e.target.value)}
                placeholder="Ghi chú thêm..."
                className={cn("resize-none", isMobile && "text-sm")}
                rows={2}
              />
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
              <CheckCircle className="h-4 w-4" />
              <span>Xác nhận</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
