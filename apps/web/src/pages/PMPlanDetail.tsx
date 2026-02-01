import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Pencil, 
  Calendar,
  Copy,
  Lock,
  CheckCircle,
  AlertCircle,
  Factory,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  pmPlans, 
  PM_STATUS_LABELS, 
  PM_ITEM_STATUS_LABELS,
  PMPlan 
} from '@/data/pmPlanData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function PMPlanDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const plan = pmPlans.find(p => p.id === id);

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

  const getStatusBadge = (status: PMPlan['status']) => {
    const styles = {
      draft: 'bg-muted text-muted-foreground',
      active: 'bg-status-active/20 text-[hsl(var(--status-active))]',
      locked: 'bg-status-maintenance/20 text-[hsl(var(--status-maintenance))]'
    };
    return (
      <span className={cn('status-badge', styles[status])}>
        {PM_STATUS_LABELS[status]}
      </span>
    );
  };

  const getItemStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-muted text-muted-foreground',
      scheduled: 'bg-primary/20 text-primary',
      'work-order-created': 'bg-status-active/20 text-[hsl(var(--status-active))]'
    };
    return (
      <span className={cn('status-badge text-xs', styles[status])}>
        {PM_ITEM_STATUS_LABELS[status as keyof typeof PM_ITEM_STATUS_LABELS]}
      </span>
    );
  };

  // Validation summary
  const missingChecklist = plan.items.filter(i => !i.checklistId).length;
  const missingDate = plan.items.filter(i => !i.plannedDate).length;
  const isComplete = missingChecklist === 0 && missingDate === 0;

  const handleCopy = () => {
    toast.success(`Đã sao chép kế hoạch: ${plan.name}`);
    navigate(`/pm-plans/new?copy=${plan.id}`);
  };

  const handleLock = () => {
    toast.success(`Đã khóa kế hoạch: ${plan.code}`);
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/pm-plans')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground font-mono">{plan.code}</span>
              {getStatusBadge(plan.status)}
            </div>
            <h1 className="page-title mt-1">{plan.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/pm-plans/${plan.id}/calendar`)} className="action-btn-secondary">
            <Calendar className="h-4 w-4" />
            Xem lịch
          </Button>
          <Button variant="outline" onClick={handleCopy} className="action-btn-secondary">
            <Copy className="h-4 w-4" />
            Sao chép
          </Button>
          {plan.status !== 'locked' && (
            <>
              <Button variant="outline" onClick={() => navigate(`/pm-plans/${plan.id}/edit`)} className="action-btn-secondary">
                <Pencil className="h-4 w-4" />
                Sửa
              </Button>
              {plan.status === 'active' && (
                <Button onClick={handleLock} className="action-btn-primary bg-status-maintenance hover:bg-status-maintenance/90">
                  <Lock className="h-4 w-4" />
                  Khóa kế hoạch
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Validation Banner */}
      {plan.status === 'draft' && !isComplete && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-destructive">Kế hoạch chưa hoàn chỉnh</p>
            <p className="text-sm text-muted-foreground">
              {missingChecklist > 0 && `${missingChecklist} thiết bị chưa gán checklist. `}
              {missingDate > 0 && `${missingDate} thiết bị chưa có ngày kế hoạch.`}
            </p>
          </div>
          <Button size="sm" onClick={() => navigate(`/pm-plans/${plan.id}/edit`)}>
            Hoàn thành ngay
          </Button>
        </div>
      )}

      {isComplete && plan.status === 'draft' && (
        <div className="mb-6 p-4 bg-status-active/10 border border-status-active/30 rounded-xl flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-[hsl(var(--status-active))] shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-[hsl(var(--status-active))]">Kế hoạch đã sẵn sàng</p>
            <p className="text-sm text-muted-foreground">
              Tất cả thiết bị đã được gán checklist và ngày kế hoạch.
            </p>
          </div>
          <Button size="sm" className="bg-status-active hover:bg-status-active/90">
            Áp dụng kế hoạch
          </Button>
        </div>
      )}

      <Tabs defaultValue="items" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="items">Danh sách thiết bị</TabsTrigger>
          <TabsTrigger value="info">Thông tin chung</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="table-header-cell w-[100px]">Mã TB</TableHead>
                  <TableHead className="table-header-cell">Thiết bị</TableHead>
                  <TableHead className="table-header-cell">Checklist</TableHead>
                  <TableHead className="table-header-cell text-center">Ngày KH</TableHead>
                  <TableHead className="table-header-cell">Người phụ trách</TableHead>
                  <TableHead className="table-header-cell text-center">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plan.items.map((item) => (
                  <TableRow 
                    key={item.id} 
                    className={cn(
                      "border-border/50",
                      (!item.checklistId || !item.plannedDate) && "bg-destructive/5"
                    )}
                  >
                    <TableCell className="font-mono text-primary font-medium">
                      {item.equipmentCode}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.equipmentName}</p>
                        <p className="text-xs text-muted-foreground">{item.machineType}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.checklistName ? (
                        <span className="text-sm">{item.checklistName}</span>
                      ) : (
                        <span className="text-sm text-destructive">Chưa gán</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.plannedDate ? (
                        <span className="px-2 py-1 rounded-md bg-secondary text-xs font-medium">
                          {new Date(item.plannedDate).toLocaleDateString('vi-VN')}
                        </span>
                      ) : (
                        <span className="text-sm text-destructive">Chưa có</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.assignee || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {getItemStatusBadge(item.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="info">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-semibold mb-4">Thông tin kế hoạch</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Thời gian</p>
                    <p className="font-medium">Tháng {plan.month}/{plan.year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Factory className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nhà máy</p>
                    <p className="font-medium">{plan.factoryName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Cpu className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Số thiết bị</p>
                    <p className="font-medium">{plan.items.length} thiết bị</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-semibold mb-4">Thống kê tiến độ</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="text-sm">Đã lên lịch</span>
                  <span className="font-bold text-primary">
                    {plan.items.filter(i => i.plannedDate && i.checklistId).length}/{plan.items.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="text-sm">Đã tạo Work Order</span>
                  <span className="font-bold text-[hsl(var(--status-active))]">
                    {plan.items.filter(i => i.status === 'work-order-created').length}/{plan.items.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="text-sm">Chưa hoàn thành</span>
                  <span className="font-bold text-muted-foreground">
                    {plan.items.filter(i => !i.checklistId || !i.plannedDate).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
