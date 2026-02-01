import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Image,
  ExternalLink,
  BarChart3,
  Plus,
  ChevronRight
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock data for PM History
const pmHistoryData = [
  {
    id: 'wo-001',
    date: '05/12/2026',
    workOrderCode: 'WO-122026-001',
    checklist: 'Injection Machine – Bảo dưỡng tháng',
    cycle: 'Tháng',
    technician: 'Nguyễn Văn A',
    result: 'pass',
    status: 'completed',
    startTime: '08:00',
    endTime: '10:30',
    duration: '2 giờ 30 phút',
    notes: 'Bảo dưỡng định kỳ theo kế hoạch, tất cả hạng mục đạt yêu cầu.',
    checklistItems: [
      { name: 'Kiểm tra hệ thống bôi trơn', result: 'OK' },
      { name: 'Kiểm tra áp suất thủy lực', result: 'OK' },
      { name: 'Vệ sinh bộ lọc', result: 'OK' },
      { name: 'Kiểm tra nhiệt độ vận hành', result: 'OK' },
    ],
    images: ['image1.jpg', 'image2.jpg'],
  },
  {
    id: 'wo-002',
    date: '05/11/2026',
    workOrderCode: 'WO-112026-004',
    checklist: 'Injection Machine – Bảo dưỡng tháng',
    cycle: 'Tháng',
    technician: 'Trần Văn B',
    result: 'has_ng',
    status: 'completed_late',
    startTime: '09:00',
    endTime: '14:00',
    duration: '5 giờ',
    notes: 'Phát hiện rò rỉ nhỏ tại van áp suất, đã xử lý tại chỗ.',
    checklistItems: [
      { name: 'Kiểm tra hệ thống bôi trơn', result: 'OK' },
      { name: 'Kiểm tra áp suất thủy lực', result: 'NG', note: 'Phát hiện rò rỉ nhỏ' },
      { name: 'Vệ sinh bộ lọc', result: 'OK' },
      { name: 'Kiểm tra nhiệt độ vận hành', result: 'OK' },
    ],
    images: ['image3.jpg'],
  },
  {
    id: 'wo-003',
    date: '05/10/2026',
    workOrderCode: 'WO-102026-002',
    checklist: 'Injection Machine – Bảo dưỡng quý',
    cycle: 'Quý',
    technician: 'Nguyễn Văn A',
    result: 'pass',
    status: 'completed',
    startTime: '07:30',
    endTime: '12:00',
    duration: '4 giờ 30 phút',
    notes: 'Bảo dưỡng quý đầy đủ, thay thế dầu thủy lực.',
    checklistItems: [
      { name: 'Kiểm tra toàn bộ hệ thống điện', result: 'OK' },
      { name: 'Thay dầu thủy lực', result: 'OK' },
      { name: 'Kiểm tra khuôn và đầu phun', result: 'OK' },
    ],
    images: [],
  },
];

// Mock data for Incident History
const incidentHistoryData = [
  {
    id: 'cm-001',
    date: '18/11/2026',
    incidentCode: 'CM-112026-003',
    description: 'Rò rỉ dầu tại cụm xy lanh',
    severity: 'critical',
    downtime: 4.5,
    status: 'resolved',
    reportedBy: 'Lê Văn C',
    reportedAt: '18/11/2026 08:15',
    detailedDescription: 'Phát hiện dầu thủy lực rò rỉ nghiêm trọng từ cụm xy lanh chính. Máy đã dừng hoạt động để đảm bảo an toàn.',
    images: ['incident1.jpg', 'incident2.jpg'],
    linkedRepair: 'RP-112026-002',
  },
  {
    id: 'cm-002',
    date: '02/10/2026',
    incidentCode: 'CM-102026-001',
    description: 'Máy báo lỗi nhiệt',
    severity: 'medium',
    downtime: 1.2,
    status: 'resolved',
    reportedBy: 'Nguyễn Thị D',
    reportedAt: '02/10/2026 14:30',
    detailedDescription: 'Hệ thống cảnh báo nhiệt độ vượt ngưỡng cho phép. Cần kiểm tra cảm biến và hệ thống làm mát.',
    images: ['incident3.jpg'],
    linkedRepair: 'RP-102026-001',
  },
  {
    id: 'cm-003',
    date: '15/08/2026',
    incidentCode: 'CM-082026-002',
    description: 'Tiếng ồn bất thường từ động cơ',
    severity: 'low',
    downtime: 0.5,
    status: 'resolved',
    reportedBy: 'Trần Văn E',
    reportedAt: '15/08/2026 10:00',
    detailedDescription: 'Tiếng ồn nhẹ phát ra từ động cơ chính khi vận hành ở tốc độ cao.',
    images: [],
    linkedRepair: null,
  },
];

// Mock data for Repair History
const repairHistoryData = [
  {
    id: 'rp-001',
    date: '18/11/2026',
    repairCode: 'RP-112026-002',
    cause: 'Phớt dầu xy lanh bị mòn',
    action: 'Thay phớt + vệ sinh khu vực',
    technician: 'Nguyễn Văn A',
    result: 'fixed',
    linkedIncident: 'CM-112026-003',
    detailedCause: 'Phớt dầu tại xy lanh chính đã mòn sau thời gian sử dụng dài, gây rò rỉ dầu thủy lực.',
    repairDetails: 'Thay thế toàn bộ phớt dầu xy lanh chính (02 cái), vệ sinh khu vực bị rò rỉ và kiểm tra lại áp suất.',
    beforeImages: ['before1.jpg'],
    afterImages: ['after1.jpg'],
    repairDuration: '3 giờ 15 phút',
    evaluation: 'Máy hoạt động ổn định sau sửa chữa, không còn hiện tượng rò rỉ.',
  },
  {
    id: 'rp-002',
    date: '02/10/2026',
    repairCode: 'RP-102026-001',
    cause: 'Cảm biến nhiệt sai lệch',
    action: 'Hiệu chỉnh cảm biến',
    technician: 'Trần Văn B',
    result: 'fixed',
    linkedIncident: 'CM-102026-001',
    detailedCause: 'Cảm biến nhiệt bị lệch thông số sau thời gian hoạt động, gây cảnh báo sai.',
    repairDetails: 'Hiệu chỉnh lại cảm biến nhiệt theo thông số tiêu chuẩn. Kiểm tra toàn bộ hệ thống làm mát.',
    beforeImages: [],
    afterImages: ['after2.jpg'],
    repairDuration: '1 giờ',
    evaluation: 'Hệ thống hoạt động ổn định, nhiệt độ hiển thị chính xác.',
  },
  {
    id: 'rp-003',
    date: '20/07/2026',
    repairCode: 'RP-072026-003',
    cause: 'Bu lông nới lỏng',
    action: 'Siết chặt lại bu lông',
    technician: 'Lê Văn F',
    result: 'fixed',
    linkedIncident: null,
    detailedCause: 'Bu lông giữ động cơ bị nới lỏng do rung động trong quá trình vận hành.',
    repairDetails: 'Siết chặt lại toàn bộ bu lông giữ động cơ theo lực tiêu chuẩn. Kiểm tra các vị trí khác.',
    beforeImages: [],
    afterImages: [],
    repairDuration: '30 phút',
    evaluation: 'Đã khắc phục hoàn toàn, máy vận hành êm.',
  },
];

const getStatusBadge = (status: string, result?: string) => {
  if (status === 'completed') {
    return (
      <Badge className="bg-status-active/20 text-status-active border-0 font-medium">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Hoàn thành
      </Badge>
    );
  }
  if (status === 'completed_late') {
    return (
      <Badge className="bg-status-warning/20 text-status-warning border-0 font-medium">
        <Clock className="h-3 w-3 mr-1" />
        Hoàn thành trễ
      </Badge>
    );
  }
  if (result === 'has_ng') {
    return (
      <Badge className="bg-status-critical/20 text-status-critical border-0 font-medium">
        <XCircle className="h-3 w-3 mr-1" />
        Có NG
      </Badge>
    );
  }
  return null;
};

const getSeverityBadge = (severity: string) => {
  const config = {
    low: { label: 'Nhẹ', className: 'bg-status-active/20 text-status-active' },
    medium: { label: 'Trung bình', className: 'bg-status-warning/20 text-status-warning' },
    critical: { label: 'Nặng', className: 'bg-status-critical/20 text-status-critical' },
  };
  const { label, className } = config[severity as keyof typeof config] || config.low;
  return <Badge className={cn(className, 'border-0 font-medium')}>{label}</Badge>;
};

const getResultBadge = (result: string) => {
  if (result === 'pass') {
    return <Badge className="bg-status-active/20 text-status-active border-0 font-medium">Đạt</Badge>;
  }
  if (result === 'has_ng') {
    return <Badge className="bg-status-warning/20 text-status-warning border-0 font-medium">Có NG (đã xử lý)</Badge>;
  }
  return null;
};

const getRepairResultBadge = (result: string) => {
  if (result === 'fixed') {
    return (
      <Badge className="bg-status-active/20 text-status-active border-0 font-medium">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Đã khắc phục
      </Badge>
    );
  }
  return null;
};

interface EquipmentHistoryTabsProps {
  equipmentId: string;
}

export function EquipmentHistoryTabs({ equipmentId }: EquipmentHistoryTabsProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [historyTab, setHistoryTab] = useState('pm');
  const [selectedPM, setSelectedPM] = useState<typeof pmHistoryData[0] | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<typeof incidentHistoryData[0] | null>(null);
  const [selectedRepair, setSelectedRepair] = useState<typeof repairHistoryData[0] | null>(null);

  const EmptyState = ({ type }: { type: 'pm' | 'incident' | 'repair' }) => {
    const config = {
      pm: {
        icon: Calendar,
        title: 'Chưa có dữ liệu bảo dưỡng',
        description: 'Thiết bị này chưa có lịch sử bảo dưỡng định kỳ.',
        cta: 'Tạo Work Order mới',
        ctaPath: '/work-orders/new',
      },
      incident: {
        icon: AlertTriangle,
        title: 'Chưa có dữ liệu sự cố',
        description: 'Thiết bị này chưa ghi nhận sự cố nào.',
        cta: 'Xem Dashboard rủi ro',
        ctaPath: '/dashboard',
      },
      repair: {
        icon: Wrench,
        title: 'Chưa có dữ liệu sửa chữa',
        description: 'Thiết bị này chưa có lịch sử sửa chữa.',
        cta: 'Xem Dashboard rủi ro',
        ctaPath: '/dashboard',
      },
    };
    const { icon: Icon, title, description, cta, ctaPath } = config[type];

    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        <Button variant="outline" onClick={() => navigate(ctaPath)} className="gap-2">
          {type === 'pm' ? <Plus className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
          {cta}
        </Button>
      </div>
    );
  };

  // Mobile card component for PM history
  const PMHistoryCard = ({ item }: { item: typeof pmHistoryData[0] }) => (
    <div 
      onClick={() => setSelectedPM(item)}
      className="bg-card rounded-xl border border-border/50 p-3 cursor-pointer active:scale-[0.99] transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <span className="font-mono text-primary text-xs">{item.workOrderCode}</span>
          <p className="text-sm font-medium truncate mt-0.5">{item.checklist}</p>
        </div>
        <div className="shrink-0">
          {getResultBadge(item.result)}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>{item.date}</span>
          <span>{item.technician}</span>
        </div>
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );

  // Mobile card component for Incident history
  const IncidentHistoryCard = ({ item }: { item: typeof incidentHistoryData[0] }) => (
    <div 
      onClick={() => setSelectedIncident(item)}
      className="bg-card rounded-xl border border-border/50 p-3 cursor-pointer active:scale-[0.99] transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <span className="font-mono text-primary text-xs">{item.incidentCode}</span>
          <p className="text-sm font-medium truncate mt-0.5">{item.description}</p>
        </div>
        <div className="shrink-0">
          {getSeverityBadge(item.severity)}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>{item.date}</span>
          <span className="text-destructive font-medium">{item.downtime}h downtime</span>
        </div>
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );

  // Mobile card component for Repair history
  const RepairHistoryCard = ({ item }: { item: typeof repairHistoryData[0] }) => (
    <div 
      onClick={() => setSelectedRepair(item)}
      className="bg-card rounded-xl border border-border/50 p-3 cursor-pointer active:scale-[0.99] transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <span className="font-mono text-primary text-xs">{item.repairCode}</span>
          <p className="text-sm font-medium truncate mt-0.5">{item.cause}</p>
        </div>
        <div className="shrink-0">
          {getRepairResultBadge(item.result)}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>{item.date}</span>
          <span>{item.technician}</span>
        </div>
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );

  return (
    <>
      <Tabs value={historyTab} onValueChange={setHistoryTab} className="w-full max-w-full overflow-hidden">
        <div className={cn(
          "sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          isMobile ? "pb-2" : "pb-4"
        )}>
          <TabsList className={cn(
            "w-full grid grid-cols-3 bg-secondary/50 p-1",
            isMobile && "h-auto"
          )}>
            <TabsTrigger 
              value="pm" 
              className={cn(
                "gap-1.5 data-[state=active]:bg-card data-[state=active]:text-primary",
                isMobile && "text-[10px] py-2 flex-col h-auto [&>svg]:mb-0.5"
              )}
            >
              <Calendar className={cn("h-4 w-4", isMobile && "h-3.5 w-3.5")} />
              <span className={isMobile ? "leading-tight" : "hidden sm:inline"}>
                {isMobile ? "Bảo dưỡng" : "Lịch sử bảo dưỡng định kỳ"}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="incident" 
              className={cn(
                "gap-1.5 data-[state=active]:bg-card data-[state=active]:text-primary",
                isMobile && "text-[10px] py-2 flex-col h-auto [&>svg]:mb-0.5"
              )}
            >
              <AlertTriangle className={cn("h-4 w-4", isMobile && "h-3.5 w-3.5")} />
              <span className={isMobile ? "leading-tight" : "hidden sm:inline"}>
                {isMobile ? "Sự cố" : "Lịch sử sự cố"}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="repair" 
              className={cn(
                "gap-1.5 data-[state=active]:bg-card data-[state=active]:text-primary",
                isMobile && "text-[10px] py-2 flex-col h-auto [&>svg]:mb-0.5"
              )}
            >
              <Wrench className={cn("h-4 w-4", isMobile && "h-3.5 w-3.5")} />
              <span className={isMobile ? "leading-tight" : "hidden sm:inline"}>
                {isMobile ? "Sửa chữa" : "Lịch sử sửa chữa"}
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* PM History Tab */}
        <TabsContent value="pm" className="mt-0 animate-fade-in">
          {pmHistoryData.length === 0 ? (
            <EmptyState type="pm" />
          ) : isMobile ? (
            <div className="space-y-2">
              {pmHistoryData.map((item) => (
                <PMHistoryCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium">Ngày bảo dưỡng</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Mã Work Order</TableHead>
                      <TableHead className="text-muted-foreground font-medium hidden lg:table-cell">Checklist</TableHead>
                      <TableHead className="text-muted-foreground font-medium hidden md:table-cell">Chu kỳ</TableHead>
                      <TableHead className="text-muted-foreground font-medium hidden md:table-cell">Người thực hiện</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Kết quả</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Trạng thái</TableHead>
                      <TableHead className="text-muted-foreground font-medium w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pmHistoryData.map((item) => (
                      <TableRow 
                        key={item.id} 
                        className="border-border/50 hover:bg-muted/30 cursor-pointer"
                        onClick={() => setSelectedPM(item)}
                      >
                        <TableCell className="font-medium">{item.date}</TableCell>
                        <TableCell>
                          <span className="font-mono text-primary">{item.workOrderCode}</span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {item.checklist}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className="border-border">{item.cycle}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {item.technician}
                        </TableCell>
                        <TableCell>{getResultBadge(item.result)}</TableCell>
                        <TableCell>{getStatusBadge(item.status, item.result)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPM(item);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Incident History Tab */}
        <TabsContent value="incident" className="mt-0 animate-fade-in">
          {incidentHistoryData.length === 0 ? (
            <EmptyState type="incident" />
          ) : isMobile ? (
            <div className="space-y-2">
              {incidentHistoryData.map((item) => (
                <IncidentHistoryCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium">Ngày xảy ra</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Mã sự cố</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Mô tả hiện tượng</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Mức độ</TableHead>
                      <TableHead className="text-muted-foreground font-medium hidden md:table-cell">Downtime</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Trạng thái</TableHead>
                      <TableHead className="text-muted-foreground font-medium w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidentHistoryData.map((item) => (
                      <TableRow 
                        key={item.id} 
                        className="border-border/50 hover:bg-muted/30 cursor-pointer"
                        onClick={() => setSelectedIncident(item)}
                      >
                        <TableCell className="font-medium">{item.date}</TableCell>
                        <TableCell>
                          <span className="font-mono text-primary">{item.incidentCode}</span>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                          {item.description}
                        </TableCell>
                        <TableCell>{getSeverityBadge(item.severity)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-destructive font-medium">{item.downtime} giờ</span>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-status-active/20 text-status-active border-0 font-medium">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Đã xử lý
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIncident(item);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Repair History Tab */}
        <TabsContent value="repair" className="mt-0 animate-fade-in">
          {repairHistoryData.length === 0 ? (
            <EmptyState type="repair" />
          ) : isMobile ? (
            <div className="space-y-2">
              {repairHistoryData.map((item) => (
                <RepairHistoryCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium">Ngày sửa chữa</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Mã sửa chữa</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Nguyên nhân</TableHead>
                      <TableHead className="text-muted-foreground font-medium hidden lg:table-cell">Hành động khắc phục</TableHead>
                      <TableHead className="text-muted-foreground font-medium hidden md:table-cell">Người thực hiện</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Kết quả</TableHead>
                      <TableHead className="text-muted-foreground font-medium w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {repairHistoryData.map((item) => (
                      <TableRow 
                        key={item.id} 
                        className="border-border/50 hover:bg-muted/30 cursor-pointer"
                        onClick={() => setSelectedRepair(item)}
                      >
                        <TableCell className="font-medium">{item.date}</TableCell>
                        <TableCell>
                          <span className="font-mono text-primary">{item.repairCode}</span>
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate text-muted-foreground">
                          {item.cause}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell max-w-[200px] truncate text-muted-foreground">
                          {item.action}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {item.technician}
                        </TableCell>
                        <TableCell>{getRepairResultBadge(item.result)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRepair(item);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* PM Detail Drawer */}
      <Sheet open={!!selectedPM} onOpenChange={() => setSelectedPM(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedPM && (
            <>
              <SheetHeader className="pb-4 border-b border-border/50">
                <SheetTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-mono text-primary">{selectedPM.workOrderCode}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {selectedPM.date}
                    </div>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Status */}
                <div className="flex items-center gap-3">
                  {getResultBadge(selectedPM.result)}
                  {getStatusBadge(selectedPM.status, selectedPM.result)}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Checklist</p>
                    <p className="text-sm font-medium">{selectedPM.checklist}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Chu kỳ</p>
                    <Badge variant="outline" className="border-border">{selectedPM.cycle}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Người thực hiện</p>
                    <p className="text-sm font-medium">{selectedPM.technician}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Thời gian thực hiện</p>
                    <p className="text-sm font-medium">{selectedPM.duration}</p>
                  </div>
                </div>

                {/* Checklist Results */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Kết quả Checklist
                  </h4>
                  <div className="space-y-2">
                    {selectedPM.checklistItems.map((item, index) => (
                      <div 
                        key={index} 
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border",
                          item.result === 'OK' 
                            ? "border-status-active/30 bg-status-active/5" 
                            : "border-status-critical/30 bg-status-critical/5"
                        )}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          {item.note && (
                            <p className="text-xs text-muted-foreground mt-1">{item.note}</p>
                          )}
                        </div>
                        <Badge 
                          className={cn(
                            "border-0",
                            item.result === 'OK' 
                              ? "bg-status-active/20 text-status-active" 
                              : "bg-status-critical/20 text-status-critical"
                          )}
                        >
                          {item.result}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedPM.notes && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Ghi chú</h4>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {selectedPM.notes}
                    </p>
                  </div>
                )}

                {/* Images */}
                {selectedPM.images.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Image className="h-4 w-4 text-primary" />
                      Hình ảnh đính kèm ({selectedPM.images.length})
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedPM.images.map((img, index) => (
                        <div 
                          key={index}
                          className="aspect-square rounded-lg bg-muted flex items-center justify-center border border-border/50"
                        >
                          <Image className="h-6 w-6 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* View Full */}
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => navigate(`/work-orders/${selectedPM.id}`)}
                >
                  <ExternalLink className="h-4 w-4" />
                  Xem chi tiết Work Order
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Incident Detail Drawer */}
      <Sheet open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedIncident && (
            <>
              <SheetHeader className="pb-4 border-b border-border/50">
                <SheetTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-status-critical/20 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-status-critical" />
                  </div>
                  <div>
                    <div className="font-mono text-primary">{selectedIncident.incidentCode}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {selectedIncident.reportedAt}
                    </div>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Severity & Status */}
                <div className="flex items-center gap-3">
                  {getSeverityBadge(selectedIncident.severity)}
                  <Badge className="bg-status-active/20 text-status-active border-0 font-medium">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Đã xử lý
                  </Badge>
                </div>

                {/* Downtime */}
                <div className="bg-status-critical/10 border border-status-critical/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-status-critical mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Thời gian dừng máy</span>
                  </div>
                  <p className="text-2xl font-bold text-status-critical">
                    {selectedIncident.downtime} giờ
                  </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Người báo hỏng</p>
                    <p className="text-sm font-medium">{selectedIncident.reportedBy}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Ngày xảy ra</p>
                    <p className="text-sm font-medium">{selectedIncident.date}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Mô tả chi tiết</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {selectedIncident.detailedDescription}
                  </p>
                </div>

                {/* Images */}
                {selectedIncident.images.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Image className="h-4 w-4 text-primary" />
                      Hình ảnh hiện trường ({selectedIncident.images.length})
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedIncident.images.map((img, index) => (
                        <div 
                          key={index}
                          className="aspect-square rounded-lg bg-muted flex items-center justify-center border border-border/50"
                        >
                          <Image className="h-6 w-6 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linked Repair */}
                {selectedIncident.linkedRepair && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-primary" />
                      Phiếu sửa chữa liên quan
                    </h4>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between"
                      onClick={() => {
                        setSelectedIncident(null);
                        const repair = repairHistoryData.find(r => r.repairCode === selectedIncident.linkedRepair);
                        if (repair) setSelectedRepair(repair);
                      }}
                    >
                      <span className="font-mono text-primary">{selectedIncident.linkedRepair}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* View Full */}
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => navigate(`/corrective-maintenance/${selectedIncident.id}`)}
                >
                  <ExternalLink className="h-4 w-4" />
                  Xem chi tiết sự cố
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Repair Detail Drawer */}
      <Sheet open={!!selectedRepair} onOpenChange={() => setSelectedRepair(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedRepair && (
            <>
              <SheetHeader className="pb-4 border-b border-border/50">
                <SheetTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-status-maintenance/20 flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-status-maintenance" />
                  </div>
                  <div>
                    <div className="font-mono text-primary">{selectedRepair.repairCode}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {selectedRepair.date}
                    </div>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Result */}
                <div className="flex items-center gap-3">
                  {getRepairResultBadge(selectedRepair.result)}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Người thực hiện</p>
                    <p className="text-sm font-medium">{selectedRepair.technician}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Thời gian sửa chữa</p>
                    <p className="text-sm font-medium">{selectedRepair.repairDuration}</p>
                  </div>
                </div>

                {/* Linked Incident */}
                {selectedRepair.linkedIncident && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-status-critical" />
                      Sự cố gốc
                    </h4>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between"
                      onClick={() => {
                        setSelectedRepair(null);
                        const incident = incidentHistoryData.find(i => i.incidentCode === selectedRepair.linkedIncident);
                        if (incident) setSelectedIncident(incident);
                      }}
                    >
                      <span className="font-mono text-primary">{selectedRepair.linkedIncident}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Cause */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Nguyên nhân chi tiết</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {selectedRepair.detailedCause}
                  </p>
                </div>

                {/* Repair Details */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Biện pháp sửa chữa</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {selectedRepair.repairDetails}
                  </p>
                </div>

                {/* Before/After Images */}
                {(selectedRepair.beforeImages.length > 0 || selectedRepair.afterImages.length > 0) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRepair.beforeImages.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Trước sửa chữa</h4>
                        <div className="aspect-video rounded-lg bg-muted flex items-center justify-center border border-border/50">
                          <Image className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </div>
                    )}
                    {selectedRepair.afterImages.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-status-active">Sau sửa chữa</h4>
                        <div className="aspect-video rounded-lg bg-muted flex items-center justify-center border border-border/50">
                          <Image className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Evaluation */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-status-active" />
                    Đánh giá sau sửa
                  </h4>
                  <p className="text-sm text-status-active bg-status-active/10 p-3 rounded-lg border border-status-active/30">
                    {selectedRepair.evaluation}
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
