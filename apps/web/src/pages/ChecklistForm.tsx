import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  GripVertical,
  Copy,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  checklistTemplates, 
  CYCLE_LABELS, 
  CHECKLIST_STATUS_LABELS,
  ChecklistItem,
  ChecklistTemplate,
  createEmptyItem,
  generateChecklistCode
} from '@/data/checklistData';
import { EQUIPMENT_GROUPS } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FormData {
  code: string;
  name: string;
  equipmentGroupId: string;
  machineType: string;
  cycle: string;
  version: number;
  status: 'draft' | 'active' | 'inactive';
  notes: string;
  items: ChecklistItem[];
}

const initialFormData: FormData = {
  code: '',
  name: '',
  equipmentGroupId: '',
  machineType: '',
  cycle: 'monthly',
  version: 1,
  status: 'draft',
  notes: '',
  items: [createEmptyItem(1)]
};

export default function ChecklistForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id) && !searchParams.get('copy');
  const isCopying = Boolean(searchParams.get('copy'));

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [originalStatus, setOriginalStatus] = useState<string>('draft');

  // Get available machine types based on selected group
  const availableMachineTypes = useMemo(() => {
    if (!formData.equipmentGroupId) return [];
    return EQUIPMENT_GROUPS[formData.equipmentGroupId as keyof typeof EQUIPMENT_GROUPS]?.machineTypes || [];
  }, [formData.equipmentGroupId]);

  // Load checklist data
  useEffect(() => {
    const checklistId = id || searchParams.get('copy');
    if (checklistId) {
      const checklist = checklistTemplates.find(cl => cl.id === checklistId);
      if (checklist) {
        setFormData({
          code: isCopying ? generateChecklistCode(checklist.equipmentGroupId) : checklist.code,
          name: isCopying ? `${checklist.name} (Copy)` : checklist.name,
          equipmentGroupId: checklist.equipmentGroupId,
          machineType: checklist.machineType,
          cycle: checklist.cycle,
          version: isCopying ? 1 : checklist.version,
          status: isCopying ? 'draft' : checklist.status,
          notes: checklist.notes || '',
          items: checklist.items.map(item => ({ ...item, id: isCopying ? `item-${Date.now()}-${item.order}` : item.id }))
        });
        setOriginalStatus(checklist.status);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        code: generateChecklistCode('injection')
      }));
    }
  }, [id, searchParams, isCopying]);

  // Reset machine type when group changes
  useEffect(() => {
    if (formData.equipmentGroupId && !availableMachineTypes.includes(formData.machineType)) {
      setFormData(prev => ({ ...prev, machineType: '' }));
    }
    // Update code prefix when group changes
    if (formData.equipmentGroupId && !isEditing) {
      setFormData(prev => ({
        ...prev,
        code: generateChecklistCode(formData.equipmentGroupId)
      }));
    }
  }, [formData.equipmentGroupId, availableMachineTypes, isEditing]);

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemChange = (index: number, field: keyof ChecklistItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, createEmptyItem(prev.items.length + 1)]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) {
      toast.error('Checklist phải có ít nhất 1 hạng mục');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i + 1 }))
    }));
  };

  const duplicateItem = (index: number) => {
    const itemToCopy = formData.items[index];
    const newItem = {
      ...itemToCopy,
      id: `item-${Date.now()}`,
      order: formData.items.length + 1
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    toast.success('Đã sao chép hạng mục');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Tên checklist là bắt buộc';
    if (!formData.equipmentGroupId) newErrors.equipmentGroupId = 'Vui lòng chọn nhóm thiết bị';
    if (!formData.machineType) newErrors.machineType = 'Vui lòng chọn loại máy';
    
    // Validate items
    const hasEmptyTasks = formData.items.some(item => !item.maintenanceTask.trim());
    if (hasEmptyTasks) newErrors.items = 'Vui lòng nhập hạng mục bảo dưỡng cho tất cả các dòng';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (newStatus?: 'draft' | 'active') => {
    if (!validate()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    // Check if editing active checklist
    if (isEditing && originalStatus === 'active' && !showVersionDialog) {
      setShowVersionDialog(true);
      return;
    }

    const statusToSave = newStatus || formData.status;
    toast.success(
      statusToSave === 'active' 
        ? 'Checklist đã được áp dụng' 
        : 'Đã lưu bản nháp'
    );
    navigate('/checklists');
  };

  const handleCreateNewVersion = () => {
    setFormData(prev => ({ ...prev, version: prev.version + 1 }));
    setShowVersionDialog(false);
    toast.success(`Đã tạo phiên bản mới: v${formData.version + 1}`);
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/checklists')}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <p className="page-subtitle">THƯ VIỆN CHECKLIST</p>
            <div className="flex items-center gap-3">
              <h1 className="page-title">
                {isEditing ? 'Sửa Checklist' : isCopying ? 'Sao chép Checklist' : 'Tạo Checklist mới'}
              </h1>
              <span className="font-mono text-sm text-primary bg-primary/20 px-2.5 py-1 rounded-lg">
                {formData.code}
              </span>
              <span className={cn(
                'status-badge',
                formData.status === 'active' && 'bg-status-active/20 text-status-active',
                formData.status === 'draft' && 'bg-muted text-muted-foreground',
                formData.status === 'inactive' && 'bg-status-inactive/20 text-status-inactive'
              )}>
                {CHECKLIST_STATUS_LABELS[formData.status]}
              </span>
              <span className="text-sm text-muted-foreground">v{formData.version}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/checklists/${id || 'preview'}/preview`)}
              className="action-btn-secondary"
            >
              <Eye className="h-4 w-4" />
              Xem trước
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleSave('draft')}
              className="action-btn-secondary"
            >
              <Save className="h-4 w-4" />
              Lưu nháp
            </Button>
            <Button onClick={() => handleSave('active')} className="action-btn-primary">
              <CheckCircle2 className="h-4 w-4" />
              Áp dụng
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Section A - General Info */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">A. Thông tin chung</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2 lg:col-span-2">
              <Label>Tên checklist *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="VD: Injection Machine – Bảo dưỡng tháng"
                className={cn('bg-secondary border-border', errors.name && 'border-destructive')}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label>Chu kỳ bảo dưỡng</Label>
              <Select value={formData.cycle} onValueChange={(v) => handleChange('cycle', v)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {Object.entries(CYCLE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nhóm thiết bị *</Label>
              <Select value={formData.equipmentGroupId} onValueChange={(v) => handleChange('equipmentGroupId', v)}>
                <SelectTrigger className={cn('bg-secondary border-border', errors.equipmentGroupId && 'border-destructive')}>
                  <SelectValue placeholder="Chọn nhóm thiết bị" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {Object.values(EQUIPMENT_GROUPS).map(group => (
                    <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Loại máy *</Label>
              <Select 
                value={formData.machineType} 
                onValueChange={(v) => handleChange('machineType', v)}
                disabled={!formData.equipmentGroupId}
              >
                <SelectTrigger className={cn('bg-secondary border-border', errors.machineType && 'border-destructive')}>
                  <SelectValue placeholder={formData.equipmentGroupId ? "Chọn loại máy" : "Chọn nhóm TB trước"} />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {availableMachineTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 lg:col-span-3">
              <Label>Ghi chú</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Ghi chú về checklist..."
                rows={2}
                className="bg-secondary border-border resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section B - Checklist Items */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">B. Bảng Checklist</CardTitle>
            <Button onClick={addItem} size="sm" className="action-btn-primary">
              <Plus className="h-4 w-4" />
              Thêm dòng
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {errors.items && (
              <p className="text-xs text-destructive px-6 pb-2">{errors.items}</p>
            )}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="table-header-cell w-[50px]">STT</TableHead>
                    <TableHead className="table-header-cell min-w-[200px]">Hạng mục bảo dưỡng *</TableHead>
                    <TableHead className="table-header-cell min-w-[180px]">Tiêu chuẩn phán định</TableHead>
                    <TableHead className="table-header-cell min-w-[150px]">Phương pháp KT</TableHead>
                    <TableHead className="table-header-cell min-w-[180px]">Nội dung bảo dưỡng</TableHead>
                    <TableHead className="table-header-cell min-w-[120px]">Kết quả MĐ</TableHead>
                    <TableHead className="table-header-cell text-center w-[80px]">Bắt buộc</TableHead>
                    <TableHead className="table-header-cell text-center w-[80px]">Yêu cầu ảnh</TableHead>
                    <TableHead className="table-header-cell w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.items.map((item, index) => (
                    <TableRow key={item.id} className="border-border/50">
                      <TableCell className="text-center font-mono text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                          {item.order}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.maintenanceTask}
                          onChange={(e) => handleItemChange(index, 'maintenanceTask', e.target.value)}
                          placeholder="Nhập hạng mục..."
                          className="bg-secondary border-border h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.standard}
                          onChange={(e) => handleItemChange(index, 'standard', e.target.value)}
                          placeholder="Tiêu chuẩn..."
                          className="bg-secondary border-border h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.method}
                          onChange={(e) => handleItemChange(index, 'method', e.target.value)}
                          placeholder="Phương pháp..."
                          className="bg-secondary border-border h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.content}
                          onChange={(e) => handleItemChange(index, 'content', e.target.value)}
                          placeholder="Nội dung..."
                          className="bg-secondary border-border h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.expectedResult}
                          onChange={(e) => handleItemChange(index, 'expectedResult', e.target.value)}
                          placeholder="OK / NG..."
                          className="bg-secondary border-border h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={item.isRequired}
                          onCheckedChange={(checked) => handleItemChange(index, 'isRequired', checked)}
                          className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={item.requiresImage}
                          onCheckedChange={(checked) => handleItemChange(index, 'requiresImage', checked)}
                          className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => duplicateItem(index)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeItem(index)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 border-t border-border/50">
              <Button onClick={addItem} variant="outline" size="sm" className="action-btn-secondary">
                <Plus className="h-4 w-4" />
                Thêm hạng mục
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Version Dialog */}
      <AlertDialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Tạo phiên bản mới?</AlertDialogTitle>
            <AlertDialogDescription>
              Checklist này đang được áp dụng. Bạn có muốn tạo phiên bản mới (v{formData.version + 1}) không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateNewVersion} className="bg-primary">
              Tạo phiên bản mới
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
