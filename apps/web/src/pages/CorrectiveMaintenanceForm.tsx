import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Camera,
  Send,
  Plus,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SEVERITY_LABELS, SEVERITY_DESCRIPTIONS, generateCMCode } from '@/data/correctiveMaintenanceData';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock equipment data
const EQUIPMENT_LIST = [
  { id: 'eq-imm-01', code: 'IMM-01', name: 'Injection Molding Machine 280T', group: 'Máy ép nhựa', type: 'Hydraulic 280T' },
  { id: 'eq-imm-02', code: 'IMM-02', name: 'Injection Molding Machine 350T', group: 'Máy ép nhựa', type: 'Hydraulic 350T' },
  { id: 'eq-cnc-01', code: 'CNC-01', name: 'CNC Machining Center', group: 'Máy gia công khuôn & Đo lường', type: 'CNC 5-axis' },
  { id: 'eq-cnc-02', code: 'CNC-02', name: 'CNC Wire EDM', group: 'Máy gia công khuôn & Đo lường', type: 'Wire EDM' },
  { id: 'eq-cmm-01', code: 'CMM-01', name: 'CMM Coordinate Measuring Machine', group: 'Máy gia công khuôn & Đo lường', type: 'Bridge CMM' },
];

export default function CorrectiveMaintenanceForm() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [showEquipmentList, setShowEquipmentList] = useState(false);
  
  const [formData, setFormData] = useState({
    equipmentId: '',
    equipmentCode: '',
    equipmentName: '',
    equipmentGroup: '',
    machineType: '',
    reportedAt: new Date().toISOString().slice(0, 16),
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
    reportedBy: ''
  });

  const filteredEquipment = EQUIPMENT_LIST.filter(eq =>
    eq.code.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
    eq.name.toLowerCase().includes(equipmentSearch.toLowerCase())
  );

  const handleSelectEquipment = (equipment: typeof EQUIPMENT_LIST[0]) => {
    setFormData({
      ...formData,
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.name,
      equipmentGroup: equipment.group,
      machineType: equipment.type
    });
    setEquipmentSearch(equipment.code + ' - ' + equipment.name);
    setShowEquipmentList(false);
  };

  const handleSubmit = (createRepair: boolean) => {
    if (!formData.equipmentId) {
      toast.error('Vui lòng chọn thiết bị');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Vui lòng mô tả hiện tượng');
      return;
    }
    if (!formData.reportedBy.trim()) {
      toast.error('Vui lòng nhập tên người báo hỏng');
      return;
    }

    const code = generateCMCode();
    
    if (createRepair) {
      toast.success(`Đã tạo phiếu sửa chữa ${code}`);
      navigate('/corrective-maintenance');
    } else {
      toast.success(`Đã gửi báo hỏng ${code}`);
      navigate('/corrective-maintenance');
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-full overflow-x-hidden">
      {/* Header */}
      <div className={cn(
        "sticky top-0 z-40 bg-card border-b border-border shadow-sm",
        isMobile ? "px-4 py-3" : "p-4"
      )}>
        <div className="flex items-center gap-3">
          {!isMobile && (
            <Button variant="ghost" size="icon" onClick={() => navigate('/corrective-maintenance')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <p className={cn(
              "text-muted-foreground uppercase tracking-wider",
              isMobile ? "text-[10px]" : "text-xs"
            )}>BÁO HỎNG THIẾT BỊ</p>
            <h1 className={cn(
              "font-bold",
              isMobile ? "text-base" : "text-xl"
            )}>Tạo phiếu sự cố mới</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className={cn(
        "max-w-2xl mx-auto",
        isMobile ? "px-4 py-3" : "p-4"
      )}>
        <div className={cn(
          "bg-card rounded-xl border border-border/50",
          isMobile ? "p-4 space-y-4" : "p-6 space-y-6"
        )}>
          
          {/* Equipment Selection */}
          <div className="space-y-1.5">
            <Label className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
              Thiết bị <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Search className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
                isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
              )} />
              <Input
                placeholder="Tìm kiếm theo mã hoặc tên thiết bị..."
                value={equipmentSearch}
                onChange={(e) => {
                  setEquipmentSearch(e.target.value);
                  setShowEquipmentList(true);
                }}
                onFocus={() => setShowEquipmentList(true)}
                className={cn("pl-9", isMobile && "h-9 text-sm")}
              />
              {showEquipmentList && equipmentSearch && (
                <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
                  {filteredEquipment.length === 0 ? (
                    <div className={cn(
                      "text-muted-foreground text-center",
                      isMobile ? "p-2.5 text-xs" : "p-3 text-sm"
                    )}>
                      Không tìm thấy thiết bị
                    </div>
                  ) : (
                    filteredEquipment.map(eq => (
                      <div
                        key={eq.id}
                        onClick={() => handleSelectEquipment(eq)}
                        className={cn(
                          "hover:bg-secondary cursor-pointer border-b border-border/50 last:border-0",
                          isMobile ? "p-2.5" : "p-3"
                        )}
                      >
                        <p className={cn("font-medium", isMobile && "text-sm")}>{eq.code} - {eq.name}</p>
                        <p className={cn("text-muted-foreground", isMobile ? "text-[10px]" : "text-xs")}>{eq.group} | {eq.type}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Auto-filled Equipment Info */}
          {formData.equipmentId && (
            <div className={cn(
              "grid gap-3 bg-secondary/30 rounded-lg",
              isMobile ? "grid-cols-1 p-3" : "grid-cols-2 gap-4 p-4"
            )}>
              <div>
                <span className={cn("text-muted-foreground", isMobile ? "text-[10px]" : "text-xs")}>Nhóm thiết bị</span>
                <p className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>{formData.equipmentGroup}</p>
              </div>
              <div>
                <span className={cn("text-muted-foreground", isMobile ? "text-[10px]" : "text-xs")}>Loại máy</span>
                <p className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>{formData.machineType}</p>
              </div>
            </div>
          )}

          {/* Report Time */}
          <div className="space-y-1.5">
            <Label className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
              Thời điểm xảy ra sự cố <span className="text-destructive">*</span>
            </Label>
            <Input
              type="datetime-local"
              value={formData.reportedAt}
              onChange={(e) => setFormData({ ...formData, reportedAt: e.target.value })}
              className={isMobile ? "h-9 text-sm" : ""}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
              Mô tả hiện tượng <span className="text-destructive">*</span>
            </Label>
            <Textarea
              placeholder="Mô tả chi tiết hiện tượng, tiếng ồn, lỗi hiển thị..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={isMobile ? 3 : 4}
              className={cn("resize-none", isMobile && "text-sm")}
            />
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
              Mức độ ảnh hưởng <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={formData.severity}
              onValueChange={(value) => setFormData({ ...formData, severity: value as 'low' | 'medium' | 'high' })}
              className={cn(
                "grid gap-2",
                isMobile ? "grid-cols-1" : "grid-cols-3 gap-3"
              )}
            >
              {(['low', 'medium', 'high'] as const).map((severity) => (
                <label
                  key={severity}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 cursor-pointer transition-all",
                    isMobile ? "p-3" : "flex-col p-4",
                    formData.severity === severity
                      ? severity === 'low' 
                        ? "border-[hsl(var(--status-active))] bg-[hsl(var(--status-active))]/10"
                        : severity === 'medium'
                        ? "border-[hsl(var(--status-maintenance))] bg-[hsl(var(--status-maintenance))]/10"
                        : "border-destructive bg-destructive/10"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <RadioGroupItem value={severity} className="sr-only" />
                  <span className={cn(
                    "font-semibold",
                    isMobile ? "text-sm" : "mb-1",
                    severity === 'low' && "text-[hsl(var(--status-active))]",
                    severity === 'medium' && "text-[hsl(var(--status-maintenance))]",
                    severity === 'high' && "text-destructive"
                  )}>
                    {SEVERITY_LABELS[severity]}
                  </span>
                  <span className={cn(
                    "text-muted-foreground",
                    isMobile ? "text-xs flex-1" : "text-xs text-center"
                  )}>
                    {SEVERITY_DESCRIPTIONS[severity]}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Image Upload */}
          <div className="space-y-1.5">
            <Label className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>Hình ảnh / Video đính kèm</Label>
            <Button 
              variant="outline" 
              className={cn(
                "w-full border-dashed",
                isMobile ? "h-16" : "h-24"
              )}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Camera className={cn(isMobile ? "h-5 w-5" : "h-6 w-6")} />
                <span className={cn(isMobile ? "text-xs" : "text-sm")}>Chụp ảnh hoặc tải lên</span>
              </div>
            </Button>
          </div>

          {/* Reporter */}
          <div className="space-y-1.5">
            <Label className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
              Người báo hỏng <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Nhập tên người báo hỏng..."
              value={formData.reportedBy}
              onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
              className={isMobile ? "h-9 text-sm" : ""}
            />
          </div>

          {/* Actions */}
          <div className={cn(
            "flex flex-col gap-2",
            isMobile ? "pt-2" : "pt-4 gap-3"
          )}>
            <Button 
              onClick={() => handleSubmit(true)}
              className={cn(
                "w-full action-btn-primary",
                isMobile ? "h-10" : "h-12 text-base"
              )}
            >
              <Plus className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
              <span className={isMobile ? "text-sm" : ""}>Gửi & Tạo phiếu sửa chữa</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleSubmit(false)}
              className={cn(
                "w-full",
                isMobile ? "h-10" : "h-12"
              )}
            >
              <Send className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
              <span className={isMobile ? "text-sm" : ""}>Gửi báo hỏng</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
