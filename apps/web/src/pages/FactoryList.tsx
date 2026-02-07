import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Building2, Search, X, Filter, FileSpreadsheet, Download } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { Drawer } from 'vaul';

// UI Components
import { Button } from '@/components/ui/button';
import { MobileButton } from '@/components/ui/mobile-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MobileFilters } from '@/components/shared/MobileFilters';
import { ChipFilter } from '@/components/shared/filters/ChipFilter';
import { useDebounce } from '@/hooks/use-debounce';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { ResponsiveTable } from '@/components/shared/ResponsiveTable';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageContainer } from '@/components/shared/PageContainer';
import { useIsMobile } from '@/hooks/use-mobile';

// Feature Components & Hooks
import {
  useFactoryForm,
  useFactoryColumns,
  useFactoryTableStats,
  useFactories,
  useCreateFactory,
  useUpdateFactory,
  useDeleteFactory,
} from '@/features/factories/hooks';

import {
  FactoryFormDialog,
  FactoryStatsCards,
  DeleteFactoryDialog,
} from '@/features/factories/components';
import { FactoryFormFields } from '@/features/factories/components/FactoryFormDialog/FactoryFormFields';

import type { Factory, FactoryQueryParams } from '@/api/types/factory.types';

/**
 * Factory List Page (Web-First Responsive Design)
 * 
 * Features:
 * - Pull-to-refresh (mobile-friendly)
 * - Touch-optimized buttons (44x44px)
 * - Skeleton loading
 * - Enhanced empty state
 * - Search/Filter with sticky header
 * - Visible action buttons (web-standard)
 * - FAB for primary action
 * - Bottom sheet for mobile forms
 */
// Filter Options
const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Hoạt động', color: 'bg-emerald-500' },
  { value: 'INACTIVE', label: 'Ngừng hoạt động', color: 'bg-slate-500' }
];

export default function FactoryList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // ============================================================================
  // STATE & HOOKS
  // ============================================================================

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Query parameters
  const [params, setParams] = useState<FactoryQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    status: [], // Empty array = all statuses
  });

  // Sync search with params
  useMemo(() => {
    setParams(prev => {
      if (prev.search === debouncedSearch) return prev;
      return { ...prev, search: debouncedSearch, page: 1 };
    });
  }, [debouncedSearch]);


  // Custom hooks for form management
  const form = useFactoryForm();

  // Custom hook for table columns
  const { columns } = useFactoryColumns({
    onEdit: form.openDialog,
    onViewEquipments: (id) => navigate(`/equipments?factory=${id}`),
    onDelete: (factory) => setDeletingFactory(factory),
  });

  // Custom hook for stats
  const { stats, isLoading: statsLoading } = useFactoryTableStats();

  // API hooks
  const { data, isLoading, error, refetch } = useFactories(params);
  const createFactory = useCreateFactory();
  const updateFactory = useUpdateFactory();
  const deleteFactory = useDeleteFactory();

  // Delete State
  const [deletingFactory, setDeletingFactory] = useState<Factory | null>(null);

  // ============================================================================
  // FILTER LOGIC
  // ============================================================================

  const toggleStatus = (value: string) => {
    setParams(prev => {
      const current = Array.isArray(prev.status) ? prev.status : [];
      // Use "as any" safely here because value comes from trusted options
      const next = current.includes(value as any)
        ? current.filter(s => s !== value)
        : [...current, value as any];
      return { ...prev, status: next, page: 1 };
    });
  };

  const clearFilters = () => {
    setParams(prev => ({
      ...prev,
      status: [],
      search: '',
      page: 1
    }));
    setSearchQuery('');
  };

  const removeStatus = (value: string) => {
     setParams(prev => {
      const current = Array.isArray(prev.status) ? prev.status : [];
      return { ...prev, status: current.filter(s => s !== value), page: 1 };
    });
  };

  const activeFiltersCount = (Array.isArray(params.status) ? params.status.length : 0);

  // Desktop Filters Component
  const desktopFilters = (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm nhà máy..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9"
        />
      </div>
      <div className="h-6 w-px bg-border/50 mx-2" />
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Trạng thái:</span>
      <ChipFilter 
        options={STATUS_OPTIONS} 
        selected={(params.status as string[]) || []} 
        onToggle={toggleStatus} 
      />
    </div>
  );

  // Mobile Filter Sections
  const filterSections = [
    {
      id: 'status',
      label: 'Trạng thái',
      activeCount: Array.isArray(params.status) ? params.status.length : 0,
      content: (
        <ChipFilter 
          options={STATUS_OPTIONS} 
          selected={(params.status as string[]) || []} 
          onToggle={toggleStatus} 
        />
      )
    }
  ];

  // Active Filter Tags
  const activeFilterTags = (Array.isArray(params.status) ? params.status : []).map(s => {
    const label = STATUS_OPTIONS.find(o => o.value === s)?.label || s;
    return (
      <Badge 
        key={s} 
        variant="secondary"
        className="gap-1 pl-2 pr-1 py-0.5"
      >
        {label}
        <button 
          onClick={() => removeStatus(s)} 
          className="ml-1 hover:bg-muted rounded-full p-0.5"
          aria-label={`Xóa lọc ${label}`}
          title={`Xóa lọc ${label}`}
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    );
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = async () => {
    // Invalidate queries to refetch fresh data
    await queryClient.invalidateQueries({ queryKey: ['factories'] });
    await queryClient.invalidateQueries({ queryKey: ['factory-stats'] });

    // Haptic feedback
    if (window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  /**
   * Handle save (create or update)
   */
  const handleSave = () => {
    // Validate form
    if (!form.validate()) {
      return;
    }

    // Set submitting state
    form.setIsSubmitting(true);

    if (form.isEditMode && form.editingFactory) {
      // Update existing factory
      updateFactory.mutate(
        {
          id: form.editingFactory.id,
          data: {
            code: form.formData.code,
            name: form.formData.name,
            location: form.formData.location || undefined,
            status: form.formData.status,
          },
        },
        {
          onSuccess: () => {
            form.closeDialog();
            // Haptic feedback
            if (window.navigator.vibrate) {
              window.navigator.vibrate([10, 50, 10]); // Success pattern
            }
          },
          onSettled: () => {
            form.setIsSubmitting(false);
          },
        }
      );
    } else {
      // Create new factory
      createFactory.mutate(
        {
          code: form.formData.code,
          name: form.formData.name,
          location: form.formData.location || undefined,
          status: 'ACTIVE',
        },
        {
          onSuccess: () => {
            form.closeDialog();
            // Haptic feedback
            if (window.navigator.vibrate) {
              window.navigator.vibrate([10, 50, 10]); // Success pattern
            }
          },
          onSettled: () => {
            form.setIsSubmitting(false);
          },
        }
      );
    }
  };

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-3">
          <p className="text-sm text-destructive">Có lỗi xảy ra khi tải dữ liệu</p>
          <Button onClick={() => refetch()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Render table content
   */
  const renderTableContent = () => {
    if (isLoading) {
      return <TableSkeleton rows={5} />;
    }

    const factories = data?.data || [];

    if (factories.length === 0) {
      return (
        <EmptyState
          icon={<Building2 className="h-12 w-12 text-muted-foreground/50" />}
          title={params.search || params.status?.length ? 'Không tìm thấy kết quả' : 'Chưa có nhà máy nào'}
          description={
            params.search || params.status?.length
              ? `Không tìm thấy nhà máy nào phù hợp với bộ lọc`
              : 'Bắt đầu bằng cách thêm nhà máy đầu tiên của bạn vào hệ thống'
          }
          action={
            !(params.search || params.status?.length)
              ? {
                  label: 'Thêm nhà máy đầu tiên',
                  onClick: () => form.openDialog(),
                  icon: <Plus className="h-4 w-4" />,
                }
              : {
                  label: 'Xóa bộ lọc',
                  onClick: clearFilters,
                  icon: <Filter className="h-4 w-4" />,
              }
          }
        />
      );
    }

    return (
      <ResponsiveTable<Factory>
        columns={columns}
        data={factories}
        keyExtractor={(factory) => factory.id}
        onRowClick={(factory) => navigate(`/equipments?factory=${factory.id}`)}
        emptyMessage="Chưa có nhà máy nào"
        pageCount={data?.meta?.totalPages}
        currentPage={params.page}
        showPagination={true}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageContainer>
      {/* Mobile Header */}
      {isMobile && (
        <MobilePageHeader
          title="Nhà máy"
          actions={
            <MobileButton size="sm" onClick={() => form.openDialog()}>
              <Plus className="h-5 w-5 mr-1.5" />
              Thêm
            </MobileButton>
          }
        />
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div className="mb-6">
          <p className="page-subtitle">QUẢN LÝ NHÀ MÁY</p>
          <div className="flex items-center justify-between">
            <h1 className="page-title">Danh sách Nhà máy</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="action-btn-secondary">
                <FileSpreadsheet className="h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" size="sm" className="action-btn-secondary">
                <Download className="h-4 w-4" />
                Xuất
              </Button>
              <Button onClick={() => form.openDialog()} className="action-btn-primary">
                <Plus className="h-4 w-4" />
                Thêm Nhà máy
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <FactoryStatsCards stats={stats} loading={statsLoading} />

      {/* Filters */}
      <MobileFilters
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Tìm nhà máy..."
        sections={filterSections}
        activeFiltersCount={activeFiltersCount}
        onClearAll={clearFilters}
        activeFilterTags={activeFilterTags}
        desktopFilters={desktopFilters}
      />

      {/* Table with Pull-to-Refresh (Mobile) or Regular Table (Desktop) */}
      {isMobile ? (
        <PullToRefresh
          onRefresh={handleRefresh}
          isPullable={!isLoading}
          pullingContent={
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">⬇️ Kéo để làm mới</p>
            </div>
          }
          refreshingContent={
            <div className="text-center py-4">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Đang làm mới...</p>
            </div>
          }
        >
          <div className="pb-20">{/* Extra padding for FAB */}
            {renderTableContent()}
          </div>
        </PullToRefresh>
      ) : (
        renderTableContent()
      )}

      {/* Form Dialog/Drawer */}
      {isMobile ? (
        // Mobile: Bottom Sheet
        <Drawer.Root open={form.isOpen} onOpenChange={(open) => !open && form.closeDialog()}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[60]" />
            <Drawer.Content className="bg-background flex flex-col rounded-t-[10px] h-[85%] mt-24 fixed bottom-0 left-0 right-0 z-[60]">
              <div className="p-4 bg-background rounded-t-[10px] flex-1 flex flex-col overflow-hidden">
                {/* Drag handle */}
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-4" />

                {/* Title */}
                <Drawer.Title className="text-lg font-semibold mb-4">
                  {form.isEditMode ? 'Chỉnh sửa Nhà máy' : 'Thêm Nhà máy mới'}
                </Drawer.Title>

                {/* Scrollable form content */}
                <div className="flex-1 overflow-y-auto -mx-4 px-4">
                  <FactoryFormFields
                    form={form}
                    onSave={handleSave}
                    isSaving={createFactory.isPending || updateFactory.isPending}
                    onCancel={form.closeDialog}
                  />
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      ) : (
        // Desktop: Regular Dialog
        <FactoryFormDialog
          form={form}
          onSave={handleSave}
          isSaving={createFactory.isPending || updateFactory.isPending}
        />
      )}

      {/* Delete Factory Dialog */}
      <DeleteFactoryDialog 
        factory={deletingFactory}
        open={!!deletingFactory}
        onOpenChange={(open) => !open && setDeletingFactory(null)}
        onConfirm={() => {
          if (deletingFactory) {
            deleteFactory.mutate(deletingFactory.id, {
              onSuccess: () => setDeletingFactory(null)
            });
          }
        }}
        isDeleting={deleteFactory.isPending}
      />
    </PageContainer>
  );
}
