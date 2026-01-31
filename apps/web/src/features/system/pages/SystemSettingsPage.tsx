import { useState, useEffect } from 'react';
import { 
  Save,
  Globe,
  Wrench,
  FileText,
  AlertTriangle,
  Bell,
  Info,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { SystemSettings } from '@/api/mock/systemData';
import { settingsService } from '@/services/settings.service';
import { toast } from 'sonner';

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border/30 last:border-0">
      <div className="flex-1 pr-4">
        <p className="font-medium text-sm">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsService.getSettings();
        setSettings(data);
      } catch (error) {
        toast.error('Không thể tải cài đặt hệ thống');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const updateSetting = <K extends keyof SystemSettings>(
    section: K,
    key: keyof SystemSettings[K],
    value: string | boolean
  ) => {
    if (!settings) return;
    setSettings(prev => prev ? ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }) : null);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await settingsService.updateSettings(settings);
      toast.success('Đã lưu cài đặt thành công');
      setHasChanges(false);
    } catch (error) {
      toast.error('Lỗi khi lưu cài đặt');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <p className="text-sm font-medium text-muted-foreground mb-1">HỆ THỐNG</p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Cài đặt chung</h1>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || saving}
            className="min-w-[140px]"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

      {/* Settings Accordion */}
      <div className="space-y-6">
        <Accordion type="multiple" defaultValue={['general', 'operations']} className="space-y-4">
          {/* General Settings */}
          <AccordionItem value="general" className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Cài đặt chung</p>
                  <p className="text-xs text-muted-foreground font-normal">Ngôn ngữ, múi giờ, định dạng</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <SettingRow label="Ngôn ngữ hệ thống">
                <Select value={settings.general.language} disabled>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow label="Múi giờ">
                <Select value={settings.general.timezone} disabled>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow label="Định dạng ngày">
                <Select 
                  value={settings.general.dateFormat}
                  onValueChange={(v) => updateSetting('general', 'dateFormat', v)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow label="Tên công ty / nhà máy" description="Hiển thị trên báo cáo và xuất file">
                <Input 
                  value={settings.general.companyName}
                  onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
                  className="w-[280px]"
                />
              </SettingRow>
            </AccordionContent>
          </AccordionItem>

          {/* Operations Settings */}
          <AccordionItem value="operations" className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Wrench className="h-4 w-4 text-orange-500" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Quy tắc vận hành</p>
                  <p className="text-xs text-muted-foreground font-normal">Điều chỉnh quy trình PM, WO</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <SettingRow label="Cho phép sửa kế hoạch PM sau khi Áp dụng">
                <Switch 
                  checked={settings.operations.allowEditAppliedPM}
                  onCheckedChange={(v) => updateSetting('operations', 'allowEditAppliedPM', v)}
                />
              </SettingRow>
              <SettingRow label="Cho phép kéo thả lịch PM">
                <Switch 
                  checked={settings.operations.allowDragDropPM}
                  onCheckedChange={(v) => updateSetting('operations', 'allowDragDropPM', v)}
                />
              </SettingRow>
              <SettingRow label="Bắt buộc ảnh khi Work Order có NG">
                <Switch 
                  checked={settings.operations.requirePhotoOnNG}
                  onCheckedChange={(v) => updateSetting('operations', 'requirePhotoOnNG', v)}
                />
              </SettingRow>
            </AccordionContent>
          </AccordionItem>

          {/* Work Order Settings */}
          <AccordionItem value="workorder" className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <FileText className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Cài đặt Work Order</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <SettingRow label="Trạng thái mặc định">
                <Select 
                  value={settings.workOrder.defaultStatus}
                  onValueChange={(v) => updateSetting('workOrder', 'defaultStatus', v)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Mới</SelectItem>
                    <SelectItem value="in-progress">Đang thực hiện</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow label="Bắt buộc người xác nhận khi đóng WO">
                <Switch 
                  checked={settings.workOrder.requireApproverOnClose}
                  onCheckedChange={(v) => updateSetting('workOrder', 'requireApproverOnClose', v)}
                />
              </SettingRow>
            </AccordionContent>
          </AccordionItem>

          {/* Notification Settings */}
          <AccordionItem value="notifications" className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Bell className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Cài đặt thông báo</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <SettingRow label="Bật thông báo công việc quá hạn">
                <Switch 
                  checked={settings.notifications.enableOverdueAlert}
                  onCheckedChange={(v) => updateSetting('notifications', 'enableOverdueAlert', v)}
                />
              </SettingRow>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Lưu ý</p>
          <p>Một số cài đặt có thể yêu cầu người dùng đăng nhập lại để áp dụng.</p>
        </div>
      </div>
    </div>
  );
}