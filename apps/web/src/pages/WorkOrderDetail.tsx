import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  Cpu,
  ClipboardList,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  workOrders, 
  WO_STATUS_LABELS,
  WorkOrder,
  calculateProgress,
  calculateDuration,
  RESULT_LABELS
} from '@/data/workOrderData';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export default function WorkOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isMobile = useIsMobile();
  
  const wo = workOrders.find(w => w.id === id);

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

  const progress = calculateProgress(wo.items);
  const okCount = wo.items.filter(i => i.result === 'ok').length;
  const ngCount = wo.items.filter(i => i.result === 'ng').length;
  const naCount = wo.items.filter(i => i.result === 'na').length;

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

  const getResultBadge = (result: 'ok' | 'ng' | 'na' | null) => {
    if (!result) return <span className="text-muted-foreground text-sm">-</span>;
    
    const styles = {
      'ok': 'bg-status-active/20 text-[hsl(var(--status-active))]',
      'ng': 'bg-destructive/20 text-destructive',
      'na': 'bg-muted text-muted-foreground'
    };
    return (
      <span className={cn('status-badge text-xs', styles[result])}>
        {RESULT_LABELS[result]}
      </span>
    );
  };

  // Mobile info row component
  const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) => (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0">
      <div className={cn(
        "shrink-0 rounded-lg flex items-center justify-center",
        isMobile ? "h-8 w-8 bg-secondary" : "h-10 w-10 bg-secondary"
      )}>
        <Icon className={cn("text-muted-foreground", isMobile ? "h-4 w-4" : "h-5 w-5")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-muted-foreground", isMobile ? "text-[11px]" : "text-sm")}>{label}</p>
        <p className={cn("font-medium truncate", isMobile ? "text-sm" : "text-base")}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className={cn(
      "animate-fade-in max-w-full overflow-x-hidden",
      isMobile ? "px-4 py-3" : "p-6"
    )}>
      {/* Header */}
      {isMobile ? (
        // Mobile header
        <div className="mb-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{wo.code}</span>
                {getStatusBadge(wo.status)}
              </div>
              <h1 className="text-base font-bold leading-tight truncate">{wo.equipmentName}</h1>
            </div>
            {wo.status !== 'completed' && (
              <Button 
                onClick={() => navigate(`/work-orders/${wo.id}/execute`)} 
                size="sm"
                className="shrink-0 h-9 px-3 gap-1.5"
              >
                <Play className="h-3.5 w-3.5" />
                <span className="text-xs">{wo.status === 'new' ? 'Bắt đầu thực hiện' : 'Tiếp tục'}</span>
              </Button>
            )}
          </div>
        </div>
      ) : (
        // Desktop header
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/work-orders')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground font-mono">{wo.code}</span>
                {getStatusBadge(wo.status)}
              </div>
              <h1 className="page-title mt-1">{wo.equipmentName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {wo.status !== 'completed' && (
              <Button onClick={() => navigate(`/work-orders/${wo.id}/execute`)} className="action-btn-primary">
                <Play className="h-4 w-4" />
                {wo.status === 'new' ? 'Bắt đầu thực hiện' : 'Tiếp tục'}
              </Button>
            )}
          </div>
        </div>
      )}

      <Tabs defaultValue="checklist" className={cn(isMobile ? "space-y-3" : "space-y-6")}>
        <TabsList className={cn(
          "bg-secondary/50 p-1",
          isMobile ? "w-full grid grid-cols-3 h-auto" : ""
        )}>
          <TabsTrigger 
            value="checklist"
            className={cn(
              "data-[state=active]:bg-card data-[state=active]:text-primary",
              isMobile && "text-[11px] py-2"
            )}
          >
            Kết quả Checklist
          </TabsTrigger>
          <TabsTrigger 
            value="info"
            className={cn(
              "data-[state=active]:bg-card data-[state=active]:text-primary",
              isMobile && "text-[11px] py-2"
            )}
          >
            Thông tin chung
          </TabsTrigger>
          <TabsTrigger 
            value="time"
            className={cn(
              "data-[state=active]:bg-card data-[state=active]:text-primary",
              isMobile && "text-[11px] py-2"
            )}
          >
            Thời gian
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checklist">
          {/* Progress Summary - 4 column grid */}
          <div className={cn(
            "grid gap-2 mb-4",
            isMobile ? "grid-cols-4" : "grid-cols-4 gap-4 mb-6"
          )}>
            <div className={cn(
              "bg-card rounded-xl border border-border/50 text-center",
              isMobile ? "p-2.5" : "p-4"
            )}>
              <p className={cn("font-bold", isMobile ? "text-xl" : "text-3xl")}>{wo.items.length}</p>
              <p className={cn("text-muted-foreground", isMobile ? "text-[10px]" : "text-sm")}>Tổng mục</p>
            </div>
            <div className={cn(
              "bg-card rounded-xl border border-border/50 text-center",
              isMobile ? "p-2.5" : "p-4"
            )}>
              <p className={cn("font-bold text-[hsl(var(--status-active))]", isMobile ? "text-xl" : "text-3xl")}>{okCount}</p>
              <p className={cn("text-muted-foreground", isMobile ? "text-[10px]" : "text-sm")}>OK</p>
            </div>
            <div className={cn(
              "bg-card rounded-xl border border-border/50 text-center",
              isMobile ? "p-2.5" : "p-4"
            )}>
              <p className={cn("font-bold text-destructive", isMobile ? "text-xl" : "text-3xl")}>{ngCount}</p>
              <p className={cn("text-muted-foreground", isMobile ? "text-[10px]" : "text-sm")}>NG</p>
            </div>
            <div className={cn(
              "bg-card rounded-xl border border-border/50 text-center",
              isMobile ? "p-2.5" : "p-4"
            )}>
              <p className={cn("font-bold text-muted-foreground", isMobile ? "text-xl" : "text-3xl")}>{naCount}</p>
              <p className={cn("text-muted-foreground", isMobile ? "text-[10px]" : "text-sm")}>N/A</p>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <div className={cn(
              "border-b border-border/50",
              isMobile ? "p-3" : "p-4"
            )}>
              <h3 className={cn("font-semibold", isMobile && "text-sm")}>Chi tiết Checklist</h3>
            </div>
            <div className="divide-y divide-border/50">
              {wo.items.map((item, idx) => (
                <div 
                  key={item.id}
                  className={cn(
                    isMobile ? "p-3" : "p-4",
                    item.result === 'ng' && "bg-destructive/5"
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={cn(
                      "rounded-full bg-secondary flex items-center justify-center font-medium shrink-0",
                      isMobile ? "h-6 w-6 text-xs" : "h-6 w-6 text-xs"
                    )}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p className={cn("font-medium leading-tight", isMobile && "text-sm")}>{item.task}</p>
                        {getResultBadge(item.result)}
                      </div>
                      <p className={cn(
                        "text-muted-foreground line-clamp-2",
                        isMobile ? "text-xs" : "text-sm"
                      )}>{item.standard}</p>
                      {item.notes && (
                        <div className={cn(
                          "mt-2 p-2 bg-secondary/30 rounded-lg",
                          isMobile ? "text-xs" : "text-sm"
                        )}>
                          <span className="text-muted-foreground">Ghi chú:</span> {item.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Notes */}
          {wo.totalNotes && (
            <div className={cn(
              "bg-card rounded-xl border border-border/50 mt-3",
              isMobile ? "p-3" : "p-4 mt-4"
            )}>
              <h3 className={cn("font-semibold mb-2", isMobile && "text-sm")}>Ghi chú tổng</h3>
              <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>{wo.totalNotes}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="info">
          <div className={cn(
            "grid gap-3",
            isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2 gap-6"
          )}>
            <div className={cn(
              "bg-card rounded-xl border border-border/50",
              isMobile ? "p-3" : "p-6"
            )}>
              <h3 className={cn("font-semibold mb-3", isMobile ? "text-sm" : "text-lg")}>Thông tin thiết bị</h3>
              <div className="space-y-0">
                <InfoRow icon={Cpu} label="Mã thiết bị" value={wo.equipmentCode} />
                <InfoRow icon={ClipboardList} label="Nhóm thiết bị" value={wo.equipmentGroup} />
                <InfoRow icon={ClipboardList} label="Checklist áp dụng" value={wo.checklistName} />
              </div>
            </div>

            <div className={cn(
              "bg-card rounded-xl border border-border/50",
              isMobile ? "p-3" : "p-6"
            )}>
              <h3 className={cn("font-semibold mb-3", isMobile ? "text-sm" : "text-lg")}>Thông tin công việc</h3>
              <div className="space-y-0">
                <InfoRow icon={Calendar} label="Ngày kế hoạch" value={new Date(wo.plannedDate).toLocaleDateString('vi-VN')} />
                <InfoRow icon={User} label="Người thực hiện" value={wo.assignee} />
                <InfoRow icon={Building2} label="Nhà máy" value={wo.factoryName} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="time">
          <div className={cn(
            "bg-card rounded-xl border border-border/50",
            isMobile ? "p-3" : "p-6 max-w-md"
          )}>
            <h3 className={cn("font-semibold mb-3", isMobile ? "text-sm" : "text-lg")}>Thời gian thực hiện</h3>
            <div className={cn("space-y-2", !isMobile && "space-y-4")}>
              <div className={cn(
                "flex items-center justify-between bg-secondary/30 rounded-lg",
                isMobile ? "p-2.5" : "p-3"
              )}>
                <div className="flex items-center gap-2">
                  <Play className={cn("text-[hsl(var(--status-active))]", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                  <span className={isMobile ? "text-xs" : "text-sm"}>Bắt đầu</span>
                </div>
                <span className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
                  {wo.startTime ? new Date(wo.startTime).toLocaleString('vi-VN') : '-'}
                </span>
              </div>
              <div className={cn(
                "flex items-center justify-between bg-secondary/30 rounded-lg",
                isMobile ? "p-2.5" : "p-3"
              )}>
                <div className="flex items-center gap-2">
                  <CheckCircle className={cn("text-[hsl(var(--status-active))]", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                  <span className={isMobile ? "text-xs" : "text-sm"}>Kết thúc</span>
                </div>
                <span className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
                  {wo.endTime ? new Date(wo.endTime).toLocaleString('vi-VN') : '-'}
                </span>
              </div>
              <div className={cn(
                "flex items-center justify-between bg-primary/10 rounded-lg border border-primary/20",
                isMobile ? "p-3" : "p-4"
              )}>
                <div className="flex items-center gap-2">
                  <Clock className={cn("text-primary", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  <span className={cn("font-medium", isMobile ? "text-sm" : "text-base")}>Tổng thời gian</span>
                </div>
                <span className={cn("font-bold text-primary", isMobile ? "text-lg" : "text-xl")}>
                  {calculateDuration(wo.startTime, wo.endTime)}
                </span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
