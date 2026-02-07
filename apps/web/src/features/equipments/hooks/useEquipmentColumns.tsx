import { Column } from '@/components/shared/ResponsiveTable';
import { Equipment } from '@/api/types/equipment.types';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface UseEquipmentColumnsProps {
  onEdit: (equipment: Equipment) => void;
  onDelete: (equipment: Equipment) => void;
  onViewDetails: (id: string) => void;
}

export function useEquipmentColumns({ onEdit, onDelete, onViewDetails }: UseEquipmentColumnsProps) {
  
  // High density columns for Mold Manufacturing Equipment
  // High density columns for Mold Manufacturing Equipment
  const columns: Column<Equipment>[] = [
    {
      key: 'code',
      header: 'Mã số thiết bị',
      width: 'w-[150px]',
      isPrimary: true,
      render: (eq) => <span className="font-mono font-medium text-primary text-xs">{eq.code}</span>
    },
    {
      key: 'name',
      header: 'Tên thiết bị',
      isSecondary: true,
      width: 'min-w-[150px]',
      render: (eq) => <span className="font-medium text-sm">{eq.name}</span>
    },
    {
      key: 'factory',
      header: 'Nhà máy',
      showOnMobile: false,
      width: 'w-[150px]', // Increased width for better visibility
      render: (eq) => <span className="text-sm text-muted-foreground truncate max-w-[150px]" title={eq.factoryName}>{eq.factoryName || '-'}</span>
    },
    {
      key: 'quantity',
      header: 'Số lượng',
      align: 'center',
      width: 'w-[100px]',
      render: (eq) => <span className="font-medium text-sm">{eq.quantity || 1}</span>
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      width: 'w-[130px]',
      render: (eq) => <div className="scale-90 origin-center"><StatusBadge status={eq.status} /></div>
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      width: 'w-[110px]',
      render: (eq) => (
        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewDetails(eq.id)}
            className="h-8 w-8 text-muted-foreground hover:text-primary"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(eq)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(eq)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      mobileRender: (eq) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(eq.id);
            }}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Xem
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(eq);
            }}
            className="flex-1"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Sửa
          </Button>
           <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(eq);
            }}
            className="flex-1 border-destructive text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Xóa
          </Button>
        </div>
      )
    }
  ];

  return { columns };
}
