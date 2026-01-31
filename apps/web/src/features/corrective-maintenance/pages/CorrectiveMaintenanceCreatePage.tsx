import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { correctiveMaintenanceService } from '@/services/corrective-maintenance.service';
import { CorrectiveMaintenance } from '@/api/mock/correctiveMaintenanceData';
import { equipments } from '@/api/mock/mockData';
import { toast } from 'sonner';

export default function CorrectiveMaintenanceCreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<CorrectiveMaintenance>>({
    equipmentId: '',
    description: '',
    severity: 'medium',
    reportedBy: 'Nguyễn Văn A' // Mock current user
  });

  const handleSave = async () => {
    if (!formData.equipmentId || !formData.description) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const equipment = equipments.find(e => e.id === formData.equipmentId);
      await correctiveMaintenanceService.create({ 
        ...formData,
        equipmentCode: equipment?.code || '',
        equipmentName: equipment?.name || '',
        equipmentGroup: equipment?.groupId || '',
        machineType: equipment?.machineType || '',
        factoryId: equipment?.factoryId || '',
        factoryName: equipment?.factoryName || '',
        status: 'new',
        reportedAt: new Date().toISOString()
      });
      
      toast.success('Đã gửi yêu cầu bảo trì');
      navigate('/corrective-maintenance');
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <div className="p-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/corrective-maintenance')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Báo hỏng thiết bị</h1>
            <p className="text-sm text-muted-foreground mt-1">Tạo phiếu yêu cầu sửa chữa mới</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Thông tin sự cố
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Thiết bị gặp sự cố <span className="text-destructive">*</span></Label>
            <Select 
              value={formData.equipmentId} 
              onValueChange={(v) => setFormData({ ...formData, equipmentId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn thiết bị" />
              </SelectTrigger>
              <SelectContent>
                {equipments.map(eq => (
                  <SelectItem key={eq.id} value={eq.id}>{eq.code} - {eq.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mô tả sự cố <span className="text-destructive">*</span></Label>
            <Textarea 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả chi tiết hiện tượng, tiếng ồn, mã lỗi..."
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Mức độ ưu tiên</Label>
            <Select 
              value={formData.severity} 
              onValueChange={(v: any) => setFormData({ ...formData, severity: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Thấp (Nhẹ)</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="high">Cao (Nặng)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} className="w-full action-btn-primary">
            <Save className="h-4 w-4 mr-2" /> Gửi yêu cầu
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}