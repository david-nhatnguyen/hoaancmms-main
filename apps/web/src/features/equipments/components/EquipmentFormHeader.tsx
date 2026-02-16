import { useNavigate } from 'react-router-dom';
import { Save, Cpu, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { Loader2 } from 'lucide-react';

interface EquipmentFormHeaderProps {
    isEditing: boolean;
    onSave: () => void;
    isSaving: boolean;
    isValid: boolean;
}

export function EquipmentFormHeader({
    isEditing,
    onSave,
    isSaving,
    isValid
}: EquipmentFormHeaderProps) {
    const navigate = useNavigate();

    const title = isEditing
        ? 'Cập nhật thiết bị'
        : 'Thêm thiết bị mới';

    const description = isEditing
        ? 'Quản lý thông tin chi tiết và cấu hình thiết bị hiện có trong hệ thống.'
        : 'Thiết lập hồ sơ cho thiết bị sản xuất mới để bắt đầu theo dõi bảo trì.';

    return (
        <PageHeader
            title={title}
            subtitle={
                <div className="flex items-center gap-2">
                    <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/equipments')}>THIẾT BỊ</span>
                    <span className="text-muted-foreground/50">/</span>
                    <span>{isEditing ? 'EDIT' : 'NEW'}</span>
                </div>
            }
            description={description}
            onGoBack={() => navigate('/equipments')}
            icon={<Cpu className="h-6 w-6 text-primary" />}
            actions={
                <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/equipments')}
                        className="flex-1 sm:flex-none h-9 gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Hủy bỏ</span>
                        <span className="sm:hidden">Hủy</span>
                    </Button>
                    <Button
                        size="sm"
                        onClick={onSave}
                        disabled={isSaving || !isValid}
                        className="flex-1 sm:flex-none h-9 min-w-[120px] shadow-sm gap-2"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo thiết bị'}
                    </Button>
                </div>
            }
        />
    );
}
