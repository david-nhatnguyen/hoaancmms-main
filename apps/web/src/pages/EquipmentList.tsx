import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Loader2, Cpu, Filter, X, FileSpreadsheet, Download } from 'lucide-react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { RowSelectionState } from '@tanstack/react-table';

// UI Components
import { Button } from '@/components/ui/button';
import { MobileButton } from '@/components/ui/mobile-button';
import { MobileFilters } from '@/components/shared/MobileFilters';
import { ChipFilter } from '@/components/shared/filters/ChipFilter';
import { FilterCheckbox } from '@/components/shared/filters/FilterCheckbox';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { ResponsiveTable } from '@/components/shared/ResponsiveTable';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageContainer } from '@/components/shared/PageContainer';
import { useIsMobile } from '@/hooks/use-mobile';
import { factoriesApi } from '@/api/endpoints/factories.api';
import { DataTable } from '@/components/shared/table/DataTable';
import { MobileCardActions } from '@/components/shared/table/MobileCardActions';
import { useDataTableState } from '@/features/shared/table/hooks/use-table-state';
import { DataTableFilterChips } from '@/components/shared/table/DataTableFilterChips';
import { updateColumnFilters } from '@/features/shared/table/handlers/table-logic.handlers';

// Feature Components & Hooks
import {
  useEquipmentColumns,
  useEquipmentStats,
  useEquipments,
  useDeleteEquipment,
  useBulkDeleteEquipment,
  STATUS_OPTIONS,
} from '@/features/equipments/hooks';

import {
  EquipmentStats,
  DeleteEquipmentDialog,
  ImportEquipmentDialog,
  ImportProgress,
} from '@/features/equipments/components';
import { BulkActionsToolbar } from '@/components/shared/table/BulkActionsToolbar';

import type { Equipment, EquipmentQueryParams, EquipmentStatus } from '@/api/types/equipment.types';

/**
 * Equipment List Page
 * Follows FactoryList pattern for consistency
 */
export default function EquipmentList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // ============================================================================
  // STATE & HOOKS
  // ============================================================================

  // Import Dialog State
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [activeImportId, setActiveImportId] = useState<string | null>(() => {
    const saved = localStorage.getItem('import_id');
    if (!saved || saved === 'undefined' || saved === 'null') return null;
    return saved;
  });
  const [activeImportFileName, setActiveImportFileName] = useState<string | null>(() => {
    return localStorage.getItem('import_file_name');
  });

  // Handle cleanup for import
  const handleCloseImport = useCallback(() => {
    setActiveImportId(null);
    setActiveImportFileName(null);
    localStorage.removeItem('import_id');
    localStorage.removeItem('import_file_name');
    localStorage.removeItem('import_duration');
    localStorage.removeItem('import_start_time');
  }, []);

  const handleUploadStart = useCallback((id: string, estimatedDuration?: number, fileName?: string) => {
    if (!id) return;
    
    setActiveImportId(id);
    localStorage.setItem('import_id', id);

    if (fileName) {
      setActiveImportFileName(fileName);
      localStorage.setItem('import_file_name', fileName);
    }

    if (estimatedDuration) {
      localStorage.setItem('import_duration', estimatedDuration.toString());
      localStorage.setItem('import_start_time', Date.now().toString());
    }
  }, []);

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
  } = useDataTableState<EquipmentQueryParams>({
    initialParams: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: [] as EquipmentStatus[],
      factoryId: [] as string[],
    },
    filterMapping: {
      factoryName: 'factoryId'
    }
  });

  const [searchParams] = useSearchParams();
  
  // Fetch factories for filters
  const { data: factoriesData } = useQuery({
    queryKey: ['factories-list'],
    queryFn: () => factoriesApi.getAll({ limit: 100, page: 1 }),
  });

  const factoryOptions = useMemo(() => {
    return (factoriesData?.data || []).map(f => ({
      label: f.name,
      value: f.id,
    }));
  }, [factoriesData]);

  // URL Parameter Sync (for initial load)
  useEffect(() => {
    const factoryCode = searchParams.get('factoryCode');
    if (factoryCode) {
       // Search by factory code if provided in URL
       setSearchQuery(factoryCode);
    }
    
    const factoryId = searchParams.get('factoryId');
    if (factoryId) {
        setColumnFilters(prev => updateColumnFilters(prev, 'factoryName', [factoryId]));
    }
  }, []);

  // API Hooks
  const { data, isLoading, refetch } = useEquipments(params);
  const { data: statsData, isLoading: statsLoading } = useEquipmentStats();
  const deleteEquipment = useDeleteEquipment();
  const bulkDeleteEquipment = useBulkDeleteEquipment();

  // Local UI State
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(null);

  // Column Hook
  const { columns, previewDialog } = useEquipmentColumns({
    onEdit: (eq) => navigate(`/equipments/${eq.id}/edit`),
    onDelete: (eq) => setDeletingEquipment(eq),
    onViewDetails: (code) => navigate(`/equipments/${code}`),
  });



  const getFilterLabel = useCallback((id: string, value: any) => {
    if (id === 'status') {
      return STATUS_OPTIONS.find(opt => opt.value === value)?.label || value;
    }
    if (id === 'factoryName') {
      return factoryOptions.find(opt => opt.value === value)?.label || value;
    }
    return value;
  }, [factoryOptions]);

  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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

  const renderTableContent = () => {
    if (isLoading) return <TableSkeleton rows={5} />;

    const equipmentsList = data?.data || [];

    if (equipmentsList.length === 0) {
      return (
        <EmptyState
          icon={<Cpu className="h-12 w-12 text-muted-foreground/50" />}
          title={params.search || activeFiltersCount > 0 ? 'Không tìm thấy kết quả' : 'Chưa có thiết bị nào'}
          description={
            params.search || activeFiltersCount > 0
              ? `Không tìm thấy thiết bị phù hợp với bộ lọc`
              : 'Bắt đầu bằng cách thêm thiết bị đầu tiên của bạn'
          }
          action={
            !(params.search || activeFiltersCount > 0)
              ? {
                  label: 'Thêm thiết bị mới',
                  onClick: () => navigate('/equipments/new'),
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
        <ResponsiveTable<Equipment>
          columns={columns}
          data={equipmentsList}
          keyExtractor={(eq) => eq.id}
          emptyMessage="Chưa có thiết bị nào"
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
          mobileCardAction={(eq) => (
             <MobileCardActions 
                 onView={() => navigate(`/equipments/${eq.id}`)}
                 onEdit={() => navigate(`/equipments/${eq.id}/edit`)}
                 onDelete={() => setDeletingEquipment(eq)}
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
          data={equipmentsList}
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
          searchPlaceholder="Tìm kiếm thiết bị..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          facetedFilters={[
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
          ]}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          onFilterReset={resetFilters}
        />
      </>
    );
  };

  return (
    <PageContainer>
      {/* Mobile Header */}
      {isMobile && (
        <MobilePageHeader
          title="Thiết bị"
          actions={
            <MobileButton size="sm" onClick={() => navigate('/equipments/new')}>
              <Plus className="h-5 w-5 mr-1.5" />
              Thêm
            </MobileButton>
          }
        />
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div className="mb-6">
          <p className="page-subtitle">QUẢN LÝ THIẾT BỊ</p>
          <div className="flex items-center justify-between">
            <h1 className="page-title">Danh sách Thiết bị</h1>
            <div className="flex items-center gap-2">
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
            </div>
          </div>
        </div>
      )}

      <ImportEquipmentDialog 
        open={showImportDialog} 
        onOpenChange={setShowImportDialog}
        onUploadStart={handleUploadStart}
      />

      {/* Stats Cards */}
      <EquipmentStats stats={statsData?.data} isLoading={statsLoading} />

      {activeImportId && (
        <ImportProgress 
          key={activeImportId}
          jobId={activeImportId} 
          fileName={activeImportFileName || undefined}
          onClose={handleCloseImport} 
        />
      )}

      {/* Mobile Filters */}
      {isMobile && (
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

      {/* Bulk Actions */}
      <BulkActionsToolbar
        selectedCount={selectedIds.length}
        onClear={() => setRowSelection({})}
        onDelete={handleBulkDelete}
        isDeleting={bulkDeleteEquipment.isPending}
      />

      {/* Table with Pull-to-Refresh */}
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
          <div className="pb-20">
            {renderTableContent()}
          </div>
        </PullToRefresh>
      ) : (
        renderTableContent()
      )}

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
