
import { useNavigate } from 'react-router-dom';
import { Eye, Save, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';

interface ChecklistHeaderProps {
  isEditing: boolean;
  isCopying: boolean;
  onSave: () => void;
  onPreview: () => void;
  isSaving: boolean;
  isValid: boolean;
}

export function ChecklistHeader({
  isEditing,
  isCopying,
  onSave,
  onPreview,
  isSaving,
  isValid
}: ChecklistHeaderProps) {
  const navigate = useNavigate();

  const title = isEditing
    ? 'Chỉnh sửa Checklist'
    : isCopying
    ? 'Sao chép Checklist'
    : 'Tạo Checklist mới';

  const description = isEditing 
    ? 'Cập nhật thông tin và các hạng mục kiểm tra cho quy trình bảo dưỡng hiện có.' 
    : 'Thiết lập quy trình kiểm tra định kỳ mới cho thiết bị để đảm bảo vận hành ổn định.';

  return (
    <PageHeader
      title={title}
      subtitle={
         <div className="flex items-center gap-2">
            <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/checklists')}>CHECKLISTS</span>
            <span className="text-muted-foreground/50">/</span>
            <span>{isEditing ? 'EDIT' : isCopying ? 'COPY' : 'NEW'}</span>
         </div>
      }
      description={description}
      onGoBack={() => navigate('/checklists')}
      icon={<PlusCircle className="h-6 w-6 text-primary" />}
      actions={
        <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="flex-1 sm:flex-none h-9 gap-2"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Xem trước</span>
            <span className="sm:hidden">Xem</span>
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving || !isValid}
            className="flex-1 sm:flex-none h-9 min-w-[120px] shadow-sm gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Đang lưu...' : 'Lưu checklist'}
          </Button>
        </div>
      }
    />
  );
}
