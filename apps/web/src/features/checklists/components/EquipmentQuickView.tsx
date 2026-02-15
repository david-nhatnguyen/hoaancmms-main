import React from 'react';
import { Building2, Layers, Image as ImageIcon } from 'lucide-react';
import { Equipment } from '../types/checklist.types';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { env } from '@/config/env';

interface EquipmentQuickViewProps {
  equipment: Equipment;
  isCompact?: boolean;
  showImage?: boolean;
}

const getImageUrl = (path?: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/api/') ? path.replace('/api', '') : path;
  const baseUrl = env.API_URL.endsWith('/') ? env.API_URL.slice(0, -1) : env.API_URL;
  return `${baseUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
};

export const EquipmentQuickView: React.FC<EquipmentQuickViewProps> = ({
  equipment,
  isCompact = false,
  showImage = true,
}) => {
  return (
    <div className={cn("flex items-start gap-4 flex-1 min-w-0", isCompact && "gap-3")}>
      {/* Image / Icon Section */}
      {showImage && (
        <div className={cn(
          "rounded-lg border border-border/50 bg-muted overflow-hidden shrink-0 shadow-sm flex items-center justify-center transition-all",
          isCompact ? "h-14 w-14" : "h-24 w-24"
        )}>
          {equipment.image ? (
            <img 
              src={getImageUrl(equipment.image)} 
              alt={equipment.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <ImageIcon className={cn("text-muted-foreground/30", isCompact ? "h-6 w-6" : "h-10 w-10")} />
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col gap-1">
        {/* Row 1: Name */}
        <h4 className={cn(
          "font-bold leading-tight text-foreground truncate",
          isCompact ? "text-sm" : "text-base"
        )}>
          {equipment.name}
        </h4>

        {/* Row 2: Code & Status */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-primary bg-primary/10 px-1 py-0.5 rounded border border-primary/20 shrink-0">
            {equipment.code}
          </span>
        </div>

        {/* Row 3: Status */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
          <StatusBadge status={equipment.status as any} className={cn("shrink-0", isCompact ? "h-4 py-0 px-1.5 text-[10px]" : "h-5 py-0.5 px-2 text-[10px]")} />
        </div>

        {/* Row 4: Category */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
          <Layers className={cn("shrink-0 opacity-70", isCompact ? "h-3 w-3" : "h-3.5 w-3.5")} />
          <span className="truncate">{equipment.category}</span>
        </div>

        {/* Row 5: Factory */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
          <Building2 className={cn("shrink-0 opacity-70", isCompact ? "h-3 w-3" : "h-3.5 w-3.5")} />
          <span className="truncate">{equipment.factoryName || equipment.factory?.name || '—'}</span>
        </div>
      </div>
    </div>
  );
};
