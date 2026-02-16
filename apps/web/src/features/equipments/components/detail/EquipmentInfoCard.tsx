import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Package,
  Calendar,
  Wrench,
  Cpu,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Equipment } from '@/api/types/equipment.types';

interface EquipmentInfoCardProps {
  equipment: Equipment;
}

export const EquipmentInfoCard = ({ equipment }: EquipmentInfoCardProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const InfoRow = ({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ElementType }) => (
    <div className={cn(
      "flex py-2.5 border-b border-border/50 last:border-0",
      isMobile ? "flex-col gap-0.5" : "items-center"
    )}>
      <div className={cn(
        "flex items-center gap-2 text-muted-foreground",
        isMobile ? "text-xs" : "w-1/3 text-sm"
      )}>
        {Icon && <Icon className="h-4 w-4 shrink-0 opacity-70" />}
        {label}
      </div>
      <div className={cn(
        "font-medium",
        isMobile ? "text-sm pl-6" : "w-2/3 text-sm"
      )}>{value || '—'}</div>
    </div>
  );

  return (
    <div className={cn(
      "grid gap-4 animate-fade-in",
      isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2 lg:gap-6"
    )}>
      {/* General Info */}
      <Card className="bg-card border-border/50 shadow-sm transition-all hover:shadow-md">
        <CardHeader className={cn("pb-2", isMobile && "p-3 pb-2")}>
          <CardTitle className={cn(
            "flex items-center gap-2",
            isMobile ? "text-sm" : "text-base"
          )}>
            <div className="p-1.5 rounded-md bg-transparent text-primary p-0">
              <Wrench className={cn("text-primary", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
            </div>
            Thông tin thiết bị
          </CardTitle>
        </CardHeader>
        <CardContent className={cn("pt-2", isMobile ? "p-3 pt-0" : "p-6 pt-2")}>
          <InfoRow
            label="Tên thiết bị"
            value={equipment.name}
          />
          <InfoRow
            label="Mã thiết bị"
            value={<code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{equipment.code}</code>}
          />
          <InfoRow
            label="Loại thiết bị"
            value={equipment.category}
          />
          <InfoRow
            label="Nhà máy"
            value={(equipment.factory?.name || equipment.factoryName) ? (
              <button
                onClick={() => navigate(`/equipments?factory=${equipment.factory?.id || equipment.factoryId}`)}
                className="text-primary hover:underline font-medium flex items-center gap-1.5 transition-colors hover:text-primary/80"
              >
                {equipment.factory?.name || equipment.factoryName}
              </button>
            ) : '-'}
            icon={Building2}
          />
          <InfoRow
            label="Số lượng"
            value={equipment.quantity}
            icon={Package}
          />
        </CardContent>
      </Card>

      {/* Technical Info */}
      <Card className="bg-card border-border/50 shadow-sm transition-all hover:shadow-md">
        <CardHeader className={cn("pb-2", isMobile && "p-3 pb-2")}>
          <CardTitle className={cn(
            "flex items-center gap-2",
            isMobile ? "text-sm" : "text-base"
          )}>
            <div className="p-1.5 rounded-md bg-transparent text-primary p-0">
              <Cpu className={cn("text-primary", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
            </div>
            Thông tin kỹ thuật
          </CardTitle>
        </CardHeader>
        <CardContent className={cn("pt-2", isMobile ? "p-3 pt-0" : "p-6 pt-2")}>
          <InfoRow
            label="Thương hiệu"
            value={equipment.brand}
          />
          <InfoRow
            label="Xuất xứ"
            value={equipment.origin}
          />
          <InfoRow
            label="Năm sản xuất"
            value={equipment.modelYear}
            icon={Calendar}
          />
          <InfoRow
            label="Kích thước"
            value={equipment.dimension}
          />
        </CardContent>
      </Card>

      {/* Notes (Full Width) */}
      {equipment.notes && (
        <Card className="bg-card border-border/50 shadow-sm lg:col-span-2">
          <CardHeader className={cn("pb-3", isMobile && "p-4")}>
            <CardTitle className={cn("flex items-center gap-2", isMobile ? "text-sm" : "text-base")}>
              <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-500">
                <Info className="h-4 w-4" />
              </div>
              Ghi chú
            </CardTitle>
          </CardHeader>
          <CardContent className={cn("pt-4", isMobile ? "p-4" : "p-6")}>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{equipment.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
