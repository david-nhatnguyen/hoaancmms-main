import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Building2, Pencil, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { Drawer } from 'vaul';

// UI Components
import { Button } from '@/components/ui/button';
import { MobileButton } from '@/components/ui/mobile-button';
import { FAB } from '@/components/ui/fab';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { ResponsiveTable } from '@/components/shared/ResponsiveTable';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { SearchBar } from '@/components/shared/SearchBar';
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
} from '@/features/factories/hooks';

import {
  FactoryFormDialog,
  FactoryStatsCards,
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
export default function FactoryList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // ============================================================================
  // STATE & HOOKS
  // ============================================================================

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Query parameters
  const [params] = useState<FactoryQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Custom hooks for form management
  const form = useFactoryForm();

  // Custom hook for table columns
  const { columns } = useFactoryColumns({
    onEdit: form.openDialog,
    onViewEquipments: (id) => navigate(`/equipments?factory=${id}`),
  });

  // Custom hook for stats
  const { stats, isLoading: statsLoading } = useFactoryTableStats();

  // API hooks
  const { data, isLoading, error, refetch } = useFactories(params);
  const createFactory = useCreateFactory();
  const updateFactory = useUpdateFactory();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Filter data based on search query
   */
  const filteredData = useMemo(() => {
    if (!searchQuery || !data?.data) return data?.data || [];

    const query = searchQuery.toLowerCase();
    return data.data.filter(
      (factory) =>
        factory.name.toLowerCase().includes(query) ||
        factory.code.toLowerCase().includes(query) ||
        factory.location?.toLowerCase().includes(query)
    );
  }, [data?.data, searchQuery]);

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
   * Render mobile card with visible action buttons
   */
  const renderMobileCard = (factory: Factory) => (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden transition-all hover:border-primary/50">
      {/* Card Content - Clickable */}
      <div
        onClick={() => form.openDialog(factory)}
        className="p-4 cursor-pointer active:bg-accent/50 transition-colors"
      >
        {/* Primary & Secondary info */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="font-mono text-primary font-medium text-sm truncate">
              {factory.code}
            </div>
            <div className="font-medium mt-0.5 truncate text-sm">{factory.name}</div>
          </div>
          {/* Status badge */}
          <div className="shrink-0">
            {columns.find((c) => c.key === 'status')?.render(factory)}
          </div>
        </div>

        {/* Additional info */}
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs">Địa điểm:</span>
            <span className="text-right truncate text-xs">{factory.location || '-'}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs">Số lượng TB:</span>
            <span className="text-right text-xs">{factory.equipmentCount}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons - Visible, Touch-Optimized */}
      <div className="flex gap-2 p-4 border-t border-border/50">
        <MobileButton
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            form.openDialog(factory);
          }}
          className="flex-1"
        >
          <Pencil className="h-4 w-4 mr-1.5" />
          Sửa
        </MobileButton>
        <MobileButton
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Add delete confirmation dialog
            console.log('Delete factory:', factory.id);
          }}
          className="flex-1 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1.5" />
          Xóa
        </MobileButton>
      </div>
    </div>
  );

  /**
   * Render table content
   */
  const renderTableContent = () => {
    if (isLoading) {
      return <TableSkeleton rows={5} />;
    }

    if (filteredData.length === 0) {
      return (
        <EmptyState
          icon={Building2}
          title={searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có nhà máy nào'}
          description={
            searchQuery
              ? `Không tìm thấy nhà máy nào phù hợp với "${searchQuery}"`
              : 'Bắt đầu bằng cách thêm nhà máy đầu tiên của bạn vào hệ thống'
          }
          action={
            !searchQuery
              ? {
                  label: 'Thêm nhà máy đầu tiên',
                  onClick: () => form.openDialog(),
                  icon: <Plus className="h-4 w-4" />,
                }
              : undefined
          }
        />
      );
    }

    if (isMobile) {
      // Mobile: Render cards with swipe actions
      return (
        <div className="space-y-3">
          {filteredData.map((factory) => (
            <div key={factory.id}>{renderMobileCard(factory)}</div>
          ))}
        </div>
      );
    }

    // Desktop: Regular table
    return (
      <ResponsiveTable<Factory>
        columns={columns}
        data={filteredData}
        keyExtractor={(factory) => factory.id}
        onRowClick={(factory) => form.openDialog(factory)}
        emptyMessage="Chưa có nhà máy nào"
        showPagination={false}
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quản lý Nhà máy</h1>
            <p className="text-muted-foreground mt-1">
              Danh sách tất cả các nhà máy trong hệ thống
            </p>
          </div>
          <Button onClick={() => form.openDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm Nhà máy
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <FactoryStatsCards stats={stats} loading={statsLoading} />

      {/* Search Bar (sticky on mobile) */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Tìm nhà máy..."
        sticky={isMobile}
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
    </PageContainer>
  );
}
