import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, ChevronRight, MapPin, Settings2, Building2, Eye, Loader2 } from 'lucide-react';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

// ✅ NEW: Import API hooks instead of mock data
import { 
  useFactories, 
  useCreateFactory, 
  useUpdateFactory,
  useFactoryStats 
} from '@/features/factories/hooks';
import type { Factory, FactoryQueryParams } from '@/api/types/factory.types';

export default function FactoryList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // ✅ NEW: Query parameters state
  const [params, setParams] = useState<FactoryQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // ✅ NEW: Use React Query hooks
  const { data, isLoading, error } = useFactories(params);
  const { data: statsData } = useFactoryStats();
  const createFactory = useCreateFactory();
  const updateFactory = useUpdateFactory();

  // Dialog state
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
        location: factory.location || ''
      });
    } else {
      setEditingFactory(null);
      setFormData({ code: '', name: '', location: '' });
    }
    setIsDialogOpen(true);
  };

  // ✅ NEW: Handle save with API calls
  const handleSave = () => {
    if (!formData.code || !formData.name) {
      return;
    }

    if (editingFactory) {
      // Update existing factory
      updateFactory.mutate({
        id: editingFactory.id,
        data: {
          code: formData.code,
          name: formData.name,
          location: formData.location || undefined,
        }
      }, {
        onSuccess: () => {
          setIsDialogOpen(false);
        }
      });
    } else {
      // Create new factory
      createFactory.mutate({
        code: formData.code,
        name: formData.name,
        location: formData.location || undefined,
        status: 'ACTIVE',
      }, {
        onSuccess: () => {
          setIsDialogOpen(false);
        }
      });
    }
  };

  const viewEquipments = (factoryId: string) => {
    navigate(`/equipments?factory=${factoryId}`);
  };

  // ✅ NEW: Stats from API
  const stats = [
    {
      label: 'Tổng số Nhà máy',
      value: statsData?.data.totalFactories || 0,
      icon: <Building2 className="h-5 w-5 text-primary" />,
      iconBgClass: 'bg-primary/20'
    },
    {
      label: 'Đang hoạt động',
      value: statsData?.data.activeFactories || 0,
      icon: <Building2 className="h-5 w-5 text-status-active" />,
      iconBgClass: 'bg-status-active/20',
      valueClass: 'text-[hsl(var(--status-active))]'
    },
    {
      label: 'Tổng số Thiết bị',
      value: statsData?.data.totalEquipment || 0,
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
          {f.location || '-'}
        </div>
      ),
      mobileRender: (f) => f.location || '-'
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
      render: (f) => <StatusBadge status={f.status} />,
      mobileRender: (f) => <StatusBadge status={f.status} />
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (f) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => viewEquipments(f.id)}
            className="h-8 px-2"
          >
            <Eye className="h-4 w-4" />
            <span className="ml-1.5 hidden sm:inline">Xem TB</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDialog(f)}
            className="h-8 px-2"
          >
            <Pencil className="h-4 w-4" />
            <span className="ml-1.5 hidden sm:inline">Sửa</span>
          </Button>
        </div>
      ),
      mobileRender: (f) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => viewEquipments(f.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Xem TB
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDialog(f)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Sửa
          </Button>
        </div>
      )
    }
  ];

  // ✅ NEW: Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // ✅ NEW: Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-3">
          <p className="text-sm text-destructive">Có lỗi xảy ra khi tải dữ liệu</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header */}
      {isMobile && (
        <MobilePageHeader
          title="Nhà máy"
          actions={
            <Button size="sm" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-1.5" />
              Thêm
            </Button>
          }
        />
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quản lý Nhà máy</h1>
            <p className="text-muted-foreground mt-1">
              Danh sách tất cả các nhà máy trong hệ thống
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm Nhà máy
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <MobileStatsGrid stats={stats} className="mb-6" />

      {/* Table */}
      <ResponsiveTable<Factory>
        columns={columns}
        data={data?.data || []}
        keyExtractor={(factory) => factory.id}
        onRowClick={(factory) => isMobile && handleOpenDialog(factory)}
        emptyMessage="Chưa có nhà máy nào"
        showPagination={false}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={cn(
          isMobile && "w-[95vw] max-w-[95vw] rounded-lg"
        )}>
          <DialogHeader>
            <DialogTitle>
              {editingFactory ? 'Chỉnh sửa Nhà máy' : 'Thêm Nhà máy mới'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">
                Mã nhà máy <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                placeholder="Ví dụ: F01"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled={!!editingFactory}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Tên nhà máy <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Nhập tên nhà máy"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Địa điểm</Label>
              <Input
                id="location"
                placeholder="Nhập địa điểm"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className={cn(
            isMobile && "flex-col gap-2"
          )}>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className={cn(isMobile && "w-full")}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={createFactory.isPending || updateFactory.isPending}
              className={cn(isMobile && "w-full")}
            >
              {(createFactory.isPending || updateFactory.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingFactory ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
