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
import { PageContainer } from '@/components/shared/PageContainer';

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
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h2 className="text-lg font-medium">Không tìm thấy thiết bị</h2>
          <p className="text-sm text-muted-foreground">Mã thiết bị "{code}" không tồn tại trong hệ thống.</p>
          <Button variant="outline" onClick={() => navigate('/equipments')} className="mt-4">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      <EquipmentHeader equipment={equipment} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={cn(
          "bg-secondary/50 p-1 mb-4 w-full justify-start overflow-x-auto",
          isMobile ? "grid grid-cols-3 h-auto" : "inline-flex w-auto"
        )}>
          <TabsTrigger
            value="info"
            className={cn(
              "gap-2 data-[state=active]:bg-card data-[state=active]:text-primary",
              isMobile && "text-xs py-2 flex-col h-auto gap-1"
            )}
          >
            <Tag className={cn("h-4 w-4", isMobile && "h-3.5 w-3.5")} />
            <span>Thông tin chung</span>
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className={cn(
              "gap-2 data-[state=active]:bg-card data-[state=active]:text-primary",
              isMobile && "text-xs py-2 flex-col h-auto gap-1"
            )}
          >
            <FileText className={cn("h-4 w-4", isMobile && "h-3.5 w-3.5")} />
            <span>Tài liệu</span>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className={cn(
              "gap-2 data-[state=active]:bg-card data-[state=active]:text-primary",
              isMobile && "text-xs py-2 flex-col h-auto gap-1"
            )}
          >
            <History className={cn("h-4 w-4", isMobile && "h-3.5 w-3.5")} />
            <span>Lịch sử</span>
          </TabsTrigger>
        </TabsList>

        {/* General Info Tab */}
        <TabsContent value="info" className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 mt-6">
          <EquipmentInfoCard equipment={equipment} />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 mt-6">
          <EquipmentDocumentsTab equipment={equipment} />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 mt-6">
          <EquipmentHistoryTabs equipmentId={equipment.id} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
