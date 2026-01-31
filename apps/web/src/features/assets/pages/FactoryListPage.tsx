import { useState, useEffect } from 'react';
import { assetService } from '@/services/asset.service';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, ChevronRight, MapPin, Settings2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Factory } from '@/api/mock/factoriesData';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function FactoryListPage() {
  const navigate = useNavigate();
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFactory, setEditingFactory] = useState<Factory | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    location: ''
  });

  useEffect(() => {
    const fetchFactories = async () => {
      try {
        const data = await assetService.getFactories();
        setFactories(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFactories();
  }, []);

  const handleOpenDialog = (factory?: Factory) => {
    if (factory) {
      setEditingFactory(factory);
      setFormData({
        code: factory.code,
        name: factory.name,
        location: factory.location
      });
    } else {
      setEditingFactory(null);
      setFormData({ code: '', name: '', location: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.code || !formData.name) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (editingFactory) {
      setFactories(prev => prev.map(f => 
        f.id === editingFactory.id 
          ? { ...f, ...formData }
          : f
      ));
      toast.success('Cập nhật nhà máy thành công');
    } else {
      const newFactory: Factory = {
        id: `f${Date.now()}`,
        code: formData.code,
        name: formData.name,
        location: formData.location,
        equipmentCount: 0,
        status: 'active'
      };
      setFactories(prev => [...prev, newFactory]);
      toast.success('Thêm nhà máy thành công');
    }
    setIsDialogOpen(false);
  };

  const viewEquipments = (factoryId: string) => {
    navigate(`/equipments?factory=${factoryId}`);
  };

  // Summary stats
  const totalFactories = factories.length;
  const activeFactories = factories.filter(f => f.status === 'active').length;
  const totalEquipment = factories.reduce((sum, f) => sum + f.equipmentCount, 0);

  return (
    <div className="p-6 animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        <p className="page-subtitle">QUẢN LÝ TÀI SẢN</p>
        <div className="flex items-center justify-between">
          <h1 className="page-title">Danh sách Nhà máy</h1>
          <Button onClick={() => handleOpenDialog()} className="action-btn-primary">
            <Plus className="h-4 w-4" />
            Thêm nhà máy
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tổng số Nhà máy</p>
            <p className="text-3xl font-bold">{totalFactories}</p>
          </div>
          <div className="stat-card-icon bg-primary/20">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Đang hoạt động</p>
            <p className="text-3xl font-bold text-status-active">{activeFactories}</p>
          </div>
          <div className="stat-card-icon bg-status-active/20">
            <Building2 className="h-5 w-5 text-status-active" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tổng số Thiết bị</p>
            <p className="text-3xl font-bold">{totalEquipment}</p>
          </div>
          <div className="stat-card-icon bg-accent/20">
            <Settings2 className="h-5 w-5 text-accent" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="table-header-cell w-[120px]">Mã nhà máy</TableHead>
              <TableHead className="table-header-cell">Tên nhà máy</TableHead>
              <TableHead className="table-header-cell">Địa điểm</TableHead>
              <TableHead className="table-header-cell text-center">Số lượng TB</TableHead>
              <TableHead className="table-header-cell text-center">Trạng thái</TableHead>
              <TableHead className="table-header-cell text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {factories.map((factory) => (
              <TableRow key={factory.id} className="table-row-interactive">
                <TableCell className="font-mono font-medium text-primary">
                  {factory.code}
                </TableCell>
                <TableCell className="font-medium">{factory.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {factory.location}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Settings2 className="h-4 w-4" />
                    {factory.equipmentCount}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <StatusBadge status={factory.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => viewEquipments(factory.id)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      Xem thiết bị
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleOpenDialog(factory)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Factory Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingFactory ? 'Sửa thông tin Nhà máy' : 'Thêm Nhà máy mới'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code" className="text-foreground">Mã nhà máy *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="VD: F01"
                className="bg-secondary border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-foreground">Tên nhà máy *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="VD: Nhà máy A"
                className="bg-secondary border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location" className="text-foreground">Địa điểm</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="VD: Bình Dương"
                className="bg-secondary border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-border">
              Hủy
            </Button>
            <Button onClick={handleSave} className="action-btn-primary">
              {editingFactory ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}