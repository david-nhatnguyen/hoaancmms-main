import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
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
import { assetService } from '@/services/asset.service';
import { Equipment, EQUIPMENT_GROUPS, MACHINE_TYPES, factories } from '@/api/mock/mockData';
import { toast } from 'sonner';

export default function EquipmentCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Partial<Equipment>>({
    name: '',
    code: '',
    groupId: 'injection',
    machineType: '',
    factoryId: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    yearInService: new Date().getFullYear(),
    department: '',
    priority: 'medium',
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    if (isEditing && id) {
      const fetchEquipment = async () => {
        const data = await assetService.getEquipmentById(id);
        if (data) setFormData(data);
      };
      fetchEquipment();
    }
  }, [isEditing, id]);

  const handleSave = async () => {
    if (!formData.name || !formData.code || !formData.factoryId) {
      toast.error('Vui lòng điền các thông tin bắt buộc (*)');
      return;
    }

    try {
      if (isEditing && id) {
        await assetService.updateEquipment(id, formData);
        toast.success('Cập nhật thiết bị thành công');
      } else {
        await assetService.createEquipment(formData);
        toast.success('Thêm thiết bị mới thành công');
      }
      navigate('/equipments');
    } catch (error) {
      toast.error('Có lỗi xảy ra');
      console.error(error);
    }
  };

  const availableMachineTypes = formData.groupId ? MACHINE_TYPES[formData.groupId] || [] : [];

  return (
    <div className="p-6 animate-fade-in max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/equipments')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
            </h1>
          </div>
        </div>
        <Button onClick={handleSave} className="action-btn-primary">
          <Save className="h-4 w-4 mr-2" />
          Lưu thiết bị
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin chung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tên thiết bị <span className="text-destructive">*</span></Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Ví dụ: Máy ép nhựa 280T"
              />
            </div>
            <div className="space-y-2">
              <Label>Mã thiết bị <span className="text-destructive">*</span></Label>
              <Input 
                value={formData.code} 
                onChange={(e) => setFormData({ ...formData, code: e.target.value })} 
                placeholder="Ví dụ: IMM-01"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nhóm thiết bị</Label>
                <Select 
                  value={formData.groupId} 
                  onValueChange={(v: "injection" | "mold-manufacturing") => setFormData({ ...formData, groupId: v, machineType: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhóm" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(EQUIPMENT_GROUPS).map(group => (
                      <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Loại máy</Label>
                <Select 
                  value={formData.machineType} 
                  onValueChange={(v) => setFormData({ ...formData, machineType: v })}
                  disabled={!formData.groupId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại máy" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMachineTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nhà máy / Khu vực <span className="text-destructive">*</span></Label>
              <Select 
                value={formData.factoryId} 
                onValueChange={(v) => setFormData({ ...formData, factoryId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhà máy" />
                </SelectTrigger>
                <SelectContent>
                  {factories.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.name} - {f.location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bộ phận quản lý</Label>
              <Input 
                value={formData.department} 
                onChange={(e) => setFormData({ ...formData, department: e.target.value })} 
                placeholder="Ví dụ: Xưởng ép nhựa 1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Technical Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin kỹ thuật</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nhà sản xuất</Label>
                <Input 
                  value={formData.manufacturer} 
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input 
                  value={formData.model} 
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Số Serial</Label>
                <Input 
                  value={formData.serialNumber} 
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Năm đưa vào sử dụng</Label>
                <Input 
                  type="number"
                  value={formData.yearInService} 
                  onChange={(e) => setFormData({ ...formData, yearInService: parseInt(e.target.value) })} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea 
                value={formData.notes} 
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}