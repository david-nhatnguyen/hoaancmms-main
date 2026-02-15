import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Building2, Download, FileSpreadsheet,
  Settings2,
  Trash2,
  Pencil
} from "lucide-react";
import { useQueryClient } from '@tanstack/react-query';
import { RowSelectionState } from '@tanstack/react-table';

// UI Components
import { Button } from '@/components/ui/button';
import { MobileButton } from '@/components/ui/mobile-button';
import { MobileFilters } from '@/components/shared/MobileFilters';
import { ChipFilter } from '@/components/shared/filters/ChipFilter';
import { ResponsiveTable } from '@/components/shared/ResponsiveTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageContainer } from '@/components/shared/PageContainer';
import { BulkActionsToolbar } from '@/components/shared/table/BulkActionsToolbar';
import { MobileCardActions } from '@/components/shared/table/MobileCardActions';
import { MobileCard } from '@/components/shared/table/MobileCard';
import { DataTable } from '@/components/shared/table/DataTable';
import { ResponsivePageHeader } from '@/components/shared/layout/ResponsivePageHeader';
import { ResponsiveDataView } from '@/components/shared/layout/ResponsiveDataView';
import { ResponsiveFormSheet } from '@/components/shared/layout/ResponsiveFormSheet';

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
import { useFactoryTableState } from '@/features/factories/hooks/useFactoryTableState';
import {
  FactoryStatsCards,
  DeleteFactoryDialog,
} from '@/features/factories/components';
import { FactoryFormFields } from '@/features/factories/components/FactoryFormDialog/FactoryFormFields';
import { STATUS_OPTIONS } from '@/features/factories/handlers/factory-table.handlers';
import type { Factory } from '@/api/types/factory.types';

/**
 * Factory List Page (Web-First Responsive Design)
 * Matches EquipmentList pattern for consistency.
 */
export default function FactoryList() {
  const navigate = useNavigate();
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
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    params,
    activeFiltersCount,
    resetFilters,
    toggleColumnFilter,
  } = useFactoryTableState();

  // Custom hooks for form management
  const form = useFactoryForm();

  // Custom hook for table columns
  const { columns } = useFactoryColumns({
    onEdit: form.openDialog,
    onViewEquipments: (id) => navigate(`/equipments?factoryId=${id}`),
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
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Bulk Selection
  const bulkDelete = useBulkDeleteFactories();

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeletingFactory({ id: 'bulk', name: `${selectedIds.length} nhà máy`, code: 'BULK' } as any);
    setIsBulkDeleting(true);
  };

  const facetedFilters = useMemo(() => [
    {
      column: "status",
      title: "Trạng thái",
      options: STATUS_OPTIONS,
    }
  ], []);


  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['factories'] });
    await queryClient.invalidateQueries({ queryKey: ['factory-stats'] });
    setRowSelection({});
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  /**
   * Handle save (create or update)
   */
  const handleSave = () => {
    if (!form.validate()) return;

    form.setIsSubmitting(true);
    const mutation = form.isEditMode && form.editingFactory
      ? updateFactory
      : createFactory;

    const payload = form.isEditMode && form.editingFactory
      ? {
        id: form.editingFactory.id,
        data: {
          code: form.formData.code,
          name: form.formData.name,
          location: form.formData.location || undefined,
          status: form.formData.status,
        },
      }
      : {
        code: form.formData.code,
        name: form.formData.name,
        location: form.formData.location || undefined,
        status: 'ACTIVE' as const,
      };

    // @ts-expect-error - Dynamic dispatch is safe here due to structure
    mutation.mutate(payload, {
      onSuccess: () => {
        form.closeDialog();
        if (window.navigator.vibrate) window.navigator.vibrate([10, 50, 10]);
      },
      onSettled: () => form.setIsSubmitting(false),
    });
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const factories = data?.data || [];
  const isFiltered = params.search || activeFiltersCount > 0;

  // ============================================================================
  // RENDER
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

  return (
    <PageContainer>
      <ResponsivePageHeader
        title="Danh sách Nhà máy"
        subtitle="QUẢN LÝ NHÀ MÁY"
        mobileActions={
          <MobileButton size="sm" onClick={() => form.openDialog()}>
            <Plus className="h-5 w-5 mr-1.5" />
            Thêm
          </MobileButton>
        }
        desktopActions={
          <>
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
          </>
        }
      />

      {/* Stats Cards */}
      <FactoryStatsCards stats={stats} loading={statsLoading} />

      <ResponsiveDataView
        isLoading={isLoading}
        isEmpty={factories.length === 0 && !isFiltered}
        onRefresh={handleRefresh}
        emptyState={
          <EmptyState
            icon={<Building2 className="h-12 w-12 text-muted-foreground/50" />}
            title="Chưa có nhà máy nào"
            description="Bắt đầu bằng cách thêm nhà máy đầu tiên của bạn vào hệ thống"
            action={{
              label: 'Thêm nhà máy đầu tiên',
              onClick: () => form.openDialog(),
              icon: <Plus className="h-4 w-4" />,
            }}
          />
        }
        mobileFilters={
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
            activeFilterTags={null}

            desktopFilters={null}
          />
        }
        desktopFilters={null}

        mobileContent={
          <ResponsiveTable<Factory>
            columns={columns}
            data={factories}
            keyExtractor={(factory) => factory.id}
            emptyMessage={isFiltered ? "Không tìm thấy kết quả phù hợp" : "Chưa có nhà máy nào"}
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
            renderMobileCard={(factory, cols, isSelected, toggleSelection) => {
              const codeCol = cols.find(c => c.key === 'code');
              const statusCol = cols.find(c => c.key === 'status');

              return (
                <MobileCard
                  title={codeCol?.render(factory)}
                  subtitle={factory.name}
                  status={statusCol?.render(factory)}
                  data={[
                    { label: 'Địa điểm', value: factory.location },
                    { label: 'Số lượng TB', value: factory.equipmentCount }
                  ]}
                  footerActions={
                    <MobileCardActions actions={[
                      {
                        key: 'view-equipments',
                        label: 'Xem danh sách thiết bị',
                        variant: 'primary',
                        icon: <Settings2 className="h-4 w-4" />,
                        onClick: () => navigate(`/equipments?factoryId=${factory.id}`)
                      },
                      {
                        key: 'edit',
                        label: 'Chỉnh sửa thông tin',
                        variant: 'warning',
                        icon: <Pencil className="h-4 w-4" />,
                        onClick: () => form.openDialog(factory)
                      },
                      {
                        key: 'delete',
                        label: 'Xóa',
                        variant: 'destructive',
                        icon: <Trash2 className="h-4 w-4" />,
                        onClick: () => setDeletingFactory(factory)
                      }
                    ]} />
                  }
                  onClick={() => navigate(`/equipments?factoryId=${factory.id}`)}
                  isSelected={isSelected}
                  onToggleSelection={toggleSelection}
                  renderSelection={true}
                />
              );
            }}
            isLoading={isLoading}
          />
        }
        desktopContent={
          <DataTable
            columns={columns}
            data={factories}
            pageCount={data?.meta?.totalPages}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            onPaginationChange={(pageIndex, pageSize) => {
              setPagination({ pageIndex, pageSize });
            }}
            onRowSelectionChange={setRowSelection}
            rowSelection={rowSelection}
            getRowId={(row) => row.id}
            searchColumn="name"
            searchPlaceholder="Tìm kiếm nhà máy..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            facetedFilters={facetedFilters}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            onFilterReset={resetFilters}
            isLoading={isLoading}
          />
        }
      />

      {/* Bulk Actions */}
      <BulkActionsToolbar
        selectedCount={selectedIds.length}
        onClear={() => setRowSelection({})}
        onDelete={handleBulkDelete}
        isDeleting={bulkDelete.isPending}
      />

      <ResponsiveFormSheet
        isOpen={form.isOpen}
        onOpenChange={(open) => !open && form.closeDialog()}
        title={form.isEditMode ? 'Chỉnh sửa Nhà máy' : 'Thêm Nhà máy mới'}
        contentClassName="px-0"
      >
        <FactoryFormFields
          form={form}
          onSave={handleSave}
          isSaving={createFactory.isPending || updateFactory.isPending}
          onCancel={form.closeDialog}
        />
      </ResponsiveFormSheet>

      {/* Delete Factory Dialog */}
      <DeleteFactoryDialog
        factory={deletingFactory}
        open={!!deletingFactory}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingFactory(null);
            setIsBulkDeleting(false);
          }
        }}
        onConfirm={() => {
          if (isBulkDeleting) {
            bulkDelete.mutate(selectedIds, {
              onSuccess: () => {
                setDeletingFactory(null);
                setRowSelection({});
                setIsBulkDeleting(false);
              }
            });
          } else if (deletingFactory) {
            deleteFactory.mutate(deletingFactory.id, {
              onSuccess: () => setDeletingFactory(null)
            });
          }
        }}
        isDeleting={deleteFactory.isPending || (isBulkDeleting && bulkDelete.isPending)}
      />
    </PageContainer>
  );
}
