import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Calendar,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { workOrderService } from '@/services/work-order.service';
import { WorkOrder, WORK_ORDER_STATUS_LABELS, WORK_ORDER_PRIORITY_LABELS } from '@/api/mock/workOrderData';
import { cn } from '@/lib/utils';

export default function WorkOrderListPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await workOrderService.getAll();
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20';
      case 'in-progress': return 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20';
      case 'completed': return 'bg-green-500/10 text-green-600 hover:bg-green-500/20';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="p-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Phiếu công việc</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý danh sách công việc bảo trì</p>
        </div>
        <Button onClick={() => navigate('/work-orders/new')} className="action-btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Tạo phiếu mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm phiếu..." className="pl-10 bg-background" />
        </div>
        <Button variant="outline" className="action-btn-secondary">
          <Filter className="h-4 w-4 mr-2" />
          Bộ lọc
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30 hover:bg-secondary/30">
              <TableHead className="w-[140px]">Mã phiếu</TableHead>
              <TableHead>Tiêu đề & Thiết bị</TableHead>
              <TableHead className="w-[120px]">Trạng thái</TableHead>
              <TableHead className="w-[120px]">Độ ưu tiên</TableHead>
              <TableHead className="w-[180px]">Người phụ trách</TableHead>
              <TableHead className="w-[120px]">Hạn hoàn thành</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Đang tải...</TableCell></TableRow>
            ) : orders.map((wo) => (
              <TableRow key={wo.id} className="group cursor-pointer hover:bg-secondary/10" onClick={() => navigate(`/work-orders/${wo.id}`)}>
                <TableCell className="font-mono font-medium text-primary">{wo.code}</TableCell>
                <TableCell>
                  <div className="font-medium">{wo.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{wo.equipmentName}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("font-normal", getStatusColor(wo.status))}>
                    {WORK_ORDER_STATUS_LABELS[wo.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={cn("text-sm", wo.priority === 'high' || wo.priority === 'critical' ? 'text-destructive font-medium' : 'text-muted-foreground')}>
                    {WORK_ORDER_PRIORITY_LABELS[wo.priority]}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {wo.assignee || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {wo.dueDate}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Edit logic */ }}>Chỉnh sửa</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Delete logic */ }} className="text-destructive">Xóa</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}