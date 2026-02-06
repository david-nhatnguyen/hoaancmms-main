import { CalendarDays, User, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ASSIGNEES } from '@/data/pmPlanData';
import { cn } from '@/lib/utils';

export interface Step2Data {
  defaultDate: string;
  assignees: string[];
  maintenanceGroup: string;
  applyToAll: boolean;
  allowPerDeviceChange: boolean;
}

interface PMPlanStep2Props {
  data: Step2Data;
  onChange: (data: Partial<Step2Data>) => void;
}

const MAINTENANCE_GROUPS = [
  { id: 'team-a', name: 'Nhóm bảo trì A', members: 3 },
  { id: 'team-b', name: 'Nhóm bảo trì B', members: 4 },
  { id: 'team-c', name: 'Nhóm bảo trì C', members: 2 }
];

export function PMPlanStep2({ data, onChange }: PMPlanStep2Props) {
  const toggleAssignee = (assignee: string) => {
    const current = data.assignees;
    if (current.includes(assignee)) {
      onChange({ assignees: current.filter(a => a !== assignee) });
    } else {
      onChange({ assignees: [...current, assignee] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Default Execution Date */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Ngày thực hiện mặc định</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Ngày này sẽ được áp dụng cho tất cả thiết bị. Có thể điều chỉnh riêng ở bước sau.
        </p>
        <div className="relative max-w-xs">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={data.defaultDate}
            onChange={(e) => onChange({ defaultDate: e.target.value })}
            className="pl-10 h-11 bg-secondary/50 border-border"
          />
        </div>
      </div>

      {/* Assignees Selection */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Người phụ trách chính</Label>
          <p className="text-sm text-muted-foreground">
            Chọn một hoặc nhiều kỹ thuật viên phụ trách thực hiện kế hoạch này
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ASSIGNEES.map(assignee => (
            <label
              key={assignee}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                data.assignees.includes(assignee)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <Checkbox
                checked={data.assignees.includes(assignee)}
                onCheckedChange={() => toggleAssignee(assignee)}
                className="border-muted-foreground data-[state=checked]:bg-primary"
              />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium text-sm">{assignee}</span>
              </div>
            </label>
          ))}
        </div>

        {data.assignees.length > 0 && (
          <p className="text-sm text-primary">
            Đã chọn {data.assignees.length} người phụ trách
          </p>
        )}
      </div>

      {/* Maintenance Group (Optional) */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Nhóm bảo trì (tùy chọn)</Label>
          <p className="text-sm text-muted-foreground">
            Gán kế hoạch cho một nhóm bảo trì cụ thể
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MAINTENANCE_GROUPS.map(group => (
            <label
              key={group.id}
              className={cn(
                "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                data.maintenanceGroup === group.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <input
                type="radio"
                name="maintenanceGroup"
                value={group.id}
                checked={data.maintenanceGroup === group.id}
                onChange={(e) => onChange({ maintenanceGroup: e.target.value })}
                className="sr-only"
              />
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                data.maintenanceGroup === group.id ? "border-primary" : "border-muted-foreground"
              )}>
                {data.maintenanceGroup === group.id && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              <div className="flex items-center gap-2 flex-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{group.name}</p>
                  <p className="text-xs text-muted-foreground">{group.members} thành viên</p>
                </div>
              </div>
            </label>
          ))}
          <label
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
              !data.maintenanceGroup
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <input
              type="radio"
              name="maintenanceGroup"
              value=""
              checked={!data.maintenanceGroup}
              onChange={() => onChange({ maintenanceGroup: '' })}
              className="sr-only"
            />
            <div className={cn(
              "w-4 h-4 rounded-full border-2 flex items-center justify-center",
              !data.maintenanceGroup ? "border-primary" : "border-muted-foreground"
            )}>
              {!data.maintenanceGroup && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <span className="text-sm text-muted-foreground">Không gán nhóm</span>
          </label>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4 p-4 bg-secondary/30 rounded-xl">
        <h3 className="font-medium">Tùy chọn phân công</h3>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Áp dụng cùng người phụ trách cho tất cả thiết bị</Label>
            <p className="text-xs text-muted-foreground">
              Tự động gán người phụ trách đã chọn cho mọi thiết bị trong kế hoạch
            </p>
          </div>
          <Switch
            checked={data.applyToAll}
            onCheckedChange={(checked) => onChange({ applyToAll: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Cho phép thay đổi theo từng thiết bị</Label>
            <p className="text-xs text-muted-foreground">
              Có thể điều chỉnh người phụ trách riêng cho từng thiết bị ở bước tiếp theo
            </p>
          </div>
          <Switch
            checked={data.allowPerDeviceChange}
            onCheckedChange={(checked) => onChange({ allowPerDeviceChange: checked })}
          />
        </div>
      </div>
    </div>
  );
}
