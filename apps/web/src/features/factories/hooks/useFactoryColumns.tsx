import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, MapPin, Settings2, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/shared/table/DataTableColumnHeader';
import type { Factory } from '@/api/types/factory.types';

// ============================================================================
// TYPES
// ============================================================================

export interface UseFactoryColumnsOptions {
  onEdit?: (factory: Factory) => void;
  onViewEquipments?: (factoryCode: string) => void;
  onDelete?: (factory: Factory) => void;
}

export interface UseFactoryColumnsReturn {
  columns: (ColumnDef<Factory> & { 
    key: string; 
    render: (item: Factory) => React.ReactNode; 
    mobilePriority?: 'primary' | 'secondary' | 'metadata';
    width?: string;
    align?: 'left' | 'center' | 'right';
  })[];
}

// ============================================================================
// HOOK
// ============================================================================

// Default handler
const NOOP = () => {};

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
  const { onEdit, onViewEquipments, onDelete } = options;
  const navigate = useNavigate();

  // Default handlers
  const handleEdit = onEdit || NOOP;
  const handleDelete = onDelete || NOOP;
  
  // Create stable default view handler if one isn't provided
  // We cannot use useMemo effectively here because we can't conditionally call hooks.
  // But we can depend on "navigate".
  // Best approach: Define the default logic inside the actions render or memoize properly.
  // However, simplest fix for Lint is to make the dependency stable.
  
  const handleViewEquipments = useMemo(() => {
    return onViewEquipments || ((code: string) => {
       navigate(`/equipments?factoryCode=${code}`);
    });
  }, [onViewEquipments, navigate]);

  // ============================================================================
  // COLUMN DEFINITIONS
  // ============================================================================

  const columns = useMemo<UseFactoryColumnsReturn['columns']>(() => [
    // Code Column
    {
      accessorKey: 'code',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mã nhà máy" />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-medium text-primary">
          {row.original.code}
        </span>
      ),
      // For ResponsiveTable
      key: 'code',
      render: (factory) => (
        <span className="font-mono font-medium text-primary">
          {factory.code}
        </span>
      ),
      mobilePriority: 'primary',
      width: 'w-[120px]',
    },

    // Name Column
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tên nhà máy" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
      // For ResponsiveTable
      key: 'name',
      render: (factory) => (
        <span className="font-medium">{factory.name}</span>
      ),
      mobilePriority: 'secondary',
    },

    // Location Column
    {
      accessorKey: 'location',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Địa điểm" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {row.original.location || '-'}
        </div>
      ),
      // For ResponsiveTable
      key: 'location',
      render: (factory) => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {factory.location || '-'}
        </div>
      ),
    },

    // Equipment Count Column
    {
      accessorKey: 'equipmentCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Số lượng TB" />
      ),
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Settings2 className="h-4 w-4" />
          {row.original.equipmentCount}
        </span>
      ),
      // For ResponsiveTable
      key: 'equipmentCount',
      render: (factory) => (
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Settings2 className="h-4 w-4" />
          {factory.equipmentCount}
        </span>
      ),
      align: 'center',
    },

    // Status Column
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trạng thái" />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      // For ResponsiveTable
      key: 'status',
      render: (factory) => <StatusBadge status={factory.status} />,
      align: 'center',
    },

    // Actions Column
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const factory = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewEquipments(factory.code);
                }}
                className="text-muted-foreground h-8 px-2 rounded-full"
              >
                <span className="text-xs font-medium mr-1.5">Xem thiết bị</span>
                <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(factory);
              }}
              className="h-8 w-8 hover:bg-orange-500/10 hover:text-orange-500 rounded-full transition-colors"
              title="Sửa"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(factory);
              }}
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
              title="Xóa"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      // For ResponsiveTable
      key: 'actions',
      render: (factory) => (
        <div className="flex items-center justify-center gap-2">
          {/* Using same structure as cell for desktop view in ResponsiveTable */}
          <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewEquipments(factory.code);
              }}
              className="text-muted-foreground h-8 px-2 rounded-full"
            >
              <span className="text-xs font-medium mr-1.5">Xem thiết bị</span>
              <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          {/* ... mobile rendering is usually handled separately by mobileRender or in the page */}
        </div>
      ),
      align: 'center',
    },
  ], [handleEdit, handleViewEquipments, handleDelete]);

  return { columns };
}
