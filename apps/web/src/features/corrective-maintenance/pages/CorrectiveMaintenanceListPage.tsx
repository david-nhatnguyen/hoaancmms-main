import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  User,
  Clock
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
import { correctiveMaintenanceService } from '@/services/corrective-maintenance.service';
import { CorrectiveMaintenance, CM_STATUS_LABELS, SEVERITY_LABELS } from '@/api/mock/correctiveMaintenanceData';
import { cn } from '@/lib/utils';

export default function CorrectiveMaintenanceListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CorrectiveMaintenance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await correctiveMaintenanceService.getAll();
        setItems(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/10 text-blue-600';
      case 'in-progress': return 'bg-orange-500/10 text-orange-600';
      case 'completed': return 'bg-green-500/10 text-green-600';
      case 'closed': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="p-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bảo trì sự cố (CM)</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý các yêu cầu sửa chữa và sự cố thiết bị</p>
        </div>
        <Button onClick={() => navigate('/corrective-maintenance/new')} className="action-btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Báo hỏng
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
              <TableHead>Thiết bị & Sự cố</TableHead>
              <TableHead className="w-[120px]">Trạng thái</TableHead>
              <TableHead className="w-[120px]">Độ ưu tiên</TableHead>
              <TableHead className="w-[180px]">Người yêu cầu</TableHead>
              <TableHead className="w-[160px]">Thời gian báo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Đang tải...</TableCell></TableRow>
            ) : items.map((item) => (
              <TableRow key={item.id} className="group cursor-pointer hover:bg-secondary/10" onClick={() => navigate(`/corrective-maintenance/${item.id}`)}>
                <TableCell className="font-mono font-medium text-primary">{item.code}</TableCell>
                <TableCell>
                  <div className="font-medium">{item.equipmentName}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[300px]">{item.description}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("font-normal", getStatusColor(item.status))}>
                    {CM_STATUS_LABELS[item.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={cn("text-sm", item.severity === 'high' ? 'text-destructive font-medium' : 'text-muted-foreground')}>
                    {SEVERITY_LABELS[item.severity]}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {item.reportedBy}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {item.reportedAt}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}