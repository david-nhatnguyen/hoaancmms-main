import { useState, useMemo } from 'react';
import { Column } from '@/components/shared/ResponsiveTable';
import { Equipment } from '@/api/types/equipment.types';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2, Cpu, X, Maximize2, QrCode as QrIcon, ImageIcon } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { 
  Dialog, 
  DialogContent, 
  DialogClose 
} from "@/components/ui/dialog";
import { getImageUrl } from '@/lib/image-utils';
import { QRPreviewDialog } from '../components/QRPreviewDialog';
import { MobileCardActions } from '@/components/shared/table/MobileCardActions';

interface UseEquipmentColumnsProps {
  onEdit: (equipment: Equipment) => void;
  onDelete: (equipment: Equipment) => void;
  onViewDetails: (code: string) => void;
}

export function useEquipmentColumns({ onEdit, onDelete, onViewDetails }: UseEquipmentColumnsProps) {
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);
  const [qrPreviewEquipment, setQrPreviewEquipment] = useState<Equipment | null>(null);

  const columns = useMemo<Column<Equipment>[]>(() => [
    {
      key: 'code',
      header: 'Mã số thiết bị',
      width: 'w-[150px]',
      mobilePriority: 'primary',
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
      )
    },
    {
      key: 'image',
      header: 'Hình ảnh',
      width: 'w-[120px]',
      align: 'center',
      render: (eq) => {
        const fullUrl = getImageUrl(eq.image);
        return (
          <div className="flex items-center justify-center">
            {eq.image ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage({ url: fullUrl, name: eq.name });
                }}
                className="w-12 h-12 rounded-lg border border-border overflow-hidden shadow-sm bg-muted/30 group relative"
              >
                <img 
                  src={fullUrl} 
                  alt={eq.name} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = ''; 
                  }}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="h-4 w-4 text-white" />
                </div>
              </button>
            ) : (
              <div className="w-12 h-12 rounded-lg border border-border bg-muted/50 flex items-center justify-center text-muted-foreground/30">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
          </div>
        );
      },
      mobileRender: (eq) => {
        const fullUrl = getImageUrl(eq.image);
        return (
          <div className="w-full h-full">
            {eq.image ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage({ url: fullUrl, name: eq.name });
                }}
                className="w-full h-full active:outline-none focus:outline-none"
              >
                <img 
                  src={fullUrl} 
                  alt={eq.name} 
                  className="w-full h-full object-cover" 
                />
              </button>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                <Cpu className="h-12 w-12" />
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'name',
      header: 'Tên thiết bị',
      mobilePriority: 'secondary',
      width: 'min-w-[150px]',
      render: (eq) => <span className="font-medium text-sm">{eq.name}</span>
    },
    {
      key: 'factory',
      header: 'Nhà máy',
      mobilePriority: 'metadata',
      mobileLabel: 'Nhà máy',
      width: 'w-[150px]',
      render: (eq) => (
        <span 
          className="text-sm text-muted-foreground truncate max-w-[150px]" 
          title={eq.factoryName}
        >
          {eq.factoryName || '-'}
        </span>
      )
    },
    {
      key: 'quantity',
      header: 'Số lượng',
      mobilePriority: 'metadata',
      mobileLabel: 'SL',
      align: 'center',
      width: 'w-[80px]',
      render: (eq) => <span className="font-medium text-sm">{eq.quantity || 1}</span>
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      width: 'w-[120px]',
      render: (eq) => <div className="scale-90 origin-center"><StatusBadge status={eq.status} /></div>
    },
    {
      key: 'qrCode',
      header: 'QR Code',
      align: 'center',
      width: 'w-[80px]',
      render: (eq) => (
        <div className="flex items-center justify-center">
          {eq.qrCode ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setQrPreviewEquipment(eq);
              }}
              className="w-10 h-10 p-1 rounded-md border border-border bg-white hover:border-primary/50 transition-colors shadow-sm group relative"
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
            <div className="w-10 h-10 rounded-md border border-border border-dashed bg-muted/30 flex items-center justify-center text-muted-foreground/20">
              <QrIcon className="h-5 w-5" />
            </div>
          )}
        </div>
      ),
      mobileRender: (eq) => (
        <div className="w-full h-full flex items-center justify-center">
          {eq.qrCode ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setQrPreviewEquipment(eq);
              }}
              className="w-full h-full active:scale-95 transition-transform"
            >
              <img 
                src={getImageUrl(eq.qrCode)} 
                alt="QR" 
                className="w-full h-full object-contain"
              />
            </button>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
              <QrIcon className="h-12 w-12" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'center',
      width: 'w-[140px]',
      render: (eq) => (
        <div className="flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewDetails(eq.code)}
            className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
            title="Xem chi tiết"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(eq)}
            className="h-8 w-8 text-muted-foreground hover:bg-orange-500/10 hover:text-orange-500 rounded-full transition-colors"
            title="Chỉnh sửa"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(eq)}
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
            title="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      mobileRender: (eq) => (
        <MobileCardActions 
          onView={() => onViewDetails(eq.code)}
          onEdit={() => onEdit(eq)}
          onDelete={() => onDelete(eq)}
        />
      )
    }
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
