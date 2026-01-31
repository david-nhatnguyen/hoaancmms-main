import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Settings, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { checklistService } from '@/services/checklist.service';
import { ChecklistTemplate } from '@/api/mock/checklistData';
import { toast } from 'sonner';

export default function ChecklistDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;
      try {
        const data = await checklistService.getById(id);
        if (data) {
          setTemplate(data);
        } else {
          toast.error('Không tìm thấy mẫu checklist');
          navigate('/checklists');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [id, navigate]);

  if (loading || !template) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="p-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/checklists')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{template.name}</h1>
              <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                {template.status === 'active' ? 'Hoạt động' : 'Nháp'}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{template.code}</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/checklists/${id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Chỉnh sửa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Thông tin chung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-muted-foreground block mb-1">Loại thiết bị áp dụng</span>
              <span className="font-medium">{template.machineType}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground block mb-1">Ghi chú</span>
              <p className="text-sm">{template.notes || 'Không có ghi chú'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground block mb-1">Ngày tạo</span>
              <span className="text-sm">{template.createdAt}</span>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              Danh sách hạng mục kiểm tra ({template.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {template.items.map((item, index) => (
                <div key={item.id} className="p-4 hover:bg-secondary/10 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.maintenanceTask}</p>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                        <span><strong className="text-foreground/80">Tiêu chuẩn:</strong> {item.standard}</span>
                        <span><strong className="text-foreground/80">Phương pháp:</strong> {item.method}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}