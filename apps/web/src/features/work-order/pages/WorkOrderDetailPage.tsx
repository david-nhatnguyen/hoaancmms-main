import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock, 
  MapPin, 
  FileText,
  Play,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { workOrderService } from '@/services/work-order.service';
import { WorkOrder, WORK_ORDER_STATUS_LABELS, WORK_ORDER_PRIORITY_LABELS } from '@/api/mock/workOrderData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function WorkOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWO = async () => {
      if (!id) return;
      try {
        const data = await workOrderService.getById(id);
        if (data) {
          setWorkOrder(data);
        } else {
          toast.error('Không tìm thấy phiếu công việc');
          navigate('/work-orders');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWO();
  }, [id, navigate]);

  if (loading || !workOrder) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="p-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/work-orders')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{workOrder.code}</h1>
              <Badge variant="outline" className="text-sm">
                {WORK_ORDER_STATUS_LABELS[workOrder.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{workOrder.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {workOrder.status === 'new' && (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate(`/work-orders/${id}/execute`)}>
              <Play className="h-4 w-4 mr-2" /> Bắt đầu thực hiện
            </Button>
          )}
          {workOrder.status === 'in-progress' && (
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => navigate(`/work-orders/${id}/execute`)}>
              <CheckCircle className="h-4 w-4 mr-2" /> Tiếp tục / Hoàn thành
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin thiết bị</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Thiết bị</p>
                <p className="font-medium">{workOrder.equipmentName}</p>
                <p className="text-xs text-muted-foreground font-mono">{workOrder.equipmentId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Khu vực</p>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Nhà máy A - Xưởng 1</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="tasks">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="tasks">Công việc</TabsTrigger>
              <TabsTrigger value="materials">Vật tư</TabsTrigger>
              <TabsTrigger value="history">Lịch sử</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {/* Mock Tasks List */}
                  <div className="divide-y divide-border">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 flex items-start gap-3">
                        <div className="mt-0.5 h-5 w-5 rounded border border-muted-foreground/30 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">{i}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Kiểm tra hạng mục số {i}</p>
                          <p className="text-xs text-muted-foreground">Tiêu chuẩn: Không có tiếng ồn lạ</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="materials">
              <div className="p-8 text-center text-muted-foreground bg-secondary/20 rounded-lg border border-dashed">
                Chưa có vật tư nào được sử dụng
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" /> Người phụ trách</span>
                <span className="text-sm font-medium">{workOrder.assignee}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Hạn hoàn thành</span>
                <span className="text-sm font-medium">{workOrder.dueDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> Độ ưu tiên</span>
                <Badge variant={workOrder.priority === 'high' ? 'destructive' : 'secondary'}>
                  {WORK_ORDER_PRIORITY_LABELS[workOrder.priority]}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}