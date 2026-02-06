import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Pencil, 
  Copy,
  ClipboardList,
  CheckCircle,
  XCircle,
  MinusCircle,
  Camera,
  MessageSquare,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  checklistTemplates, 
  CYCLE_LABELS, 
  CHECKLIST_STATUS_LABELS,
  ChecklistItem 
} from '@/data/checklistData';
import { EQUIPMENT_GROUPS } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ChecklistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('preview');

  const checklist = checklistTemplates.find(cl => cl.id === id);

  if (!checklist) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2">Không tìm thấy checklist</h2>
          <Button variant="outline" onClick={() => navigate('/checklists')} className="border-border">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    toast.success('Đang sao chép checklist...');
    navigate(`/checklists/new?copy=${checklist.id}`);
  };

  const ChecklistItemCard = ({ item, index }: { item: ChecklistItem; index: number }) => (
    <Card className="bg-secondary/30 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Order number */}
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="font-bold text-primary">{item.order}</span>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            {/* Task name */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium">{item.maintenanceTask}</h4>
              <div className="flex items-center gap-1.5">
                {item.isRequired && (
                  <span className="text-xs px-2 py-0.5 rounded bg-destructive/20 text-destructive">Bắt buộc</span>
                )}
                {item.requiresImage && (
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    Ảnh
                  </span>
                )}
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {item.standard && (
                <div>
                  <span className="text-muted-foreground">Tiêu chuẩn: </span>
                  <span>{item.standard}</span>
                </div>
              )}
              {item.method && (
                <div>
                  <span className="text-muted-foreground">Phương pháp: </span>
                  <span>{item.method}</span>
                </div>
              )}
              {item.content && (
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Nội dung: </span>
                  <span>{item.content}</span>
                </div>
              )}
              {item.expectedResult && (
                <div>
                  <span className="text-muted-foreground">Kết quả mong đợi: </span>
                  <span className="font-medium text-primary">{item.expectedResult}</span>
                </div>
              )}
            </div>

            {/* Result placeholder (for preview) */}
            <div className="pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Kết quả kiểm tra:</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 border-status-active text-status-active hover:bg-status-active/20">
                  <CheckCircle className="h-4 w-4" />
                  OK
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 border-destructive text-destructive hover:bg-destructive/20">
                  <XCircle className="h-4 w-4" />
                  NG
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 border-muted-foreground text-muted-foreground hover:bg-muted">
                  <MinusCircle className="h-4 w-4" />
                  N/A
                </Button>
                <div className="flex-1" />
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  Ghi chú
                </Button>
                {item.requiresImage && (
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                    <Camera className="h-4 w-4" />
                    Chụp ảnh
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/checklists')}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <ClipboardList className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="page-subtitle">THƯ VIỆN CHECKLIST</p>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold">{checklist.name}</h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-primary bg-primary/20 px-2.5 py-1 rounded-lg">
                  {checklist.code}
                </span>
                <span className={cn(
                  'status-badge',
                  checklist.status === 'active' && 'bg-status-active/20 text-status-active',
                  checklist.status === 'draft' && 'bg-muted text-muted-foreground',
                  checklist.status === 'inactive' && 'bg-status-inactive/20 text-status-inactive'
                )}>
                  {CHECKLIST_STATUS_LABELS[checklist.status]}
                </span>
                <span className="text-sm text-muted-foreground">v{checklist.version}</span>
                <span className="px-2 py-1 rounded-md bg-secondary text-xs font-medium">
                  {CYCLE_LABELS[checklist.cycle]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCopy} className="action-btn-secondary">
              <Copy className="h-4 w-4" />
              Sao chép
            </Button>
            <Button onClick={() => navigate(`/checklists/${id}/edit`)} className="action-btn-primary">
              <Pencil className="h-4 w-4" />
              Sửa
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/50 p-1 mb-6">
          <TabsTrigger value="preview" className="gap-2 data-[state=active]:bg-card data-[state=active]:text-primary">
            <ClipboardList className="h-4 w-4" />
            Xem trước Checklist
          </TabsTrigger>
          <TabsTrigger value="info" className="gap-2 data-[state=active]:bg-card data-[state=active]:text-primary">
            <History className="h-4 w-4" />
            Thông tin & Lịch sử
          </TabsTrigger>
        </TabsList>

        {/* Preview Tab */}
        <TabsContent value="preview" className="animate-fade-in">
          <div className="max-w-3xl">
            {/* Info banner */}
            <Card className="bg-primary/10 border-primary/30 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nhóm TB: </span>
                    <span className="font-medium">{EQUIPMENT_GROUPS[checklist.equipmentGroupId]?.name}</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div>
                    <span className="text-muted-foreground">Loại máy: </span>
                    <span className="font-medium">{checklist.machineType}</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div>
                    <span className="text-muted-foreground">Số hạng mục: </span>
                    <span className="font-medium">{checklist.items.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Checklist items - Mobile friendly vertical layout */}
            <div className="space-y-4">
              {checklist.items.map((item, index) => (
                <ChecklistItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info" className="animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Info */}
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Thông tin chung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Mã checklist</span>
                  <span className="font-mono text-primary">{checklist.code}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Nhóm thiết bị</span>
                  <span>{EQUIPMENT_GROUPS[checklist.equipmentGroupId]?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Loại máy</span>
                  <span>{checklist.machineType}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Chu kỳ</span>
                  <span>{CYCLE_LABELS[checklist.cycle]}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Phiên bản</span>
                  <span>v{checklist.version}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Ngày cập nhật</span>
                  <span>{checklist.updatedAt}</span>
                </div>
                {checklist.notes && (
                  <div className="pt-3 border-t border-border/50">
                    <span className="text-muted-foreground text-sm">Ghi chú:</span>
                    <p className="mt-1 text-sm">{checklist.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Version History */}
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Lịch sử phiên bản</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">v{checklist.version}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Phiên bản hiện tại</p>
                      <p className="text-xs text-muted-foreground">{checklist.updatedAt}</p>
                    </div>
                    <span className={cn(
                      'status-badge text-xs',
                      checklist.status === 'active' && 'bg-status-active/20 text-status-active'
                    )}>
                      {CHECKLIST_STATUS_LABELS[checklist.status]}
                    </span>
                  </div>
                  
                  {checklist.version > 1 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs font-bold text-muted-foreground">v{checklist.version - 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Phiên bản cũ</p>
                        <p className="text-xs text-muted-foreground">{checklist.createdAt}</p>
                      </div>
                      <span className="status-badge text-xs bg-status-inactive/20 text-status-inactive">
                        Đã thay thế
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
