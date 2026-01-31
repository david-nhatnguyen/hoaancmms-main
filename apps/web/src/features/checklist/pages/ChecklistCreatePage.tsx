import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
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
import { checklistService } from '@/services/checklist.service';
import { ChecklistTemplate, ChecklistItem, CYCLE_LABELS } from '@/api/mock/checklistData';
import { MACHINE_TYPES } from '@/api/mock/mockData';
import { toast } from 'sonner';

export default function ChecklistCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<Partial<ChecklistTemplate>>({
    name: '',
    code: '',
    machineType: '',
    status: 'active',
    items: []
  });

  useEffect(() => {
    if (isEditing && id) {
      const fetch = async () => {
        const data = await checklistService.getById(id);
        if (data) setFormData(data);
      };
      fetch();
    }
  }, [isEditing, id]);

  const handleAddItem = () => {
    const newItem: ChecklistItem = {
      id: `new-${Date.now()}`,
      order: (formData.items?.length || 0) + 1,
      maintenanceTask: '',
      standard: '',
      method: '',
      content: '',
      expectedResult: '',
      isRequired: true,
      requiresImage: false
    };
    setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData(prev => ({ ...prev, items: prev.items?.filter(i => i.id !== itemId) }));
  };

  const updateItem = (itemId: string, field: keyof ChecklistItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.map(i => i.id === itemId ? { ...i, [field]: value } : i)
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.machineType) {
      toast.error('Vui lòng điền tên mẫu và loại máy');
      return;
    }
    
    try {
      if (isEditing && id) {
        await checklistService.update(id, formData);
        toast.success('Cập nhật thành công');
      } else {
        await checklistService.create(formData);
        toast.success('Tạo mới thành công');
      }
      navigate('/checklists');
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  // Flatten machine types for select
  const allMachineTypes = Object.values(MACHINE_TYPES).flat();

  return (
    <div className="p-6 animate-fade-in max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/checklists')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing ? 'Chỉnh sửa mẫu Checklist' : 'Tạo mẫu Checklist mới'}
            </h1>
          </div>
        </div>
        <Button onClick={handleSave} className="action-btn-primary">
          <Save className="h-4 w-4 mr-2" />
          Lưu mẫu
        </Button>
      </div>

      <div className="space-y-6">
        {/* General Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin chung</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tên mẫu checklist <span className="text-destructive">*</span></Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Ví dụ: Bảo dưỡng máy ép nhựa hàng tháng"
              />
            </div>
            <div className="space-y-2">
              <Label>Mã mẫu</Label>
              <Input 
                value={formData.code} 
                onChange={(e) => setFormData({ ...formData, code: e.target.value })} 
                placeholder="Tự động tạo nếu để trống"
              />
            </div>
            <div className="space-y-2">
              <Label>Loại thiết bị áp dụng <span className="text-destructive">*</span></Label>
              <Select 
                value={formData.machineType} 
                onValueChange={(v) => {
                  const group = Object.keys(MACHINE_TYPES).find(key => MACHINE_TYPES[key].includes(v));
                  setFormData({ 
                    ...formData, 
                    machineType: v,
                    equipmentGroupId: group as any
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại máy" />
                </SelectTrigger>
                <SelectContent>
                  {allMachineTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Chu kỳ</Label>
              <Select 
                value={formData.cycle} 
                onValueChange={(v: any) => setFormData({ ...formData, cycle: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CYCLE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v: any) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="draft">Nháp</SelectItem>
                  <SelectItem value="inactive">Ngừng sử dụng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-full space-y-2">
              <Label>Ghi chú</Label>
              <Textarea 
                value={formData.notes} 
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Các hạng mục kiểm tra</CardTitle>
            <Button variant="outline" size="sm" onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-2" /> Thêm mục
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.items?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                Chưa có hạng mục nào. Nhấn "Thêm mục" để bắt đầu.
              </div>
            ) : (
              formData.items?.map((item, index) => (
                <div key={item.id} className="flex gap-4 items-start p-4 border rounded-lg bg-secondary/10">
                  <div className="mt-2 h-6 w-6 rounded-full bg-background border flex items-center justify-center text-xs font-medium shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs text-muted-foreground">Công việc bảo trì</Label>
                      <Input 
                        value={item.maintenanceTask} 
                        onChange={(e) => updateItem(item.id, 'maintenanceTask', e.target.value)}
                        placeholder="Ví dụ: Kiểm tra mức dầu"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Tiêu chuẩn</Label>
                      <Input 
                        value={item.standard} 
                        onChange={(e) => updateItem(item.id, 'standard', e.target.value)}
                        placeholder="Ví dụ: Nằm giữa vạch Min-Max"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Phương pháp</Label>
                      <Input 
                        value={item.method} 
                        onChange={(e) => updateItem(item.id, 'method', e.target.value)}
                        placeholder="Ví dụ: Quan sát bằng mắt"
                      />
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive mt-1"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}