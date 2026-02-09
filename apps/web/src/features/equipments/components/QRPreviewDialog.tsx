import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { getImageUrl } from '@/lib/image-utils';
import { downloadFile } from '@/lib/download';
import { toast } from 'sonner';

interface QRPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: {
    code: string;
    name: string;
    qrCode?: string;
  } | null;
}

export function QRPreviewDialog({ isOpen, onClose, equipment }: QRPreviewDialogProps) {
  if (!equipment || !equipment.qrCode) return null;

  const fullUrl = getImageUrl(equipment.qrCode);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadFile(fullUrl, `QR_${equipment.code}.png`);
    toast.success(`Đang tải xuống mã QR cho ${equipment.code}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-card border-border shadow-2xl">
        <DialogHeader className="p-4 flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-bold">Mã QR Thiết bị</DialogTitle>
        </DialogHeader>
        <div className="p-2 flex flex-col items-center justify-center bg-white dark:bg-slate-900">
          {/* Main Image Container */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-primary/10 p-2 bg-white shadow-sm">
            <img 
              src={fullUrl} 
              alt={`QR ${equipment.code}`} 
              className="w-64 h-64 object-contain rendering-pixelated"
            />
          </div>

          <div className="mt-6 text-center space-y-1">
            <h3 className="font-bold text-xl">{equipment.name}</h3>
            <p className="font-mono text-sm text-primary bg-primary/10 px-3 py-1 rounded-full inline-block">
              {equipment.code}
            </p>
          </div>

          <p className="mt-4 text-xs text-muted-foreground italic">
            Quét mã để xem chi tiết thiết bị và lịch sử bảo trì.
          </p>
        </div>

        <div className="p-4 bg-muted/30">
          <Button onClick={handleDownload} className="w-full gap-2 font-semibold">
            <Download className="h-4 w-4" />
            Tải xuống hình ảnh
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
