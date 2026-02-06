import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  equipments, 
  factories, 
  EQUIPMENT_GROUPS,
} from '@/data/mockData';
import { toast } from 'sonner';

interface FormData {
  code: string;
  name: string;
  factoryId: string;
  groupId: string;
  machineType: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  yearInService: string;
  department: string;
  priority: string;
  notes: string;
}

const initialFormData: FormData = {
  code: '',
  name: '',
  factoryId: '',
  groupId: '',
  machineType: '',
  manufacturer: '',
  model: '',
  serialNumber: '',
  yearInService: new Date().getFullYear().toString(),
  department: '',
  priority: 'medium',
  notes: ''
};

export default function EquipmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const availableMachineTypes = useMemo(() => {
    if (!formData.groupId) return [];
    return EQUIPMENT_GROUPS[formData.groupId as keyof typeof EQUIPMENT_GROUPS]?.machineTypes || [];
  }, [formData.groupId]);

  useEffect(() => {
    if (isEditing && id) {
      const equipment = equipments.find(eq => eq.id === id);
      if (equipment) {
        setFormData({
          code: equipment.code,
          name: equipment.name,
          factoryId: equipment.factoryId,
          groupId: equipment.groupId,
          machineType: equipment.machineType,
          manufacturer: equipment.manufacturer,
          model: equipment.model,
          serialNumber: equipment.serialNumber,
          yearInService: equipment.yearInService.toString(),
          department: equipment.department,
          priority: equipment.priority,
          notes: equipment.notes || ''
        });
      }
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (formData.groupId && !availableMachineTypes.includes(formData.machineType)) {
      setFormData(prev => ({ ...prev, machineType: '' }));
    }
  }, [formData.groupId, availableMachineTypes]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Mã thiết bị là bắt buộc';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Tên thiết bị là bắt buộc';
    }
    if (!formData.factoryId) {
      newErrors.factoryId = 'Vui lòng chọn nhà máy';
    }
    if (!formData.groupId) {
      newErrors.groupId = 'Vui lòng chọn nhóm thiết bị';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (createNew: boolean = false) => {
    if (!validate()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    toast.success(isEditing ? 'Cập nhật thiết bị thành công' : 'Thêm thiết bị thành công');
    
    if (createNew) {
      setFormData(initialFormData);
      setErrors({});
    } else {
      navigate('/equipments');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/equipments')}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <p className="page-subtitle">QUẢN LÝ TÀI SẢN</p>
        <h1 className="page-title">
          {isEditing ? 'Sửa thông tin Thiết bị' : 'Thêm Thiết bị mới'}
        </h1>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Mã thiết bị *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="VD: IMM-01"
                className={`bg-secondary border-border ${errors.code ? 'border-destructive' : ''}`}
              />
              {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Tên thiết bị *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="VD: Máy ép nhựa 280T"
                className={`bg-secondary border-border ${errors.name ? 'border-destructive' : ''}`}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="factory">Nhà máy *</Label>
              <Select value={formData.factoryId} onValueChange={(v) => handleChange('factoryId', v)}>
                <SelectTrigger className={`bg-secondary border-border ${errors.factoryId ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Chọn nhà máy" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {factories.map(factory => (
                    <SelectItem key={factory.id} value={factory.id}>
                      {factory.name} ({factory.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.factoryId && <p className="text-xs text-destructive">{errors.factoryId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Bộ phận sử dụng</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="VD: Xưởng ép nhựa 1"
                className="bg-secondary border-border"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Phân loại thiết bị</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="group">Nhóm thiết bị *</Label>
              <Select value={formData.groupId} onValueChange={(v) => handleChange('groupId', v)}>
                <SelectTrigger className={`bg-secondary border-border ${errors.groupId ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Chọn nhóm thiết bị" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {Object.values(EQUIPMENT_GROUPS).map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.groupId && <p className="text-xs text-destructive">{errors.groupId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="machineType">Loại máy</Label>
              <Select 
                value={formData.machineType} 
                onValueChange={(v) => handleChange('machineType', v)}
                disabled={!formData.groupId}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder={formData.groupId ? "Chọn loại máy" : "Chọn nhóm TB trước"} />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {availableMachineTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Mức độ quan trọng</Label>
              <Select value={formData.priority} onValueChange={(v) => handleChange('priority', v)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="low">Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Thông tin kỹ thuật</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Hãng sản xuất</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => handleChange('manufacturer', e.target.value)}
                placeholder="VD: Haitian"
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="VD: MA2800III"
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => handleChange('serialNumber', e.target.value)}
                placeholder="VD: HT2023-001"
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearInService">Năm đưa vào sử dụng</Label>
              <Input
                id="yearInService"
                type="number"
                value={formData.yearInService}
                onChange={(e) => handleChange('yearInService', e.target.value)}
                placeholder="VD: 2021"
                min="1900"
                max={new Date().getFullYear() + 5}
                className="bg-secondary border-border"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ghi chú</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Thêm ghi chú về thiết bị..."
              rows={4}
              className="bg-secondary border-border resize-none"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={() => navigate('/equipments')} className="action-btn-secondary">
            Hủy
          </Button>
          {!isEditing && (
            <Button variant="secondary" onClick={() => handleSave(true)} className="action-btn-secondary">
              <Plus className="h-4 w-4" />
              Lưu & tạo mới
            </Button>
          )}
          <Button onClick={() => handleSave(false)} className="action-btn-primary">
            <Save className="h-4 w-4" />
            {isEditing ? 'Cập nhật' : 'Lưu'}
          </Button>
        </div>
      </div>
    </div>
  );
}
