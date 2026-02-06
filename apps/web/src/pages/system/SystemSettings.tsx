import { useState } from 'react';
import { 
  Save,
  Settings,
  Globe,
  Wrench,
  FileText,
  AlertTriangle,
  Bell,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { defaultSettings, SystemSettings } from '@/data/systemData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  isMobile?: boolean;
}

function SettingRow({ label, description, children, isMobile }: SettingRowProps) {
  return (
    <div className={cn(
      "border-b border-border/30 last:border-0",
      isMobile ? "py-3 space-y-2" : "flex items-center justify-between py-4"
    )}>
      <div className={cn("pr-4", !isMobile && "flex-1")}>
        <p className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>{label}</p>
        {description && <p className={cn("text-muted-foreground mt-0.5", isMobile ? "text-[10px]" : "text-xs")}>{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const isMobile = useIsMobile();

  const updateSetting = <K extends keyof SystemSettings>(
    section: K,
    key: keyof SystemSettings[K],
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    toast.success('Đã lưu cài đặt thành công');
    setHasChanges(false);
  };

  return (
    <div className={cn(
      "animate-fade-in max-w-full overflow-x-hidden",
      isMobile ? "px-4 py-3" : "p-6"
    )}>
      {/* Page Header */}
      <div className="mb-4">
        {!isMobile && <p className="page-subtitle">HỆ THỐNG</p>}
        <div className={cn(
          "flex items-center justify-between gap-2",
          isMobile && "flex-wrap"
        )}>
          <h1 className={cn(
            "font-bold",
            isMobile ? "text-base" : "page-title"
          )}>Cài đặt chung</h1>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges}
            className={cn(
              "action-btn-primary",
              isMobile && "h-9"
            )}
            size={isMobile ? "sm" : "default"}
          >
            <Save className="h-4 w-4" />
            <span className={isMobile ? "text-xs" : ""}>Lưu thay đổi</span>
          </Button>
        </div>
      </div>

      {/* Settings Accordion */}
      <div className="max-w-4xl">
        <Accordion type="multiple" defaultValue={['general', 'operations']} className="space-y-3">
          {/* General Settings */}
          <AccordionItem value="general" className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <AccordionTrigger className={cn(
              "hover:no-underline hover:bg-secondary/30",
              isMobile ? "px-3 py-3" : "px-6 py-4"
            )}>
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "rounded-lg bg-primary/10",
                  isMobile ? "p-1.5" : "p-2"
                )}>
                  <Globe className={cn("text-primary", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                </div>
                <div className="text-left">
                  <p className={cn("font-semibold", isMobile && "text-sm")}>Cài đặt chung</p>
                  {!isMobile && <p className="text-xs text-muted-foreground font-normal">Ngôn ngữ, múi giờ, định dạng</p>}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className={cn(isMobile ? "px-3 pb-3" : "px-6 pb-4")}>
              <SettingRow label="Ngôn ngữ hệ thống" isMobile={isMobile}>
                <Select value={settings.general.language} disabled>
                  <SelectTrigger className={cn(isMobile ? "w-[140px] h-9 text-xs" : "w-[180px]")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow label="Múi giờ" isMobile={isMobile}>
                <Select value={settings.general.timezone} disabled>
                  <SelectTrigger className={cn(isMobile ? "w-[140px] h-9 text-xs" : "w-[180px]")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow label="Định dạng ngày" isMobile={isMobile}>
                <Select 
                  value={settings.general.dateFormat}
                  onValueChange={(v) => updateSetting('general', 'dateFormat', v)}
                >
                  <SelectTrigger className={cn(isMobile ? "w-[140px] h-9 text-xs" : "w-[180px]")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow 
                label="Tên công ty / nhà máy" 
                description="Hiển thị trên báo cáo và xuất file"
                isMobile={isMobile}
              >
                <Input 
                  value={settings.general.companyName}
                  onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
                  className={cn(isMobile ? "w-full h-9 text-sm" : "w-[280px]")}
                />
              </SettingRow>
            </AccordionContent>
          </AccordionItem>

          {/* Operations Settings */}
          <AccordionItem value="operations" className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <AccordionTrigger className={cn(
              "hover:no-underline hover:bg-secondary/30",
              isMobile ? "px-3 py-3" : "px-6 py-4"
            )}>
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "rounded-lg bg-[hsl(var(--status-maintenance))]/10",
                  isMobile ? "p-1.5" : "p-2"
                )}>
                  <Wrench className={cn("text-[hsl(var(--status-maintenance))]", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                </div>
                <div className="text-left">
                  <p className={cn("font-semibold", isMobile && "text-sm")}>Quy tắc vận hành</p>
                  {!isMobile && <p className="text-xs text-muted-foreground font-normal">Điều chỉnh quy trình PM, WO</p>}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className={cn(isMobile ? "px-3 pb-3" : "px-6 pb-4")}>
              <SettingRow 
                label="Cho phép sửa kế hoạch PM sau khi Áp dụng"
                description="Kế hoạch đã áp dụng có thể được chỉnh sửa"
                isMobile={isMobile}
              >
                <Switch 
                  checked={settings.operations.allowEditAppliedPM}
                  onCheckedChange={(v) => updateSetting('operations', 'allowEditAppliedPM', v)}
                />
              </SettingRow>

              <SettingRow 
                label="Cho phép kéo thả lịch PM"
                description="Cho phép thay đổi ngày PM bằng kéo thả trên lịch"
                isMobile={isMobile}
              >
                <Switch 
                  checked={settings.operations.allowDragDropPM}
                  onCheckedChange={(v) => updateSetting('operations', 'allowDragDropPM', v)}
                />
              </SettingRow>

              <SettingRow 
                label="Bắt buộc ảnh khi Work Order có NG"
                description="Kỹ thuật viên phải chụp ảnh khi có hạng mục NG"
                isMobile={isMobile}
              >
                <Switch 
                  checked={settings.operations.requirePhotoOnNG}
                  onCheckedChange={(v) => updateSetting('operations', 'requirePhotoOnNG', v)}
                />
              </SettingRow>

              <SettingRow 
                label="Bắt buộc ghi chú khi NG"
                description="Phải nhập ghi chú giải thích cho hạng mục NG"
                isMobile={isMobile}
              >
                <Switch 
                  checked={settings.operations.requireNoteOnNG}
                  onCheckedChange={(v) => updateSetting('operations', 'requireNoteOnNG', v)}
                />
              </SettingRow>

              <SettingRow 
                label="Cho phép mở lại sự cố sau khi đóng"
                description="Sự cố đã đóng có thể được mở lại để xử lý tiếp"
                isMobile={isMobile}
              >
                <Switch 
                  checked={settings.operations.allowReopenIncident}
                  onCheckedChange={(v) => updateSetting('operations', 'allowReopenIncident', v)}
                />
              </SettingRow>
            </AccordionContent>
          </AccordionItem>

          {/* Work Order Settings */}
          <AccordionItem value="workorder" className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <AccordionTrigger className={cn(
              "hover:no-underline hover:bg-secondary/30",
              isMobile ? "px-3 py-3" : "px-6 py-4"
            )}>
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "rounded-lg bg-primary/10",
                  isMobile ? "p-1.5" : "p-2"
                )}>
                  <FileText className={cn("text-primary", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                </div>
                <div className="text-left">
                  <p className={cn("font-semibold", isMobile && "text-sm")}>Cài đặt Work Order</p>
                  {!isMobile && <p className="text-xs text-muted-foreground font-normal">Quy trình phiếu công việc</p>}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className={cn(isMobile ? "px-3 pb-3" : "px-6 pb-4")}>
              <SettingRow label="Trạng thái mặc định" isMobile={isMobile}>
                <Select 
                  value={settings.workOrder.defaultStatus}
                  onValueChange={(v) => updateSetting('workOrder', 'defaultStatus', v)}
                >
                  <SelectTrigger className={cn(isMobile ? "w-[140px] h-9 text-xs" : "w-[180px]")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Mới</SelectItem>
                    <SelectItem value="in-progress">Đang thực hiện</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow 
                label="Cho phép Xác nhận hoàn thành"
                description="Hiển thị bước xác nhận trước khi đóng WO"
                isMobile={isMobile}
              >
                <Switch 
                  checked={settings.workOrder.allowConfirmComplete}
                  onCheckedChange={(v) => updateSetting('workOrder', 'allowConfirmComplete', v)}
                />
              </SettingRow>

              <SettingRow 
                label="Bắt buộc người xác nhận khi đóng WO"
                description="Phải có người phê duyệt để hoàn thành phiếu"
                isMobile={isMobile}
              >
                <Switch 
                  checked={settings.workOrder.requireApproverOnClose}
                  onCheckedChange={(v) => updateSetting('workOrder', 'requireApproverOnClose', v)}
                />
              </SettingRow>
            </AccordionContent>
          </AccordionItem>

          {/* Corrective Maintenance Settings */}
          <AccordionItem value="corrective" className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <AccordionTrigger className={cn(
              "hover:no-underline hover:bg-secondary/30",
              isMobile ? "px-3 py-3" : "px-6 py-4"
            )}>
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "rounded-lg bg-destructive/10",
                  isMobile ? "p-1.5" : "p-2"
                )}>
                  <AlertTriangle className={cn("text-destructive", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                </div>
                <div className="text-left">
                  <p className={cn("font-semibold", isMobile && "text-sm")}>Cài đặt Bảo trì sự cố</p>
                  {!isMobile && <p className="text-xs text-muted-foreground font-normal">Quy trình xử lý sự cố</p>}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className={cn(isMobile ? "px-3 pb-3" : "px-6 pb-4")}>
              <SettingRow 
                label="Bắt buộc chọn mức độ ảnh hưởng"
                description="Phải chọn mức độ nghiêm trọng khi báo sự cố"
                isMobile={isMobile}
              >
                <Switch 
                  checked={settings.corrective.requireImpactLevel}
                  onCheckedChange={(v) => updateSetting('corrective', 'requireImpactLevel', v)}
                />
              </SettingRow>

              <SettingRow 
                label="Bắt buộc nhập nguyên nhân trước khi đóng"
                description="Phải ghi nhận nguyên nhân gốc rễ để đóng sự cố"
                isMobile={isMobile}
              >
                <Switch 
                  checked={settings.corrective.requireCauseBeforeClose}
                  onCheckedChange={(v) => updateSetting('corrective', 'requireCauseBeforeClose', v)}
                />
              </SettingRow>
            </AccordionContent>
          </AccordionItem>

          {/* Notification Settings */}
          <AccordionItem value="notifications" className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <AccordionTrigger className={cn(
              "hover:no-underline hover:bg-secondary/30",
              isMobile ? "px-3 py-3" : "px-6 py-4"
            )}>
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "rounded-lg bg-[hsl(var(--status-active))]/10",
                  isMobile ? "p-1.5" : "p-2"
                )}>
                  <Bell className={cn("text-[hsl(var(--status-active))]", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                </div>
                <div className="text-left">
                  <p className={cn("font-semibold", isMobile && "text-sm")}>Cài đặt thông báo</p>
                  {!isMobile && <p className="text-xs text-muted-foreground font-normal">Nhắc nhở và cảnh báo</p>}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className={cn(isMobile ? "px-3 pb-3" : "px-6 pb-4")}>
              <SettingRow 
                label="Bật thông báo công việc quá hạn"
                description="Gửi thông báo khi WO hoặc PM quá hạn"
                isMobile={isMobile}
              >
                <Switch 
                  checked={settings.notifications.enableOverdueAlert}
                  onCheckedChange={(v) => updateSetting('notifications', 'enableOverdueAlert', v)}
                />
              </SettingRow>

              <SettingRow 
                label="Bật thông báo sự cố mức độ Nặng"
                description="Gửi thông báo ngay khi có sự cố nghiêm trọng"
                isMobile={isMobile}
              >
                <Switch 
                  checked={settings.notifications.enableSevereIncidentAlert}
                  onCheckedChange={(v) => updateSetting('notifications', 'enableSevereIncidentAlert', v)}
                />
              </SettingRow>

              <SettingRow 
                label="Gửi nhắc việc trước ngày PM"
                description="Số ngày nhắc trước khi đến hạn PM"
                isMobile={isMobile}
              >
                <Select 
                  value={String(settings.notifications.pmReminderDays)}
                  onValueChange={(v) => updateSetting('notifications', 'pmReminderDays', Number(v))}
                >
                  <SelectTrigger className={cn(isMobile ? "w-[100px] h-9 text-xs" : "w-[120px]")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 ngày</SelectItem>
                    <SelectItem value="2">2 ngày</SelectItem>
                    <SelectItem value="3">3 ngày</SelectItem>
                    <SelectItem value="7">7 ngày</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Info Note */}
      <div className={cn(
        "max-w-4xl mt-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-2.5",
        isMobile ? "p-3" : "mt-6 p-4 gap-3"
      )}>
        <Info className={cn("text-primary shrink-0 mt-0.5", isMobile ? "h-4 w-4" : "h-5 w-5")} />
        <div className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
          <p className={cn("font-medium text-foreground", isMobile ? "mb-0.5" : "mb-1")}>Lưu ý</p>
          <p>Một số cài đặt có thể yêu cầu người dùng đăng nhập lại để áp dụng. Thay đổi cài đặt sẽ được ghi nhận trong Nhật ký hệ thống.</p>
        </div>
      </div>
    </div>
  );
}
