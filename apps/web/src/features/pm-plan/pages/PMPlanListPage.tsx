import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Factory,
  MoreHorizontal,
  FileText
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
import { pmPlanService, PMPlan } from '@/services/pm-plan.service';
import { factories } from '@/api/mock/mockData';

export default function PMPlanListPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PMPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await pmPlanService.getAll();
        setPlans(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const getFactoryName = (id: string) => {
    return factories.find(f => f.id === id)?.name || id;
  };

  return (
    <div className="p-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kế hoạch bảo trì (PM)</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý các kế hoạch bảo trì định kỳ</p>
        </div>
        <Button onClick={() => navigate('/pm-plans/new')} className="action-btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Lập kế hoạch mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm kế hoạch..." className="pl-10 bg-background" />
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
              <TableHead className="w-[250px]">Tên kế hoạch</TableHead>
              <TableHead>Nhà máy</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Số lượng TB</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Đang tải...</TableCell></TableRow>
            ) : plans.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Chưa có kế hoạch nào</TableCell></TableRow>
            ) : plans.map((plan) => (
              <TableRow key={plan.id} className="group cursor-pointer hover:bg-secondary/10" onClick={() => navigate(`/pm-plans/${plan.id}`)}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium">{plan.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Factory className="h-3.5 w-3.5" />
                    {getFactoryName(plan.factoryId)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Tháng {plan.month}/{plan.year}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{plan.items.length} thiết bị</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0">
                    Đã áp dụng
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/pm-plans/${plan.id}/details`); }}>
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/pm-plans/${plan.id}`); }}>
                        Xem lịch
                      </DropdownMenuItem>
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
