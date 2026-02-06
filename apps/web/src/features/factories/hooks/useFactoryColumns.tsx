import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Eye, MapPin, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Column } from '@/components/shared/ResponsiveTable';
import type { Factory } from '@/api/types/factory.types';

// ============================================================================
// TYPES
// ============================================================================

export interface UseFactoryColumnsOptions {
  onEdit?: (factory: Factory) => void;
  onViewEquipments?: (factoryId: string) => void;
}

export interface UseFactoryColumnsReturn {
  columns: Column<Factory>[];
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook for factory table column definitions
 * 
 * @param options - Callbacks for column actions
 * @returns Table column configuration
 * 
 * @example
 * ```tsx
 * const { columns } = useFactoryColumns({
 *   onEdit: (factory) => openEditDialog(factory),
 *   onViewEquipments: (id) => navigate(`/equipments?factory=${id}`)
 * });
 * 
 * <ResponsiveTable columns={columns} data={factories} />
 * ```
 */
export function useFactoryColumns(
  options: UseFactoryColumnsOptions = {}
): UseFactoryColumnsReturn {
  const { onEdit, onViewEquipments } = options;
  const navigate = useNavigate();

  // Default handlers
  const handleEdit = onEdit || (() => {});
  const handleViewEquipments = onViewEquipments || ((id: string) => {
    navigate(`/equipments?factory=${id}`);
  });

  // ============================================================================
  // COLUMN DEFINITIONS
  // ============================================================================

  const columns = useMemo<Column<Factory>[]>(() => [
    // Code Column
    {
      key: 'code',
      header: 'Mã nhà máy',
      isPrimary: true,
      width: 'w-[120px]',
      render: (factory) => (
        <span className="font-mono font-medium text-primary">
          {factory.code}
        </span>
      ),
    },

    // Name Column
    {
      key: 'name',
      header: 'Tên nhà máy',
      isSecondary: true,
      render: (factory) => (
        <span className="font-medium">{factory.name}</span>
      ),
    },

    // Location Column
    {
      key: 'location',
      header: 'Địa điểm',
      render: (factory) => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {factory.location || '-'}
        </div>
      ),
      mobileRender: (factory) => factory.location || '-',
    },

    // Equipment Count Column
    {
      key: 'equipmentCount',
      header: 'Số lượng TB',
      align: 'center',
      render: (factory) => (
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Settings2 className="h-4 w-4" />
          {factory.equipmentCount}
        </span>
      ),
      mobileRender: (factory) => factory.equipmentCount,
    },

    // Status Column
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (factory) => <StatusBadge status={factory.status} />,
      mobileRender: (factory) => <StatusBadge status={factory.status} />,
    },

    // Actions Column
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (factory) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewEquipments(factory.id)}
            className="h-8 px-2"
          >
            <Eye className="h-4 w-4" />
            <span className="ml-1.5 hidden sm:inline">Xem TB</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(factory)}
            className="h-8 px-2"
          >
            <Pencil className="h-4 w-4" />
            <span className="ml-1.5 hidden sm:inline">Sửa</span>
          </Button>
        </div>
      ),
      mobileRender: (factory) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewEquipments(factory.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Xem TB
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(factory)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Sửa
          </Button>
        </div>
      ),
    },
  ], [handleEdit, handleViewEquipments]);

  return { columns };
}
