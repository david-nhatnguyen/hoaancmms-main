import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  History,
  Tag,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { equipmentsApi } from '@/api/endpoints/equipments.api';
import { EquipmentHistoryTabs } from '@/features/equipment/EquipmentHistoryTabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { EquipmentHeader } from '@/features/equipments/components/detail/EquipmentHeader';
import { EquipmentInfoCard } from '@/features/equipments/components/detail/EquipmentInfoCard';
import { EquipmentDocumentsTab } from '@/features/equipments/components/detail/EquipmentDocumentsTab';

export default function EquipmentDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const isMobile = useIsMobile();

  const { data: equipmentData, isLoading, error } = useQuery({
    queryKey: ['equipment', code],
    queryFn: () => equipmentsApi.getByCode(code!),
    enabled: !!code,
  });

  const equipment = equipmentData?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground animate-pulse">Đang tải dữ liệu thiết bị...</p>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className={cn("animate-fade-in", isMobile ? "px-4 py-3" : "p-6")}>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2">Không tìm thấy thiết bị</h2>
          <p className="text-sm text-muted-foreground mb-6">Mã thiết bị "{code}" không tồn tại trong hệ thống.</p>
          <Button variant="outline" onClick={() => navigate('/equipments')} className="border-border">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "animate-fade-in max-w-full overflow-x-hidden min-h-screen bg-background/50",
      isMobile ? "px-4 py-3" : "p-6"
    )}>

      <EquipmentHeader equipment={equipment} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={cn(
          "bg-secondary/50 p-1 mb-4",
          isMobile ? "w-full grid grid-cols-3 h-auto" : "mb-6"
        )}>
          <TabsTrigger
            value="info"
            className={cn(
              "gap-1.5 data-[state=active]:bg-card data-[state=active]:text-primary",
              isMobile && "text-xs py-2 flex-col h-auto [&>svg]:mb-0.5"
            )}
          >
            <Tag className={cn("h-4 w-4", isMobile && "h-3.5 w-3.5")} />
            <span className={isMobile ? "text-[11px] leading-tight" : ""}>Thông tin chung</span>
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className={cn(
              "gap-1.5 data-[state=active]:bg-card data-[state=active]:text-primary",
              isMobile && "text-xs py-2 flex-col h-auto [&>svg]:mb-0.5"
            )}
          >
            <FileText className={cn("h-4 w-4", isMobile && "h-3.5 w-3.5")} />
            <span className={isMobile ? "text-[11px] leading-tight" : ""}>Tài liệu</span>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className={cn(
              "gap-1.5 data-[state=active]:bg-card data-[state=active]:text-primary",
              isMobile && "text-xs py-2 flex-col h-auto [&>svg]:mb-0.5"
            )}
          >
            <History className={cn("h-4 w-4", isMobile && "h-3.5 w-3.5")} />
            <span className={isMobile ? "text-[11px] leading-tight" : ""}>Lịch sử</span>
          </TabsTrigger>
        </TabsList>

        {/* General Info Tab */}
        <TabsContent value="info" className="animate-fade-in mt-6">
          <EquipmentInfoCard equipment={equipment} />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="animate-fade-in mt-6">
          <EquipmentDocumentsTab equipment={equipment} />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="animate-fade-in mt-6">
          <EquipmentHistoryTabs equipmentId={equipment.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
