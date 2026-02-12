import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Pencil, 
  Layers,
  Maximize2,
  Image as ImageIcon,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Equipment } from '@/api/types/equipment.types';
import { env } from '@/config/env';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { QRPreviewDialog } from '@/features/equipments/components/QRPreviewDialog';

const getImageUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/api/') ? path.replace('/api', '') : path;
    const baseUrl = env.API_URL.endsWith('/') ? env.API_URL.slice(0, -1) : env.API_URL;
    return `${baseUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
};

export const EquipmentHeader = ({ equipment }: { equipment: Equipment }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const fullImageUrl = equipment ? getImageUrl(equipment.image) : '';
  const qrCodeUrl = equipment ? getImageUrl(equipment.qrCode) : '';

  return (
    <>
      <Breadcrumbs 
        items={[
          { label: 'Thiết bị', href: '/equipments' },
          { label: 'Chi tiết thiết bị', active: true }
        ]}
      />
      {/* Back button - shown only on desktop */}
      {!isMobile && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/equipments')}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      )}

      <div className={cn("mb-6", isMobile && "mb-4")}>
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
                {/* Image / Icon */}
                <button 
                onClick={() => equipment.image && setIsPreviewOpen(true)}
                className={cn(
                    "rounded-xl border border-transparent bg-primary/20 overflow-hidden shrink-0 shadow-sm relative group transition-all hover:border-primary/50 flex items-center justify-center",
                    isMobile ? "h-16 w-16" : "h-20 w-20",
                    !equipment.image && "cursor-default"
                )}
                >
                {equipment.image ? (
                    <>
                    <img src={fullImageUrl} alt={equipment.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className={cn("text-white", isMobile ? "h-5 w-5" : "h-6 w-6")} />
                    </div>
                    </>
                ) : (
                    <ImageIcon className={cn("text-primary", isMobile ? "h-8 w-8" : "h-10 w-10")} />
                )}
                </button>

                {/* Title & Meta */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                        <h1 className={cn("font-bold leading-tight", isMobile ? "text-lg" : "text-2xl")}>
                            {equipment.name}
                        </h1>
                        <span className="font-mono text-sm text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                            {equipment.code}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <StatusBadge status={equipment.status} />
                        <span className="hidden sm:inline text-border">|</span>
                        <div className="flex items-center gap-1.5">
                            <Layers className="h-4 w-4 shrink-0" />
                            {equipment.category}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-end gap-2 shrink-0">
              <Button variant="outline" onClick={() => setIsQROpen(true)} className="action-btn-secondary">
                <QrCode className="h-4 w-4" />
                In QR
              </Button>
                <Button 
                    onClick={() => navigate(`/equipments/${equipment.code}/edit`)} 
                    className="action-btn-primary"
                    size={isMobile ? "sm" : "default"}
                >
                    <Pencil className="h-4 w-4 mr-2" />
                    <span className={isMobile ? "hidden" : "inline"}>Sửa thiết bị</span>
                    <span className={isMobile ? "inline" : "hidden"}>Sửa</span>
                </Button>
            </div>
        </div>
      </div>

      {/* Shared QR Code Dialog */}
      <QRPreviewDialog 
        isOpen={isQROpen} 
        onClose={() => setIsQROpen(false)} 
        equipment={equipment} 
      />

      {/* Image Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent hideCloseButton className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
          <div className="relative group max-h-[90vh] max-w-full">
            <div className="absolute top-4 right-4 z-50">
              <DialogClose asChild>
                <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 bg-black/50 text-white hover:bg-black/70 border-none backdrop-blur-sm">
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={fullImageUrl} 
                alt={equipment.name} 
                className="w-auto h-auto max-h-[80vh] object-contain mx-auto"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Simple Breadcrumbs component since the import in original file seemed to come from a shared component
// I'll import it instead of redefining
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { X } from 'lucide-react';
