import React, { useState } from 'react';
import { Pencil, Cpu, QrCode, Image as ImageIcon, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Equipment } from '@/api/types/equipment.types';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { QRPreviewDialog } from '@/features/equipments/components/QRPreviewDialog';
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { env } from '@/config/env';

interface EquipmentDetailHeaderProps {
    equipment: Equipment;
    onGoBack: () => void;
    onEdit: () => void;
}

const getImageUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/api/') ? path.replace('/api', '') : path;
    const baseUrl = env.API_URL.endsWith('/') ? env.API_URL.slice(0, -1) : env.API_URL;
    return `${baseUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
};

/**
 * EquipmentDetailHeader component
 * Follows the pattern of ChecklistDetailHeader with Atomic Design and Premium UI
 */
export const EquipmentDetailHeader: React.FC<EquipmentDetailHeaderProps> = ({
    equipment,
    onGoBack,
    onEdit,
}) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isQROpen, setIsQROpen] = useState(false);
    const fullImageUrl = getImageUrl(equipment.image);

    return (
        <>
            <PageHeader
                title={equipment.name}
                subtitle="Chi tiết thiết bị"
                onGoBack={onGoBack}
                icon={
                    <div className="relative">
                        <button
                            onClick={() => equipment.image && setIsPreviewOpen(true)}
                            className={cn(
                                "rounded-2xl border-2 border-primary/20 bg-primary/10 overflow-hidden shrink-0 relative group transition-all duration-500 hover:border-primary/50 flex items-center justify-center p-0 h-12 w-12 sm:h-14 sm:w-14 active:scale-95",
                                !equipment.image && "cursor-default"
                            )}
                        >
                            {equipment.image ? (
                                <>
                                    <img src={fullImageUrl} alt={equipment.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px]">
                                        <Maximize2 className="text-white h-5 w-5 animate-in zoom-in-50 duration-300" />
                                    </div>
                                </>
                            ) : (
                                <Cpu className="h-7 w-7 text-primary/40 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
                            )}
                        </button>
                    </div>
                }
                badges={
                    <div className="flex items-center gap-2.5 flex-wrap animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
                        <span className="font-mono text-[10px] font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20 tracking-wider">
                            {equipment.code}
                        </span>
                        <StatusBadge status={equipment.status} className="text-[10px] h-7 px-3.5 font-bold tracking-wider rounded-full border-0 shadow-none" />
                        <span className="text-[10px] font-bold text-muted-foreground/60 bg-muted/40 px-3.5 py-1.5 rounded-full border border-border/40 tracking-wider">
                            {equipment.category}
                        </span>
                        {equipment.factoryName && (
                            <span className="text-[10px] font-bold bg-secondary/40 text-secondary-foreground/70 px-3.5 py-1.5 rounded-full border border-border/40 tracking-wider">
                                {equipment.factoryName}
                            </span>
                        )}
                    </div>
                }
                actions={
                    <div className="flex items-center gap-3 w-full sm:w-auto mt-6 sm:mt-0 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
                        <Button
                            variant="outline"
                            onClick={() => setIsQROpen(true)}
                            className="flex-1 sm:flex-none gap-2.5 h-11 rounded-2xl px-6 border-border/60 font-bold text-[11px] tracking-widest hover:bg-muted/50 hover:border-primary/20 transition-all active:scale-95 shadow-none"
                        >
                            <QrCode className="h-4 w-4 text-primary/60" />
                            <span className="hidden sm:inline">In mã QR</span>
                            <span className="sm:hidden">Mã QR</span>
                        </Button>
                        <Button
                            onClick={onEdit}
                            className="flex-1 sm:flex-none gap-2.5 h-11 min-w-[140px] rounded-2xl px-6 font-bold text-[11px] tracking-widest hover:scale-[1.03] active:scale-[0.97] transition-all bg-primary text-white shadow-none"
                        >
                            <Pencil className="h-4 w-4" />
                            <span>Chỉnh sửa hồ sơ</span>
                        </Button>
                    </div>
                }
            />

            {/* QR Preview Dialog */}
            <QRPreviewDialog
                isOpen={isQROpen}
                onClose={() => setIsQROpen(false)}
                equipment={equipment}
            />

            {/* Image Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
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
