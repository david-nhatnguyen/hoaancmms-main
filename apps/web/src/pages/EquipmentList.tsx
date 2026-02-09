import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Loader2, Cpu, Filter, X, FileSpreadsheet, Download, Factory, Building2 } from 'lucide-react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import PullToRefresh from 'react-simple-pull-to-refresh';

// UI Components
import { Button } from '@/components/ui/button';
import { MobileButton } from '@/components/ui/mobile-button';
import { Badge } from '@/components/ui/badge';
import { MobileFilters } from '@/components/shared/MobileFilters';
import { ChipFilter } from '@/components/shared/filters/ChipFilter';
import { FilterCheckbox } from '@/components/shared/filters/FilterCheckbox';
import { useDebounce } from '@/hooks/use-debounce';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { ResponsiveTable } from '@/components/shared/ResponsiveTable';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageContainer } from '@/components/shared/PageContainer';
import { useIsMobile } from '@/hooks/use-mobile';
import { factoriesApi } from '@/api/endpoints/factories.api';

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
  QuickAccessFilters as EquipmentDesktopFilters, // This is now a generic component but we keep the import name for now or rename
  ImportEquipmentDialog,
  ImportProgress,
} from '@/features/equipments/components';
import { MultiSelectDropdown } from '@/components/shared/filters/MultiSelectDropdown';
import { BulkActionsToolbar } from '@/components/shared/table/BulkActionsToolbar';

import type { Equipment, EquipmentQueryParams } from '@/api/types/equipment.types';

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

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

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

  // Sync activeImportId (basic sync only for the ID)
  useEffect(() => {
    if (!activeImportId) {
      localStorage.removeItem('import_id');
      localStorage.removeItem('import_duration');
      localStorage.removeItem('import_start_time');
    }
  }, [activeImportId]);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ... (rest of file)



  // Query parameters
  const [params, setParams] = useState<EquipmentQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    status: [],
    factoryId: undefined, // Filter by factory
  });

  // Sync search with params
  useMemo(() => {
    setParams(prev => {
      if (prev.search === debouncedSearch) return prev;
      return { ...prev, search: debouncedSearch, page: 1 };
    });
  }, [debouncedSearch]);

  const [searchParams] = useSearchParams();
  
  // URL to State Sync
  useEffect(() => {
    const factoryIds = searchParams.getAll('factoryId');
    const factoryCodes = searchParams.getAll('factoryCode');
    // Also support 'factory' as a legacy/generic param
    const genericFactories = searchParams.getAll('factory');

    if (factoryIds.length > 0 || factoryCodes.length > 0 || genericFactories.length > 0) {
      setParams(prev => {
        const nextFactoryIds = [...factoryIds];
        const nextFactoryCodes = [...factoryCodes];

        genericFactories.forEach(gf => {
          if (gf.length > 20) nextFactoryIds.push(gf);
          else nextFactoryCodes.push(gf);
        });

        return {
          ...prev,
          factoryId: nextFactoryIds.length > 0 ? nextFactoryIds : undefined,
          factoryCode: nextFactoryCodes.length > 0 ? nextFactoryCodes : undefined,
          page: 1
        };
      });
    }
  }, [searchParams]);


  // Custom hook for table columns
  const { columns, previewDialog } = useEquipmentColumns({
    onEdit: (eq) => navigate(`/equipments/${eq.id}/edit`),
    onViewDetails: (code) => navigate(`/equipments/${code}`),
    onDelete: (equipment) => setDeletingEquipment(equipment),
  });

  // Custom hook for stats
  const { data: statsData, isLoading: statsLoading } = useEquipmentStats();

  // API hooks
  const { data, isLoading } = useEquipments(params);
  const deleteEquipment = useDeleteEquipment();
  const bulkDeleteEquipment = useBulkDeleteEquipment();

  // Fetch factories for filters
  const { data: factoriesData } = useQuery({
    queryKey: ['factories-list'],
    queryFn: () => factoriesApi.getAll({ limit: 100, page: 1 }),
  });
  
  const factoriesList = factoriesData?.data || [];
  const factoryOptions = factoriesList.map(f => ({ value: f.id, label: f.name }));

  // Delete State
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(null);

  // ============================================================================
  // FILTER LOGIC
  // ============================================================================

  const toggleStatus = (value: string) => {
    setParams(prev => {
      const current = Array.isArray(prev.status) ? prev.status : [];
      const next = current.includes(value as any)
        ? current.filter(s => s !== value)
        : [...current, value as any];
      return { ...prev, status: next.length > 0 ? next : undefined, page: 1 };
    });
  };

  const toggleFactory = (value: string) => {
      setParams(prev => {
          const current = Array.isArray(prev.factoryId) ? prev.factoryId : [];
          const next = current.includes(value)
            ? current.filter(id => id !== value)
            : [...current, value];
          return { ...prev, factoryId: next.length > 0 ? next : undefined, page: 1 };
      });
  };

  const clearFilters = () => {
    setParams(prev => ({
      ...prev,
      status: undefined,
      factoryId: undefined,
      search: '',
      page: 1
    }));
    setSearchQuery('');
  };

  const activeFiltersCount = 
    (Array.isArray(params.status) ? params.status.length : 0) +
    (Array.isArray(params.factoryId) ? params.factoryId.length : 0) +
    (Array.isArray(params.factoryCode) ? params.factoryCode.length : 0);

  // Mobile Filter Sections
  const filterSections = [
    {
      id: 'factory',
      label: 'Nhà máy',
       activeCount: Array.isArray(params.factoryId) ? params.factoryId.length : 0,
       content: (
          <div className="space-y-2">
            {factoryOptions.map(f => {
              const isActive = Array.isArray(params.factoryId) && params.factoryId.includes(f.value);
              return (
                <button
                  key={f.value}
                  onClick={() => toggleFactory(f.value)}
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
       activeCount: Array.isArray(params.status) ? params.status.length : 0,
       content: (
         <ChipFilter 
           options={STATUS_OPTIONS} 
           selected={(params.status as string[]) || []} 
           onToggle={toggleStatus} 
         />
       )
     },
  ];

  // Active Filter Tags
  const renderActiveTags = () => {
      const tags: React.ReactNode[] = [];
      (params.factoryId || []).forEach(fid => {
          const label = factoryOptions.find(f => f.value === fid)?.label;
          tags.push(
            <Badge key={`f-${fid}`} variant="secondary" className="gap-1 pl-2 pr-1 py-0.5">
               {label}
               <button onClick={() => toggleFactory(fid)} className="ml-1 hover:bg-muted rounded-full p-0.5" aria-label="Remove factory filter"><X className="h-3 w-3" /></button>
            </Badge>
          );
      });
      (params.factoryCode || []).forEach(code => {
          tags.push(
            <Badge key={`fc-${code}`} variant="secondary" className="gap-1 pl-2 pr-1 py-0.5">
               {code}
               <button onClick={() => setParams(prev => ({ ...prev, factoryCode: prev.factoryCode?.filter(c => c !== code) }))} className="ml-1 hover:bg-muted rounded-full p-0.5" aria-label="Remove factory code filter"><X className="h-3 w-3" /></button>
            </Badge>
          );
      });
      (params.status || []).forEach(s => {
          const label = STATUS_OPTIONS.find(o => o.value === s)?.label;
          tags.push(
            <Badge key={`s-${s}`} variant="secondary" className="gap-1 pl-2 pr-1 py-0.5">
               {label}
               <button onClick={() => toggleStatus(s)} className="ml-1 hover:bg-muted rounded-full p-0.5" aria-label={`Remove status filter ${label}`}><X className="h-3 w-3" /></button>
            </Badge>
          );
      });
      return tags;
  };


  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['equipments'] });
    await queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
    setSelectedIds([]); // Clear selection on refresh
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    
    // Using the same dialog for bulk delete
    setDeletingEquipment({ id: 'bulk', name: `${selectedIds.length} thiết bị`, code: 'BULK' } as any);
    setIsBulkDeleting(true);
  };


  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderTableContent = () => {
    if (isLoading) return <TableSkeleton rows={5} />;

    const equipments = data?.data || [];

    if (equipments.length === 0) {
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
                  onClick: clearFilters,
                  icon: <Filter className="h-4 w-4" />,
              }
          }
        />
      );
    }

    return (
      <>
        <ResponsiveTable<Equipment>
          columns={columns}
          data={equipments}
          keyExtractor={(eq) => eq.id}
          emptyMessage="Chưa có thiết bị nào"
          pageCount={data?.meta?.totalPages}
          currentPage={params.page}
          showPagination={true}
          onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          mobileCardAction={(item) => columns.find(c => c.key === 'actions')?.mobileRender?.(item)}
        />
        {previewDialog}
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

      {/* Bulk Actions */}
      <BulkActionsToolbar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onDelete={handleBulkDelete}
        isDeleting={bulkDeleteEquipment.isPending}
      />

      {/* Filters */}
      <MobileFilters
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Tìm thiết bị..."
        sections={filterSections}
        activeFiltersCount={activeFiltersCount}
        onClearAll={clearFilters}
        activeFilterTags={renderActiveTags()}
        desktopFilters={
          <EquipmentDesktopFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Tìm kiếm theo mã, tên, hãng, model..."
            filters={[
              {
                id: 'factory',
                component: (
                  <MultiSelectDropdown
                    label="Nhà máy"
                    icon={<Building2 className="h-4 w-4 opacity-70" />}
                    options={factoryOptions}
                    selected={params.factoryId || []}
                    onToggle={(val) => toggleFactory(val)}
                    searchable
                  />
                )
              },
              {
                id: 'status',
                label: 'Trạng thái',
                component: (
                  <ChipFilter
                    options={STATUS_OPTIONS}
                    selected={params.status || []}
                    onToggle={(val) => toggleStatus(val)}
                  />
                )
              }
            ]}
          />
        }
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
                         setSelectedIds([]);
                         setIsBulkDeleting(false);
                     }
                 });
             } else if (deletingEquipment) {
                 deleteEquipment.mutate(deletingEquipment.id, {
                     onSuccess: () => setDeletingEquipment(null)
                 });
             }
         }}
         isDeleting={isBulkDeleting ? bulkDeleteEquipment.isPending : deleteEquipment.isPending}
      />

    </PageContainer>
  );
}
