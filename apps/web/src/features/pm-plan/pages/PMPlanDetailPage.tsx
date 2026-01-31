import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Factory, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { pmPlanService, PMPlan } from '@/services/pm-plan.service';
import { factories } from '@/api/mock/mockData';
import { toast } from 'sonner';

export default function PMPlanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PMPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;
      try {
        const data = await pmPlanService.getById(id);
        if (data) {
          setPlan(data);
        } else {
          toast.error('Không tìm thấy kế hoạch');
          navigate('/pm-plans');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id, navigate]);

  if (loading || !plan) return <div className="p-8 text-center">Đang tải...</div>;

  const factory = factories.find(f => f.id === plan.factoryId);

  return (
    <div className="p-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/pm-plans')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{plan.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">Chi tiết cấu hình kế hoạch</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/pm-plans/${id}`)}>
            <Calendar className="h-4 w-4 mr-2" />
            Xem Lịch
          </Button>
          <Button onClick={() => navigate(`/pm-plans/new?edit=${id}`)}>
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Thông tin chung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Nhà máy</span>
              <span className="font-medium flex items-center gap-2">
                <Factory className="h-4 w-4" /> {factory?.name || plan.factoryId}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Thời gian</span>
              <span className="font-medium">Tháng {plan.month}/{plan.year}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Số lượng thiết bị</span>
              <Badge variant="secondary">{plan.items.length} thiết bị</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Phân công
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground mb-4">
               Danh sách nhân sự được phân công thực hiện kế hoạch này.
             </p>
             {/* Mock display since assignee data structure might vary */}
             <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Nguyễn Văn A</Badge>
                <Badge variant="outline">Trần Thị B</Badge>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
