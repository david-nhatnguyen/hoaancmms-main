import { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Equipment } from '@/api/types/equipment.types';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2, X, Maximize2, QrCode as QrIcon, ImageIcon, MoreHorizontal } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { 
  Dialog, 
  DialogContent, 
  DialogClose 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { getImageUrl } from '@/lib/image-utils';
import { QRPreviewDialog } from '../components/QRPreviewDialog';
import { DataTableColumnHeader } from '@/components/shared/table/DataTableColumnHeader';

interface UseEquipmentColumnsProps {
  onEdit: (equipment: Equipment) => void;
  onDelete: (equipment: Equipment) => void;
  onViewDetails: (code: string) => void;
}


export interface UseEquipmentColumnsReturn {
  columns: (ColumnDef<Equipment> & {
    key: string;
    render: (item: Equipment) => React.ReactNode;
    mobilePriority?: 'primary' | 'secondary' | 'metadata';
    width?: string;
    align?: 'left' | 'center' | 'right';
  })[];
  previewDialog: React.ReactNode;
}

export function useEquipmentColumns({ onEdit, onDelete, onViewDetails }: UseEquipmentColumnsProps): UseEquipmentColumnsReturn {
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);
  const [qrPreviewEquipment, setQrPreviewEquipment] = useState<Equipment | null>(null);

  const columns = useMemo<UseEquipmentColumnsReturn['columns']>(() => [
    {
      id: "select",
      key: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      render: () => null, // Placeholder for select column
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "code",
      key: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mã số thiết bị" />
      ),
      cell: ({ row }) => {
        const eq = row.original
        return (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(eq.code);
            }}
            className="font-mono font-medium text-primary text-xs hover:underline text-left"
          >
            {eq.code}
          </button>
        )
      },
      render: (eq) => (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(eq.code);
          }}
          className="font-mono font-medium text-primary text-xs hover:underline text-left"
        >
          {eq.code}
        </button>
      ),
      mobilePriority: 'primary',
    },
    {
      id: "image",
      key: "image",
      header: "Hình ảnh",
      cell: ({ row }) => {
        const eq = row.original
        const fullUrl = getImageUrl(eq.image);
        return (
          <div className="flex items-center justify-center">
            {eq.image ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage({ url: fullUrl, name: eq.name });
                }}
                className="w-10 h-10 rounded-lg border border-border overflow-hidden shadow-sm bg-muted/30 group relative"
              >
                <img 
                  src={fullUrl} 
                  alt={eq.name} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="h-3 w-3 text-white" />
                </div>
              </button>
            ) : (
              <div className="w-10 h-10 rounded-lg border border-border bg-muted/50 flex items-center justify-center text-muted-foreground/30">
                <ImageIcon className="h-5 w-5" />
              </div>
            )}
          </div>
        );
      },
      render: (eq) => {
        const fullUrl = getImageUrl(eq.image);
        return (
            <div className="flex items-center justify-center">
            {eq.image ? (
                 <img 
                  src={fullUrl} 
                  alt={eq.name} 
                  className="w-10 h-10 object-cover rounded"
                />
            ) : (
                <ImageIcon className="h-5 w-5 text-muted-foreground/30" />
            )}
            </div>
        );
      }
    },
    {
      accessorKey: "name",
      key: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tên thiết bị" />
      ),
      cell: ({ row }) => <span className="font-medium text-sm">{row.getValue("name")}</span>,
      render: (eq) => <span className="font-medium text-sm">{eq.name}</span>,
      mobilePriority: 'secondary',
    },
    {
      accessorKey: "factoryName",
      key: "factoryName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nhà máy" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground truncate max-w-[150px]">
          {row.getValue("factoryName") || '-'}
        </span>
      ),
      render: (eq) => (
        <span className="text-sm text-muted-foreground truncate max-w-[150px]">
          {eq.factoryName || '-'}
        </span>
      ),
    },
    {
      accessorKey: "quantity",
      key: "quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Số lượng" />
      ),
      cell: ({ row }) => <span className="font-medium text-sm">{row.getValue("quantity") || 1}</span>,
      render: (eq) => <span className="font-medium text-sm">{eq.quantity || 1}</span>,
    },
    {
      accessorKey: "status",
      key: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trạng thái" />
      ),
      cell: ({ row }) => <div className="scale-90 origin-left"><StatusBadge status={row.getValue("status")} /></div>,
      render: (eq) => <StatusBadge status={eq.status} />,
    },
    {
      id: "qrCode",
      key: "qrCode",
      header: "QR Code",
      cell: ({ row }) => {
        const eq = row.original
        return (
          <div className="flex items-center justify-center">
            {eq.qrCode ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setQrPreviewEquipment(eq);
                }}
                className="w-8 h-8 p-1 rounded-md border border-border bg-white hover:border-primary/50 transition-colors shadow-sm group relative"
                title="Xem mã QR"
              >
                <img 
                  src={getImageUrl(eq.qrCode)} 
                  alt="QR" 
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-md border border-border border-dashed bg-muted/30 flex items-center justify-center text-muted-foreground/20">
                <QrIcon className="h-4 w-4" />
              </div>
            )}
          </div>
        )
      },
      render: (eq) => (
          <div className="flex items-center justify-center">
          {eq.qrCode ? (
               <img 
                src={getImageUrl(eq.qrCode)} 
                alt="QR" 
                className="w-8 h-8 object-contain"
              />
          ) : (
              <QrIcon className="h-4 w-4 text-muted-foreground/20" />
          )}
          </div>
      )
    },
    {
      id: "actions",
      key: "actions",
      cell: ({ row }) => {
        const eq = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewDetails(eq.code)}>
                <Eye className="mr-2 h-4 w-4" /> Chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(eq)}>
                <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(eq)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      render: () => null,
    },
  ], [onEdit, onViewDetails, onDelete]);

  const previewDialog = (
    <>
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent hideCloseButton className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
          <div className="relative group max-h-[85vh] max-w-full">
            <div className="absolute top-4 right-4 z-50">
              <DialogClose asChild>
                  <Button variant="secondary" size="icon" className="rounded-full h-8 w-8 bg-black/50 text-white hover:bg-black/70 border-none">
                    <X className="h-4 w-4" />
                  </Button>
              </DialogClose>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl">
              <img 
                src={previewImage?.url} 
                alt={previewImage?.name} 
                className="w-auto h-auto max-h-[80vh] object-contain mx-auto"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <QRPreviewDialog 
        isOpen={!!qrPreviewEquipment}
        onClose={() => setQrPreviewEquipment(null)}
        equipment={qrPreviewEquipment}
      />
    </>
  );

  return { columns, previewDialog };
}

