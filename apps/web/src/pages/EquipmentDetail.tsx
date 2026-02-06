import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Pencil, 
  QrCode, 
  FileText, 
  Image, 
  History,
  Calendar,
  Building2,
  Tag,
  Wrench,
  AlertCircle,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityIndicator } from '@/components/shared/PriorityIndicator';
import { equipments, EQUIPMENT_GROUPS } from '@/data/mockData';
import { toast } from 'sonner';
import { EquipmentHistoryTabs } from '@/features/equipment/EquipmentHistoryTabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const isMobile = useIsMobile();

  const equipment = equipments.find(eq => eq.id === id);

  if (!equipment) {
    return (
      <div className={cn("animate-fade-in", isMobile ? "px-4 py-3" : "p-6")}>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2">Không tìm thấy thiết bị</h2>
          <Button variant="outline" onClick={() => navigate('/equipments')} className="border-border">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const handlePrintQR = () => {
    toast.success('Đang tạo mã QR...');
  };

  // Mobile info row component
  const InfoRow = ({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ElementType }) => (
    <div className={cn(
      "flex py-2.5 border-b border-border/50 last:border-0",
      isMobile ? "flex-col gap-0.5" : "items-start"
    )}>
      <div className={cn(
        "flex items-center gap-1.5 text-muted-foreground",
        isMobile ? "text-xs" : "w-1/3 text-sm"
      )}>
        {Icon && <Icon className={cn("shrink-0", isMobile ? "h-3 w-3" : "h-4 w-4")} />}
        {label}
      </div>
      <div className={cn(
        "font-medium",
        isMobile ? "text-sm" : "w-2/3 text-sm"
      )}>{value || '—'}</div>
    </div>
  );

  return (
    <div className={cn(
      "animate-fade-in max-w-full overflow-x-hidden",
      isMobile ? "px-4 py-3" : "p-6"
    )}>
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

      {/* Header - Mobile optimized */}
      <div className={cn("mb-4", !isMobile && "mb-6")}>
        {isMobile ? (
          // Mobile header layout
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Cpu className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold leading-tight mb-1">{equipment.name}</h1>
                <span className="font-mono text-xs text-primary bg-primary/20 px-2 py-0.5 rounded-md inline-block">
                  {equipment.code}
                </span>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button variant="outline" size="sm" onClick={handlePrintQR} className="h-8 px-2">
                  <QrCode className="h-4 w-4" />
                  <span className="text-xs ml-1">In QR</span>
                </Button>
                <Button size="sm" onClick={() => navigate(`/equipments/${id}/edit`)} className="h-8 w-8 p-0">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={equipment.status} />
              <PriorityIndicator priority={equipment.priority} />
            </div>
          </div>
        ) : (
          // Desktop header layout
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Cpu className="h-7 w-7 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{equipment.name}</h1>
                  <span className="font-mono text-sm text-primary bg-primary/20 px-2.5 py-1 rounded-lg">
                    {equipment.code}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={equipment.status} />
                  <PriorityIndicator priority={equipment.priority} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handlePrintQR} className="action-btn-secondary">
                <QrCode className="h-4 w-4" />
                In QR
              </Button>
              <Button onClick={() => navigate(`/equipments/${id}/edit`)} className="action-btn-primary">
                <Pencil className="h-4 w-4" />
                Sửa
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
        <TabsContent value="info" className={cn("animate-fade-in", isMobile ? "space-y-3" : "space-y-6")}>
          <div className={cn(
            "grid gap-3",
            isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2 gap-6"
          )}>
            <Card className="bg-card border-border/50 overflow-hidden">
              <CardHeader className={cn("pb-2", isMobile && "p-3 pb-2")}>
                <CardTitle className={cn(
                  "flex items-center gap-2",
                  isMobile ? "text-sm" : "text-base"
                )}>
                  <Wrench className={cn("text-primary", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                  Thông tin thiết bị
                </CardTitle>
              </CardHeader>
              <CardContent className={isMobile ? "p-3 pt-0" : ""}>
                <InfoRow 
                  label="Nhóm thiết bị" 
                  value={EQUIPMENT_GROUPS[equipment.groupId]?.name}
                />
                <InfoRow 
                  label="Loại máy" 
                  value={equipment.machineType}
                />
                <InfoRow 
                  label="Nhà máy" 
                  value={equipment.factoryName}
                  icon={Building2}
                />
                <InfoRow 
                  label="Bộ phận sử dụng" 
                  value={equipment.department}
                />
                <InfoRow 
                  label="Mức độ quan trọng" 
                  value={<PriorityIndicator priority={equipment.priority} />}
                  icon={CheckCircle2}
                />
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 overflow-hidden">
              <CardHeader className={cn("pb-2", isMobile && "p-3 pb-2")}>
                <CardTitle className={cn(
                  "flex items-center gap-2",
                  isMobile ? "text-sm" : "text-base"
                )}>
                  <Cpu className={cn("text-primary", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                  Thông tin kỹ thuật
                </CardTitle>
              </CardHeader>
              <CardContent className={isMobile ? "p-3 pt-0" : ""}>
                <InfoRow 
                  label="Hãng sản xuất" 
                  value={equipment.manufacturer}
                />
                <InfoRow 
                  label="Model" 
                  value={equipment.model}
                />
                <InfoRow 
                  label="Serial Number" 
                  value={<span className="font-mono text-primary text-xs">{equipment.serialNumber}</span>}
                />
                <InfoRow 
                  label="Năm sử dụng" 
                  value={equipment.yearInService}
                  icon={Calendar}
                />
              </CardContent>
            </Card>
          </div>

          {equipment.notes && (
            <Card className="bg-card border-border/50 overflow-hidden">
              <CardHeader className={cn("pb-2", isMobile && "p-3 pb-2")}>
                <CardTitle className={isMobile ? "text-sm" : "text-base"}>Ghi chú</CardTitle>
              </CardHeader>
              <CardContent className={isMobile ? "p-3 pt-0" : ""}>
                <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>{equipment.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="animate-fade-in">
          <Card className="bg-card border-border/50 overflow-hidden">
            <CardHeader className={cn("pb-2", isMobile && "p-3 pb-2")}>
              <CardTitle className={isMobile ? "text-sm" : "text-base"}>Tài liệu thiết bị</CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? "p-3 pt-0" : ""}>
              <div className={cn(
                "grid gap-3",
                isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3 gap-4"
              )}>
                <div className={cn(
                  "border border-dashed border-border rounded-xl text-center hover:border-primary/50 transition-colors cursor-pointer",
                  isMobile ? "p-4 flex items-center gap-3" : "p-6"
                )}>
                  <FileText className={cn(
                    "text-muted-foreground",
                    isMobile ? "h-6 w-6 shrink-0" : "h-8 w-8 mx-auto mb-2"
                  )} />
                  <div className={isMobile ? "text-left" : ""}>
                    <p className={cn("font-medium", isMobile && "text-sm")}>Manual</p>
                    <p className="text-xs text-muted-foreground">Chưa có tài liệu</p>
                  </div>
                </div>
                <div className={cn(
                  "border border-dashed border-border rounded-xl text-center hover:border-primary/50 transition-colors cursor-pointer",
                  isMobile ? "p-4 flex items-center gap-3" : "p-6"
                )}>
                  <FileText className={cn(
                    "text-muted-foreground",
                    isMobile ? "h-6 w-6 shrink-0" : "h-8 w-8 mx-auto mb-2"
                  )} />
                  <div className={isMobile ? "text-left" : ""}>
                    <p className={cn("font-medium", isMobile && "text-sm")}>Hướng dẫn vận hành</p>
                    <p className="text-xs text-muted-foreground">Chưa có tài liệu</p>
                  </div>
                </div>
                <div className={cn(
                  "border border-dashed border-border rounded-xl text-center hover:border-primary/50 transition-colors cursor-pointer",
                  isMobile ? "p-4 flex items-center gap-3" : "p-6"
                )}>
                  <Image className={cn(
                    "text-muted-foreground",
                    isMobile ? "h-6 w-6 shrink-0" : "h-8 w-8 mx-auto mb-2"
                  )} />
                  <div className={isMobile ? "text-left" : ""}>
                    <p className={cn("font-medium", isMobile && "text-sm")}>Hình ảnh thiết bị</p>
                    <p className="text-xs text-muted-foreground">Chưa có hình ảnh</p>
                  </div>
                </div>
              </div>
              <div className={cn(
                "border-t border-border/50",
                isMobile ? "mt-3 pt-3" : "mt-4 pt-4"
              )}>
                <Button variant="outline" size="sm" className="action-btn-secondary">
                  <FileText className="h-4 w-4" />
                  Tải lên tài liệu
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="animate-fade-in">
          <EquipmentHistoryTabs equipmentId={equipment.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
