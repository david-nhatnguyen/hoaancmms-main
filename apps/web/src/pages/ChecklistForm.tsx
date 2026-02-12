import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,

  Eye,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { useCreateTemplate } from '@/features/checklists/hooks/useCreateTemplate';
import { useChecklistTemplate } from '@/features/checklists/hooks/useChecklistTemplates';
import {
  ChecklistCycle,
  ChecklistStatus,
  CYCLE_LABELS,
} from '@/features/checklists/types/checklist.types';
import { EquipmentSearchInput, UserSearchInput } from '@/features/checklists/components';
import { transformFormToDto } from '@/features/checklists/handlers/templateFormHandlers';

// ============================================================================
// SCHEMA
// ============================================================================

const checklistItemSchema = z.object({
  maintenanceTask: z.string().min(1, 'Nội dung bảo dưỡng không được để trống'),
  judgmentStandard: z.string().default(''),
  inspectionMethod: z.string().default(''),
  maintenanceContent: z.string().default(''),
  expectedResult: z.string().default(''),
  isRequired: z.boolean().default(false),
  requiresImage: z.boolean().default(false),
  requiresNote: z.boolean().default(false),
  order: z.number().default(0),
});

const checklistFormSchema = z.object({
  name: z.string().min(1, 'Tên checklist không được để trống'),
  description: z.string().optional(),
  equipmentId: z.string().min(1, 'Vui lòng chọn thiết bị'),
  // We keep the full object for display purposes in the UI
  equipment: z.any().optional(),
  assignedUserId: z.string().optional(),
  assignedUser: z.any().optional(),
  department: z.string().optional(),
  maintenanceStartDate: z.string().optional(),
  cycle: z.nativeEnum(ChecklistCycle),
  status: z.nativeEnum(ChecklistStatus).default(ChecklistStatus.DRAFT),
  notes: z.string().optional(),
  items: z.array(checklistItemSchema).min(1, 'Checklist phải có ít nhất 1 hạng mục'),
});

type ChecklistFormValues = z.infer<typeof checklistFormSchema>;

const defaultValues: ChecklistFormValues = {
  name: '',
  description: '',
  equipmentId: '',
  equipment: null,
  assignedUserId: '',
  assignedUser: null,
  department: '',
  maintenanceStartDate: '',
  cycle: ChecklistCycle.MONTHLY,
  status: ChecklistStatus.DRAFT,
  notes: '',
  items: [
    {
      maintenanceTask: '',
      judgmentStandard: '',
      inspectionMethod: '',
      maintenanceContent: '',
      expectedResult: '',
      isRequired: false,
      requiresImage: false,
      requiresNote: false,
      order: 0,
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function ChecklistForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id) && !searchParams.get('copy');
  const isCopying = Boolean(searchParams.get('copy'));

  // Hooks
  const createTemplate = useCreateTemplate();
  const { data: existingTemplate } = useChecklistTemplate(id || '');

  // Form
  const form = useForm<ChecklistFormValues>({
    resolver: zodResolver(checklistFormSchema) as any,
    defaultValues,
    mode: 'onChange',
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Load existing template data
  useEffect(() => {
    if (existingTemplate) {
      const formData: ChecklistFormValues = {
        name: isCopying ? `${existingTemplate.name} (Copy)` : existingTemplate.name,
        description: existingTemplate.description || '',
        equipmentId: existingTemplate.equipmentId || '',
        equipment: existingTemplate.equipment || null,
        assignedUserId: existingTemplate.assignedUserId || '',
        assignedUser: existingTemplate.assignedUser || null,
        department: existingTemplate.department || '',
        maintenanceStartDate: existingTemplate.maintenanceStartDate || '',
        cycle: existingTemplate.cycle,
        status: isCopying ? ChecklistStatus.DRAFT : existingTemplate.status,
        notes: existingTemplate.notes || '',
        items: existingTemplate.items.map((item) => ({
          maintenanceTask: item.maintenanceTask,
          judgmentStandard: item.judgmentStandard || '',
          inspectionMethod: item.inspectionMethod || '',
          maintenanceContent: item.maintenanceContent || '',
          expectedResult: item.expectedResult || '',
          isRequired: item.isRequired,
          requiresImage: item.requiresImage,
          requiresNote: item.requiresNote,
          order: item.order || 0,
        })),
      };

      if (!existingTemplate.items || existingTemplate.items.length === 0) {
        formData.items = defaultValues.items;
      }

      form.reset(formData);
    }
  }, [existingTemplate, isCopying, form]);

  const onSubmit = async (data: ChecklistFormValues) => {
    try {
      // Transform data to match API DTO
      const dto = transformFormToDto(data as any); 
      // Note: transformFormToDto expects strict TemplateFormData, but our zod schema is slightly looser (optional strings vs empty strings).
      // We might need to ensure the transformation handles empty strings correctly.
      // The validation is already done by Zod.
      
      await createTemplate.mutateAsync(dto);
      toast.success(isEditing ? 'Cập nhật checklist thành công' : 'Tạo checklist thành công');
      navigate('/checklists');
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Có lỗi xảy ra khi lưu checklist');
    }
  };

  const handlePreview = () => {
    toast.info('Tính năng xem trước đang được phát triển');
  };

  const handleAddItem = () => {
    append({
      maintenanceTask: '',
      judgmentStandard: '',
      inspectionMethod: '',
      maintenanceContent: '',
      expectedResult: '',
      isRequired: false,
      requiresImage: false,
      requiresNote: false,
      order: 0,
    });
  };

  return (
    <div className="p-6 animate-fade-in max-w-7xl mx-auto">
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">THƯ VIỆN CHECKLIST</p>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing
                ? 'Chỉnh sửa Checklist'
                : isCopying
                ? 'Sao chép Checklist'
                : 'Tạo Checklist mới'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePreview}
            >
              <Eye className="h-4 w-4 mr-2" />
              Xem trước
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={createTemplate.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {createTemplate.isPending ? 'Đang lưu...' : 'Lưu checklist'}
            </Button>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên checklist <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Injection Machine – Bảo dưỡng 6 tháng" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Mô tả chi tiết về checklist này..." 
                        rows={2} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Equipment Search - REQUIRED */}
                <FormField
                  control={form.control}
                  name="equipment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Thiết bị áp dụng <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <EquipmentSearchInput
                          value={field.value}
                          onChange={(equipment) => {
                            field.onChange(equipment);
                            form.setValue('equipmentId', equipment?.id || '');
                            if (equipment?.id) {
                              form.clearErrors('equipmentId');
                            }
                          }}
                          required
                          error={form.formState.errors.equipmentId?.message}
                        />
                      </FormControl>
                      <FormDescription>
                        Tìm kiếm theo mã hoặc tên thiết bị
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cycle */}
                <FormField
                  control={form.control}
                  name="cycle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Chu kỳ bảo dưỡng <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn chu kỳ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ChecklistCycle).map((cycle) => (
                            <SelectItem key={cycle} value={cycle}>
                              {CYCLE_LABELS[cycle]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assigned User - OPTIONAL */}
                <FormField
                  control={form.control}
                  name="assignedUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Người phụ trách</FormLabel>
                      <FormControl>
                        <UserSearchInput
                          value={field.value}
                          onChange={(user) => {
                            field.onChange(user);
                            form.setValue('assignedUserId', user?.id || '');
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Người chịu trách nhiệm thực hiện checklist này
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Department - OPTIONAL */}
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bộ phận sử dụng</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Bộ phận sản xuất" {...field} />
                      </FormControl>
                      <FormDescription>
                        Bộ phận hoặc phòng ban sử dụng checklist này
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Maintenance Start Date - OPTIONAL */}
              <FormField
                control={form.control}
                name="maintenanceStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày bắt đầu bảo dưỡng</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        value={field.value ? field.value.split('T')[0] : ''}
                        onChange={(e) => {
                          const dateValue = e.target.value;
                          field.onChange(dateValue ? new Date(dateValue).toISOString() : '');
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Ngày bắt đầu tính chu kỳ bảo dưỡng
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú bổ sung</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ghi chú khác..." 
                        rows={2} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Checklist Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle>Danh sách hạng mục kiểm tra</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Định nghĩa các bước kiểm tra cụ thể. Kéo thả để sắp xếp lại (tính năng sắp phát triển).
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm hạng mục
              </Button>
            </CardHeader>
            <CardContent>
              {form.formState.errors.items?.root && (
                 <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive font-medium">
                    {form.formState.errors.items.root.message}
                 </div>
              )}
              
              <div className="relative w-full overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead className="min-w-[200px]">Nội dung bảo dưỡng <span className="text-destructive">*</span></TableHead>
                      <TableHead className="min-w-[150px]">Tiêu chuẩn</TableHead>
                      <TableHead className="min-w-[150px]">Phương pháp</TableHead>
                      <TableHead className="min-w-[150px]">Mô tả chi tiết</TableHead>
                      <TableHead className="min-w-[100px]">Kết quả mong đợi</TableHead>
                      <TableHead className="w-[80px] text-center">Bắt buộc</TableHead>
                      <TableHead className="w-[80px] text-center">Ảnh</TableHead>
                      <TableHead className="w-[80px] text-center">Ghi chú</TableHead>
                      <TableHead className="w-[100px] text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id} className="group">
                        <TableCell className="font-medium text-center text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.maintenanceTask`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Nội dung" {...field} className={cn(form.formState.errors.items?.[index]?.maintenanceTask && "border-destructive")} />
                                </FormControl>
                                {/* We hide individual usage error messages to save space, but highlight the border */}
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.judgmentStandard`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Tiêu chuẩn" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.inspectionMethod`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Phương pháp" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.maintenanceContent`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Chi tiết" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.expectedResult`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Kết quả" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <FormField
                            control={form.control}
                            name={`items.${index}.isRequired`}
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-center space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <FormField
                            control={form.control}
                            name={`items.${index}.requiresImage`}
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-center space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <FormField
                            control={form.control}
                            name={`items.${index}.requiresNote`}
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-center space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => move(index, index - 1)}
                              disabled={index === 0}
                            >
                              <MoveUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => move(index, index + 1)}
                              disabled={index === fields.length - 1}
                            >
                              <MoveDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => {
                                if (fields.length > 1) {
                                  remove(index);
                                } else {
                                  toast.error("Phải có ít nhất 1 hạng mục");
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
