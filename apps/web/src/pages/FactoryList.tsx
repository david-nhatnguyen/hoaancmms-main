import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Building2, Download, CircleCheck, CircleX, Filter } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { Drawer } from 'vaul';
import { RowSelectionState } from '@tanstack/react-table';

// UI Components
import { Button } from '@/components/ui/button';
import { MobileButton } from '@/components/ui/mobile-button';
import { Badge } from '@/components/ui/badge';
import { MobileFilters } from '@/components/shared/MobileFilters';
import { ChipFilter } from '@/components/shared/filters/ChipFilter';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { ResponsiveTable } from '@/components/shared/ResponsiveTable';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageContainer } from '@/components/shared/PageContainer';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDataTableState } from '@/features/shared/table/hooks/use-table-state';
import { DataTableFilterChips } from '@/components/shared/table/DataTableFilterChips';

// Feature Components & Hooks
import {
  useFactoryForm,
  useFactoryColumns,
  useFactoryTableStats,
  useFactories,
  useCreateFactory,
  useUpdateFactory,
  useDeleteFactory,
  useBulkDeleteFactories,
} from '@/features/factories/hooks';

import {
  FactoryFormDialog,
  FactoryStatsCards,
  DeleteFactoryDialog,
} from '@/features/factories/components';
import { FactoryFormFields } from '@/features/factories/components/FactoryFormDialog/FactoryFormFields';
import { BulkActionsToolbar } from '@/components/shared/table/BulkActionsToolbar';
import { MobileCardActions } from '@/components/shared/table/MobileCardActions';
import { DataTable } from '@/components/shared/table/DataTable';

import type { Factory, FactoryQueryParams, FactoryStatus } from '@/api/types/factory.types';

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
  { value: 'ACTIVE', label: 'Hoạt động', color: 'bg-status-active', icon: CircleCheck },
  { value: 'INACTIVE', label: 'Ngừng hoạt động', color: 'bg-status-inactive', icon: CircleX }
];

export default function FactoryList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // ============================================================================
  // STATE & HOOKS
  // ============================================================================

  // Integrated Table State management
  const {
    searchQuery,
    setSearchQuery,
    rowSelection,
    setRowSelection,
    selectedIds,
    sorting,
    setSorting,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    params,
    activeFiltersCount,
    resetFilters,
    toggleColumnFilter,
  } = useDataTableState<FactoryQueryParams>({
    initialParams: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: [] as FactoryStatus[],
    }
  });

  // Custom hooks for form management
  const form = useFactoryForm();

  // Custom hook for table columns
  const { columns } = useFactoryColumns({
    onEdit: form.openDialog,
    onViewEquipments: (code) => navigate(`/equipments?factoryCode=${code}`),
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

  // Selection
  const bulkDelete = useBulkDeleteFactories();

  const facetedFilters = useMemo(() => [
    {
      column: "status",
      title: "Trạng thái",
      options: STATUS_OPTIONS,
    }
  ], []);




  // Active Filter Labels Mapping
  const getFilterLabel = useCallback((id: string, value: any) => {
    if (id === 'status') {
      return STATUS_OPTIONS.find(opt => opt.value === value)?.label || value;
    }
    return value;
  }, []);

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
    if (isLoading) return <TableSkeleton rows={5} />;

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
                  onClick: resetFilters,
                  icon: <Filter className="h-4 w-4" />,
              }
          }
        />
      );
    }

    if (isMobile) {
      return (
        <ResponsiveTable<Factory>
          columns={columns}
          data={factories}
          keyExtractor={(factory) => factory.id}
          emptyMessage="Chưa có nhà máy nào"
          pageCount={data?.meta?.totalPages}
          currentPage={params.page}
          showPagination={true}
          onPageChange={(page) => setPagination(prev => ({ ...prev, pageIndex: page - 1 }))}
          selectedIds={selectedIds}
          onSelectionChange={(ids) => {
             const newSelection: RowSelectionState = {};
             ids.forEach(id => newSelection[id] = true);
             setRowSelection(newSelection);
          }}
          mobileCardAction={(factory) => (
            <MobileCardActions 
              onView={() => navigate(`/equipments?factory=${factory.id}`)}
              onEdit={() => form.openDialog(factory)}
              onDelete={() => setDeletingFactory(factory)}
              viewLabel="Xem TB"
            />
          )}
        />
      );
    }

    return (
      <>
        <DataTableFilterChips 
          filters={columnFilters}
          onRemove={toggleColumnFilter}
          onClearAll={resetFilters}
          getLabel={getFilterLabel}
        />
        <DataTable
          columns={columns}
          data={factories}
          pageCount={data?.meta?.totalPages}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          onPaginationChange={(pageIndex, pageSize) => {
            setPagination({ pageIndex, pageSize });
          }}
          onSortingChange={setSorting}
          sorting={sorting}
          onRowSelectionChange={setRowSelection}
          rowSelection={rowSelection}
          getRowId={(row) => row.id}
          // Integrated search and filters
          searchColumn="name"
          searchPlaceholder="Tìm kiếm nhà máy..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          facetedFilters={facetedFilters}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          onFilterReset={resetFilters}
        />
      </>
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

      {/* Filters (Mobile only since desktop integrated in DataTable) */}
      {isMobile && (
        <MobileFilters
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Tìm nhà máy..."
          sections={[
            {
              id: 'status',
              label: 'Trạng thái',
              activeCount: (columnFilters.find(f => f.id === 'status')?.value as string[] || []).length,
              content: (
                <ChipFilter 
                  options={STATUS_OPTIONS} 
                  selected={(columnFilters.find(f => f.id === 'status')?.value as string[]) || []} 
                  onToggle={(val) => toggleColumnFilter('status', val)} 
                />
              )
            }
          ]}
          activeFiltersCount={activeFiltersCount}
          onClearAll={resetFilters}
          activeFilterTags={
            <DataTableFilterChips 
              filters={columnFilters}
              onRemove={toggleColumnFilter}
              onClearAll={resetFilters}
              getLabel={getFilterLabel}
            />
          }
          desktopFilters={null}
        />
      )}

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

      {/* Bulk Actions */}
      <BulkActionsToolbar
        selectedCount={selectedIds.length}
        onClear={() => setRowSelection({})}
        onDelete={() => {
           if (window.confirm(`Bạn có chắc muốn xóa ${selectedIds.length} nhà máy đã chọn?`)) {
             bulkDelete.mutate(selectedIds, {
               onSuccess: () => setRowSelection({})
             });
           }
        }}
        isDeleting={bulkDelete.isPending}
      />

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
