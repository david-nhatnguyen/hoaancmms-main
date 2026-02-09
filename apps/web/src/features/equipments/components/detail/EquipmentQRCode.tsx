import { QrCode, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Equipment } from '@/api/types/equipment.types';
import { env } from '@/config/env';
import { toast } from 'sonner';

// Reusing helper logic or importing it
const getImageUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/api/') ? path.replace('/api', '') : path;
    const baseUrl = env.API_URL.endsWith('/') ? env.API_URL.slice(0, -1) : env.API_URL;
    return `${baseUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
};

export const EquipmentQRCode = ({ equipment }: { equipment: Equipment }) => {
  const handleDownloadQR = () => {
    if (equipment?.qrCode) {
      const url = getImageUrl(equipment.qrCode);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_${equipment.code}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Đang tải xuống mã QR...');
    } else {
      toast.error('Không tìm thấy mã QR cho thiết bị này.');
    }
  };

  if (!equipment.qrCode) return null; 

  return (
    <Card className="bg-card border-border/50 shadow-sm overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-3 bg-secondary/20 border-b border-border/50 shrink-0">
        <CardTitle className="text-base flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Mã QR Định danh
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center justify-center text-center grow">
        <div className="bg-white p-3 rounded-xl border shadow-sm mb-4 transition-transform hover:scale-105">
            <img 
                src={getImageUrl(equipment.qrCode)} 
                alt="QR Code" 
                className="w-32 h-32 object-contain"
            />
        </div>
        <p className="text-sm font-medium mb-1 line-clamp-1 max-w-full" title={equipment.name}>{equipment.name}</p>
        <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground mb-4 block">{equipment.code}</code>
        
        <Button variant="outline" size="sm" onClick={handleDownloadQR} className="w-full mt-auto">
            <Download className="h-4 w-4 mr-2" />
            Tải xuống QR
        </Button>
      </CardContent>
    </Card>
  );
};
