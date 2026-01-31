import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, MapPin, Settings, Calendar, Building2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { assetService } from '@/services/asset.service';
import { Equipment, STATUS_LABELS, PRIORITY_LABELS } from '@/api/mock/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function EquipmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      if (!id) return;
      try {
        const data = await assetService.getEquipmentById(id);
        if (data) {
          setEquipment(data);
        } else {
          toast.error('Không tìm thấy thiết bị');
          navigate('/equipments');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [id, navigate]);

  if (loading || !equipment) return <div className="p-8 text-center">Đang tải...</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-600';
      case 'maintenance': return 'bg-orange-500/10 text-orange-600';
      case 'inactive': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="p-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/equipments')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{equipment.name}</h1>
              <Badge variant="secondary" className={cn("font-normal", getStatusColor(equipment.status))}>
                {STATUS_LABELS[equipment.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 font-mono">{equipment.code}</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/equipments/${id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Chỉnh sửa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Thông tin chung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground flex items-center gap-2"><Building2 className="h-4 w-4" /> Nhà máy</span>
              <span className="font-medium">{equipment.factoryName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" /> Bộ phận</span>
              <span className="font-medium">{equipment.department}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground flex items-center gap-2"><Settings className="h-4 w-4" /> Loại máy</span>
              <span className="font-medium">{equipment.machineType}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Độ ưu tiên</span>
              <Badge variant="outline">{PRIORITY_LABELS[equipment.priority]}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Technical Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Thông số kỹ thuật
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Nhà sản xuất</span>
              <span className="font-medium">{equipment.manufacturer}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Model</span>
              <span className="font-medium">{equipment.model}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Số Serial</span>
              <span className="font-medium">{equipment.serialNumber}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Năm sử dụng</span>
              <span className="font-medium">{equipment.yearInService}</span>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {equipment.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Ghi chú</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{equipment.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}