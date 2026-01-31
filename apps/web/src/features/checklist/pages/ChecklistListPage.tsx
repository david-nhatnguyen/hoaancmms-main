import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter,
  FileCheck,
  MoreHorizontal,
  Settings
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
import { checklistService } from '@/services/checklist.service';
import { ChecklistTemplate } from '@/api/mock/checklistData';
import { cn } from '@/lib/utils';

export default function ChecklistListPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await checklistService.getAll();
        setTemplates(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-600 hover:bg-green-500/20';
      case 'draft': return 'bg-secondary text-secondary-foreground';
      case 'inactive': return 'bg-destructive/10 text-destructive hover:bg-destructive/20';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="p-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thư viện Checklist</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý các mẫu kiểm tra bảo trì</p>
        </div>
        <Button onClick={() => navigate('/checklists/new')} className="action-btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Tạo mẫu mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm mẫu..." className="pl-10 bg-background" />
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
              <TableHead className="w-[120px]">Mã</TableHead>
              <TableHead>Tên mẫu</TableHead>
              <TableHead>Loại máy</TableHead>
              <TableHead className="w-[100px]">Số mục</TableHead>
              <TableHead className="w-[120px]">Trạng thái</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Đang tải...</TableCell></TableRow>
            ) : templates.map((item) => (
              <TableRow key={item.id} className="group cursor-pointer hover:bg-secondary/10" onClick={() => navigate(`/checklists/${item.id}`)}>
                <TableCell className="font-mono font-medium text-primary">{item.code}</TableCell>
                <TableCell>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[300px]">{item.notes}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    {item.machineType}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">{item.items.length} mục</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("font-normal", getStatusColor(item.status))}>
                    {item.status === 'active' ? 'Hoạt động' : item.status === 'draft' ? 'Nháp' : 'Ngừng'}
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
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/checklists/${item.id}/edit`); }}>Chỉnh sửa</DropdownMenuItem>
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