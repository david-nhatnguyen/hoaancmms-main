import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, ChevronRight, MapPin, Settings2, Building2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { MobileStatsGrid } from '@/components/shared/MobileStatsGrid';
import { ResponsiveTable, Column } from '@/components/shared/ResponsiveTable';
import { factories as initialFactories, Factory } from '@/data/mockData';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function FactoryList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [factories, setFactories] = useState<Factory[]>(initialFactories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFactory, setEditingFactory] = useState<Factory | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    location: ''
  });

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

  // Stats data
  const statsData = [
    {
      label: 'Tổng số Nhà máy',
      value: totalFactories,
      icon: <Building2 className="h-5 w-5 text-primary" />,
      iconBgClass: 'bg-primary/20'
    },
    {
      label: 'Đang hoạt động',
      value: activeFactories,
      icon: <Building2 className="h-5 w-5 text-status-active" />,
      iconBgClass: 'bg-status-active/20',
      valueClass: 'text-[hsl(var(--status-active))]'
    },
    {
      label: 'Tổng số Thiết bị',
      value: totalEquipment,
      icon: <Settings2 className="h-5 w-5 text-accent" />,
      iconBgClass: 'bg-accent/20'
    }
  ];

  // Table columns
  const columns: Column<Factory>[] = [
    {
      key: 'code',
      header: 'Mã nhà máy',
      isPrimary: true,
      width: 'w-[120px]',
      render: (f) => <span className="font-mono font-medium text-primary">{f.code}</span>
    },
    {
      key: 'name',
      header: 'Tên nhà máy',
      isSecondary: true,
      render: (f) => <span className="font-medium">{f.name}</span>
    },
    {
      key: 'location',
      header: 'Địa điểm',
      render: (f) => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {f.location}
        </div>
      ),
      mobileRender: (f) => f.location
    },
    {
      key: 'equipmentCount',
      header: 'Số lượng TB',
      align: 'center',
      render: (f) => (
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Settings2 className="h-4 w-4" />
          {f.equipmentCount}
        </span>
      ),
      mobileRender: (f) => f.equipmentCount
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (f) => <StatusBadge status={f.status} />
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (f) => (
        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => viewEquipments(f.id)}
            className="text-muted-foreground hover:text-primary"
          >
            Xem thiết bị
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => handleOpenDialog(f)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
      mobileRender: (f) => (
        <div className="flex gap-2">
          <Button 
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              viewEquipments(f.id);
            }}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Thiết bị
          </Button>
          <Button 
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDialog(f);
            }}
            className="flex-1"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Sửa
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className={cn("animate-fade-in", isMobile ? "p-4" : "p-6")}>
      {/* Page Header */}
      <MobilePageHeader
        subtitle="QUẢN LÝ TÀI SẢN"
        title="Danh sách Nhà máy"
        actions={
          <Button 
            onClick={() => handleOpenDialog()} 
            className="action-btn-primary"
            size={isMobile ? "sm" : "default"}
          >
            <Plus className="h-4 w-4" />
            {!isMobile && "Thêm nhà máy"}
          </Button>
        }
      />

      {/* Stats Cards */}
      <MobileStatsGrid stats={statsData} columns={{ mobile: 3, tablet: 3, desktop: 3 }} />

      {/* Table/Cards */}
      <ResponsiveTable
        data={factories}
        columns={columns}
        keyExtractor={(f) => f.id}
        onRowClick={(f) => viewEquipments(f.id)}
        emptyMessage="Không có nhà máy nào"
      />

      {/* Add/Edit Factory Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={cn(
          "bg-card border-border",
          isMobile ? "w-[calc(100%-2rem)] max-w-[425px]" : "sm:max-w-[425px]"
        )}>
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
          <DialogFooter className={isMobile ? "flex-col gap-2" : ""}>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className={cn("border-border", isMobile && "w-full")}>
              Hủy
            </Button>
            <Button onClick={handleSave} className={cn("action-btn-primary", isMobile && "w-full")}>
              {editingFactory ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
