import { Calendar, Clock, Factory, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { factories } from '@/api/mock/mockData';
import { MONTHS } from '@/api/mock/pmPlanData';
import { cn } from '@/lib/utils';

export type PlanType = 'monthly' | 'daily' | 'hours';

export interface Step1Data {
  name: string;
  factoryId: string;
  planType: PlanType;
  month: number;
  year: number;
  dateFrom: string;
  dateTo: string;
  runningHours: number;
}

interface PMPlanStep1Props {
  data: Step1Data;
  onChange: (data: Partial<Step1Data>) => void;
}

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

export function PMPlanStep1({ data, onChange }: PMPlanStep1Props) {
  const autoGenerateName = () => {
    const factory = factories.find(f => f.id === data.factoryId);
    if (data.planType === 'monthly') {
      const monthLabel = MONTHS.find(m => m.value === data.month)?.label || '';
      return `Kế hoạch PM ${monthLabel}/${data.year}${factory ? ` - ${factory.name}` : ''}`;
    } else if (data.planType === 'daily') {
      return `Kế hoạch PM theo ngày${factory ? ` - ${factory.name}` : ''}`;
    }
    return `Kế hoạch PM theo giờ chạy${factory ? ` - ${factory.name}` : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Plan Name */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Tên kế hoạch</Label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={autoGenerateName()}
            className="pl-10 h-11 bg-secondary/50 border-border"
          />
        </div>
        <p className="text-xs text-muted-foreground">Để trống sẽ tự động tạo tên theo định dạng chuẩn</p>
      </div>

      {/* Factory Selection */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Nhà máy <span className="text-destructive">*</span></Label>
        <Select 
          value={data.factoryId} 
          onValueChange={(v) => onChange({ factoryId: v })}
        >
          <SelectTrigger className="h-11 bg-secondary/50 border-border">
            <div className="flex items-center gap-2">
              <Factory className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Chọn nhà máy" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {factories.filter(f => f.status === 'active').map(f => (
              <SelectItem key={f.id} value={f.id}>
                <div className="flex items-center gap-2">
                  <span>{f.name}</span>
                  <span className="text-xs text-muted-foreground">({f.location})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Plan Type */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Loại kế hoạch <span className="text-destructive">*</span></Label>
        <RadioGroup
          value={data.planType}
          onValueChange={(v) => onChange({ planType: v as PlanType })}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <label 
            className={cn(
              "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
              data.planType === 'monthly' 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}
          >
            <RadioGroupItem value="monthly" className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">Theo Tháng</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Lập kế hoạch bảo dưỡng cho toàn bộ tháng
              </p>
            </div>
          </label>

          <label 
            className={cn(
              "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
              data.planType === 'daily' 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}
          >
            <RadioGroupItem value="daily" className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">Theo Ngày</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Chọn khoảng thời gian cụ thể
              </p>
            </div>
          </label>

          <label 
            className={cn(
              "flex items-start gap-4 p-4 rounded-xl border-2 cursor-not-allowed opacity-60",
              "border-border"
            )}
          >
            <RadioGroupItem value="hours" className="mt-1" disabled />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Theo Giờ chạy</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">Sắp ra mắt</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Bảo dưỡng dựa trên số giờ vận hành
              </p>
            </div>
          </label>
        </RadioGroup>
      </div>

      {/* Conditional Fields based on Plan Type */}
      {data.planType === 'monthly' && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-xl">
          <div className="space-y-2">
            <Label>Tháng <span className="text-destructive">*</span></Label>
            <Select 
              value={data.month.toString()} 
              onValueChange={(v) => onChange({ month: parseInt(v) })}
            >
              <SelectTrigger className="h-11 bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {MONTHS.map(m => (
                  <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Năm <span className="text-destructive">*</span></Label>
            <Select 
              value={data.year.toString()} 
              onValueChange={(v) => onChange({ year: parseInt(v) })}
            >
              <SelectTrigger className="h-11 bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {YEARS.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {data.planType === 'daily' && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-xl">
          <div className="space-y-2">
            <Label>Từ ngày <span className="text-destructive">*</span></Label>
            <Input
              type="date"
              value={data.dateFrom}
              onChange={(e) => onChange({ dateFrom: e.target.value })}
              className="h-11 bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label>Đến ngày <span className="text-destructive">*</span></Label>
            <Input
              type="date"
              value={data.dateTo}
              onChange={(e) => onChange({ dateTo: e.target.value })}
              className="h-11 bg-background border-border"
            />
          </div>
        </div>
      )}

      {data.planType === 'hours' && (
        <div className="p-4 bg-secondary/30 rounded-xl">
          <div className="space-y-2 max-w-xs">
            <Label>Số giờ vận hành</Label>
            <Input
              type="number"
              value={data.runningHours}
              onChange={(e) => onChange({ runningHours: parseInt(e.target.value) || 0 })}
              placeholder="Ví dụ: 500"
              className="h-11 bg-background border-border"
              disabled
            />
            <p className="text-xs text-muted-foreground">Tính năng đang phát triển</p>
          </div>
        </div>
      )}
    </div>
  );
}