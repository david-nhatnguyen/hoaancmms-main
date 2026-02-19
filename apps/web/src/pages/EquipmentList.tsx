import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '@/lib/image-utils';
import {
  Plus,
  Download,
  FileSpreadsheet,
  Cpu,
  Eye,
  Pencil,
  Trash2
} from 'lucide-react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { RowSelectionState } from '@tanstack/react-table';

// UI Components
import { Button } from '@/components/ui/button';
import { MobileButton } from '@/components/ui/mobile-button';
import { MobileFilters } from '@/components/shared/MobileFilters';
import { ChipFilter } from '@/components/shared/filters/ChipFilter';
import { FilterCheckbox } from '@/components/shared/filters/FilterCheckbox';
import { ResponsiveTable } from '@/components/shared/ResponsiveTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageContainer } from '@/components/shared/PageContainer';
import { factoriesApi } from '@/api/endpoints/factories.api';
import { DataTable } from '@/components/shared/table/DataTable';
import { MobileCardActions } from '@/components/shared/table/MobileCardActions';
import { MobileCard } from '@/components/shared/table/MobileCard';
import { ResponsivePageHeader } from '@/components/shared/layout/ResponsivePageHeader';
import { ResponsiveDataView } from '@/components/shared/layout/ResponsiveDataView';

// Feature Components, Hooks & Handlers
import {
  useEquipmentColumns,
  useEquipmentStats,
  useEquipments,
  useDeleteEquipment,
  useBulkDeleteEquipment,
  STATUS_OPTIONS,
  useEquipmentTableState,
} from '@/features/equipments/hooks';

import {
  EquipmentStats,
  DeleteEquipmentDialog,
  ImportEquipmentDialog,
  EquipmentImportProgress,
} from '@/features/equipments/components';
import { BulkActionsToolbar } from '@/components/shared/table/BulkActionsToolbar';

import type { Equipment } from '@/api/types/equipment.types';

/**
 * Equipment List Page
 * Follows FactoryList pattern for consistency
 */
export default function EquipmentList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ============================================================================
  // STATE & HOOKS
  // ============================================================================

  // Import Dialog State
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [activeImportId, setActiveImportId] = useState<string | null>(() => {
    const saved = localStorage.getItem('equipment_import_id');
    if (!saved || saved === 'undefined' || saved === 'null') return null;
    return saved;
  });
  const [activeImportFileName, setActiveImportFileName] = useState<string | null>(() => {
    return localStorage.getItem('equipment_import_file_name');
  });

  // Handle cleanup for import
  const handleCloseImport = useCallback(() => {
    setActiveImportId(null);
    setActiveImportFileName(null);
    localStorage.removeItem('equipment_import_id');
    localStorage.removeItem('equipment_import_file_name');
    localStorage.removeItem('equipment_import_duration');
    localStorage.removeItem('equipment_import_start_time');
  }, []);

  const handleUploadStart = useCallback((id: string, estimatedDuration?: number, fileName?: string) => {
    if (!id) return;

    setActiveImportId(id);
    localStorage.setItem('equipment_import_id', id);

    if (fileName) {
      setActiveImportFileName(fileName);
      localStorage.setItem('equipment_import_file_name', fileName);
    }

    if (estimatedDuration) {
      localStorage.setItem('equipment_import_duration', estimatedDuration.toString());
      localStorage.setItem('equipment_import_start_time', Date.now().toString());
    }
  }, []);

  // Fetch factories for filters
  const { data: factoriesData } = useQuery({
    queryKey: ['factories-list'],
    queryFn: () => factoriesApi.getAll({ limit: 100, page: 1 }),
  });

  const factoryOptions = useMemo(() => {
    return (factoriesData?.data || []).map(f => ({
      label: f.name,
      value: f.id, // Reverted to ID as primary filter identifier
      id: f.id,
      code: f.code,
    }));
  }, [factoriesData]);

  // Integrated Table State management with URL Sync
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
  } = useEquipmentTableState({ factoryOptions });

  // API Hooks
  const { data, isLoading } = useEquipments(params);
  const { data: statsData, isLoading: statsLoading } = useEquipmentStats();
  const deleteEquipment = useDeleteEquipment();
  const bulkDeleteEquipment = useBulkDeleteEquipment();

  // Local UI State
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(null);

  // Column Hook
  const { columns, previewDialog } = useEquipmentColumns({
    onEdit: (eq) => navigate(`/equipments/${eq.code}/edit`),
    onDelete: (eq) => setDeletingEquipment(eq),
    onViewDetails: (code) => navigate(`/equipments/${code}`),
  });




  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const facetedFilters = useMemo(() => [
    {
      column: "factoryName",
      title: "Nhà máy",
      options: factoryOptions,
    },
    {
      column: "status",
      title: "Trạng thái",
      options: STATUS_OPTIONS,
    }
  ], [factoryOptions]);

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeletingEquipment({ id: 'bulk', name: `${selectedIds.length} thiết bị`, code: 'BULK' } as any);
    setIsBulkDeleting(true);
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['equipments'] });
    await queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
    setRowSelection({});
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  const equipmentsList = data?.data || [];
  const isFiltered = params.search || activeFiltersCount > 0;



  return (
    <PageContainer>
      <ResponsivePageHeader
        title="Danh sách Thiết bị"
        subtitle="QUẢN LÝ THIẾT BỊ"
        mobileActions={
          <MobileButton size="sm" onClick={() => navigate('/equipments/new')}>
            <Plus className="h-5 w-5 mr-1.5" />
            Thêm
          </MobileButton>
        }
        desktopActions={
          <>
            <Button variant="outline" size="sm" className="action-btn-secondary" onClick={() => setShowImportDialog(true)}>
              <FileSpreadsheet className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" size="sm" className="action-btn-secondary">
              <Download className="h-4 w-4" />
              Xuất
            </Button>
            <Button onClick={() => navigate('/equipments/new')} className="action-btn-primary">
              <Plus className="h-4 w-4" />
              Thêm Thiết bị
            </Button>
          </>
        }
      />

      <ImportEquipmentDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onUploadStart={handleUploadStart}
      />

      {/* Stats Cards */}
      <EquipmentStats stats={statsData?.data} isLoading={statsLoading} />

      {activeImportId && (
        <EquipmentImportProgress
          key={activeImportId}
          jobId={activeImportId}
          fileName={activeImportFileName || undefined}
          onClose={handleCloseImport}
        />
      )}

      <ResponsiveDataView
        isLoading={isLoading}
        isEmpty={equipmentsList.length === 0 && !isFiltered}
        emptyState={
          <EmptyState
            icon={<Cpu className="h-12 w-12 text-muted-foreground/50" />}
            title="Chưa có thiết bị nào"
            description="Bắt đầu bằng cách thêm thiết bị đầu tiên của bạn"
            action={{
              label: 'Thêm thiết bị mới',
              onClick: () => navigate('/equipments/new'),
              icon: <Plus className="h-4 w-4" />,
            }}
          />
        }
        onRefresh={handleRefresh}
        mobileFilters={
          <MobileFilters
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Tìm thiết bị..."
            sections={[
              {
                id: 'factory',
                label: 'Nhà máy',
                activeCount: (columnFilters.find(f => f.id === 'factoryName')?.value as string[] || []).length,
                content: (
                  <div className="space-y-2">
                    {factoryOptions.map(f => {
                      const isActive = (columnFilters.find(f => f.id === 'factoryName')?.value as string[] || []).includes(f.value);
                      return (
                        <button
                          key={f.value}
                          onClick={() => toggleColumnFilter('factoryName', f.value)}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary text-muted-foreground'}`}
                        >
                          <FilterCheckbox checked={isActive} />
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                )
              },
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
              },
            ]}
            activeFiltersCount={activeFiltersCount}
            onClearAll={resetFilters}
            activeFilterTags={null}

            desktopFilters={null}
          />
        }
        desktopFilters={null}

        mobileContent={
          <ResponsiveTable<Equipment>
            columns={columns}
            data={equipmentsList}
            keyExtractor={(eq) => eq.id}
            emptyMessage={isFiltered ? "Không tìm thấy kết quả phù hợp" : "Chưa có thiết bị nào"}
            pageCount={data?.meta?.totalPages}
            currentPage={params.page}
            showPagination={true}
            onPageChange={(page) => setPagination(prev => ({ ...prev, pageIndex: page - 1 }))}
            selectedIds={selectedIds}
            onSelectionChange={(ids) => {
              const nextSelection: RowSelectionState = {};
              ids.forEach(id => nextSelection[id] = true);
              setRowSelection(nextSelection);
            }}
            renderMobileCard={(eq, cols, isSelected, toggleSelection) => {
              // Helper to find special columns
              const codeCol = cols.find(c => c.key === 'code');
              const statusCol = cols.find(c => c.key === 'status');

              return (
                <MobileCard
                  title={codeCol?.render(eq)}
                  subtitle={eq.name}
                  status={statusCol?.render(eq)}
                  image={getImageUrl(eq.image)}
                  data={[
                    { label: 'Nhà máy', value: eq.factoryName },
                    { label: 'Số lượng', value: eq.quantity }
                  ]}
                  footerActions={
                    <MobileCardActions actions={[
                      {
                        key: 'view',
                        label: 'Xem chi tiết',
                        variant: 'primary',
                        icon: <Eye className="h-4 w-4" />,
                        onClick: () => navigate(`/equipments/${eq.code}`)
                      },
                      {
                        key: 'edit',
                        label: 'Chỉnh sửa',
                        variant: 'warning',
                        icon: <Pencil className="h-4 w-4" />,
                        onClick: () => navigate(`/equipments/${eq.code}/edit`)
                      },
                      {
                        key: 'delete',
                        label: 'Xóa vĩnh viễn',
                        variant: 'destructive',
                        icon: <Trash2 className="h-4 w-4" />,
                        onClick: () => setDeletingEquipment(eq)
                      }
                    ]} />
                  }
                  onClick={() => navigate(`/equipments/${eq.code}`)}
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
            data={equipmentsList}
            pageCount={data?.meta?.totalPages}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            onPaginationChange={(pageIndex, pageSize) => {
              setPagination({ pageIndex, pageSize });
            }}
            onRowSelectionChange={setRowSelection}
            rowSelection={rowSelection}
            getRowId={(row) => row.id}
            // Integrated search and filters
            searchColumn="name"
            searchPlaceholder="Tìm kiếm thiết bị..."
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

      <BulkActionsToolbar
        selectedCount={selectedIds.length}
        onClear={() => setRowSelection({})}
        onDelete={handleBulkDelete}
        isDeleting={bulkDeleteEquipment.isPending}
      />

      {/* Deleting Dialog */}
      <DeleteEquipmentDialog
        equipment={deletingEquipment}
        open={!!deletingEquipment}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingEquipment(null);
            setIsBulkDeleting(false);
          }
        }}
        onConfirm={() => {
          if (isBulkDeleting) {
            bulkDeleteEquipment.mutate(selectedIds, {
              onSuccess: () => {
                setDeletingEquipment(null);
                setRowSelection({});
                setIsBulkDeleting(false);
              }
            });
          } else if (deletingEquipment) {
            deleteEquipment.mutate(deletingEquipment.id, {
              onSuccess: () => setDeletingEquipment(null)
            });
          }
        }}
        isDeleting={deleteEquipment.isPending || (isBulkDeleting && bulkDeleteEquipment.isPending)}
      />

      {previewDialog}
    </PageContainer>
  );
}
