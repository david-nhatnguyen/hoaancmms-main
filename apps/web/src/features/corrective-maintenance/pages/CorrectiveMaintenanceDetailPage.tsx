import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { correctiveMaintenanceService } from '@/services/corrective-maintenance.service';
import { CorrectiveMaintenance, CM_STATUS_LABELS, SEVERITY_LABELS } from '@/api/mock/correctiveMaintenanceData';
import { toast } from 'sonner';

export default function CorrectiveMaintenanceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<CorrectiveMaintenance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      try {
        const data = await correctiveMaintenanceService.getById(id);
        if (data) {
          setItem(data);
        } else {
          toast.error('Không tìm thấy phiếu');
          navigate('/corrective-maintenance');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, navigate]);

  if (loading || !item) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="p-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/corrective-maintenance')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{item.code}</h1>
              <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                {CM_STATUS_LABELS[item.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{item.equipmentName}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Chi tiết sự cố
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{item.description}</p>
            </CardContent>
          </Card>

          {item.correctionAction && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Giải pháp / Kết quả
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{item.correctionAction}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" /> Người yêu cầu</span>
                <span className="text-sm font-medium">{item.reportedBy}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> Thời gian báo</span>
                <span className="text-sm font-medium">{new Date(item.reportedAt).toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Độ ưu tiên</span>
                <Badge variant="outline">{SEVERITY_LABELS[item.severity]}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}