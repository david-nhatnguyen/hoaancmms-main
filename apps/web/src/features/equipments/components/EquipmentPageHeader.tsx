import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, FileSpreadsheet, Download } from 'lucide-react';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { useIsMobile } from '@/hooks/use-mobile';

export function EquipmentPageHeader() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <MobilePageHeader
      subtitle="QUẢN LÝ TÀI SẢN"
      title="Danh sách Thiết bị"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="action-btn-secondary hidden md:flex">
            <FileSpreadsheet className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" className="action-btn-secondary hidden md:flex">
            <Download className="h-4 w-4" />
            Xuất
          </Button>
          <Button
            onClick={() => navigate('/equipments/new')}
            className="action-btn-primary"
            size={isMobile ? "sm" : "default"}
          >
            <Plus className="h-4 w-4" />
            {!isMobile && "Thêm thiết bị"}
          </Button>
        </div>
      }
    />
  );
}
