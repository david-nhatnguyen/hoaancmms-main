import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pencil,
  Layers,
  Maximize2,
  Image as ImageIcon,
  QrCode,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Equipment } from '@/api/types/equipment.types';
import { env } from '@/config/env';
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { QRPreviewDialog } from '@/features/equipments/components/QRPreviewDialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

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

  return (
    <>
      <PageHeader
        title={equipment.name}
        subtitle={equipment.code}
        icon={
          <button
            onClick={() => equipment.image && setIsPreviewOpen(true)}
            className={cn(
              "w-full h-full flex items-center justify-center overflow-hidden transition-all group relative",
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
              <ImageIcon className={cn("text-primary/40", isMobile ? "h-8 w-8" : "h-8 w-8")} />
            )}
          </button>
        }
        badges={
          <>
            <StatusBadge status={equipment.status} />
            <span className="hidden sm:inline text-border">|</span>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Layers className="h-4 w-4 shrink-0" />
              {equipment.category}
            </div>
          </>
        }
        actions={
          <>
            <Button variant="outline" onClick={() => setIsQROpen(true)} className="action-btn-secondary">
              <QrCode className="h-4 w-4 mr-2" />
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
          </>
        }
        onGoBack={() => navigate('/equipments')}
      />

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
