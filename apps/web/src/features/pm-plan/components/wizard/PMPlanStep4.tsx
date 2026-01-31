import { 
  Calendar, 
  Factory, 
  User, 
  CheckCircle2,
  AlertCircle,
  ClipboardList
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { factories, equipments } from '@/api/mock/mockData';
import { MONTHS } from '@/api/mock/pmPlanData';
import { cn } from '@/lib/utils';
import type { Step2Data } from './PMPlanStep2';
import type { PMPlanEquipmentItem } from './PMPlanStep3';
import type { Step1Data } from './PMPlanStep1';

export type Step4Data = Step1Data

interface PMPlanStep4Props {
  step1Data: Step1Data;
  step2Data: Step2Data;
  items: PMPlanEquipmentItem[];
}

export function PMPlanStep4({ step1Data, step2Data, items }: PMPlanStep4Props) {
  const factory = factories.find(f => f.id === step1Data.factoryId);

  const totalEquipment = items.length;
  const missingChecklist = items.filter(i => !i.checklistId).length;
  const missingDate = items.filter(i => !i.plannedDate).length;
  const isValid = missingChecklist === 0 && missingDate === 0 && items.length > 0;

  const getPlanTypeLabel = () => {
    switch (step1Data.planType) {
      case 'monthly': {
        const monthLabel = MONTHS.find(m => m.value === step1Data.month)?.label || '';
        return `${monthLabel}/${step1Data.year}`;
      }
      case 'daily':
        return `${step1Data.dateFrom} → ${step1Data.dateTo}`;
      case 'hours':
        return `${step1Data.runningHours} giờ chạy`;
      default:
        return '';
    }
  };

  const getPlanTypeName = () => {
    switch (step1Data.planType) {
      case 'monthly': return 'Theo tháng';
      case 'daily': return 'Theo ngày';
      case 'hours': return 'Theo giờ chạy';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      <div className={cn(
        "p-4 rounded-xl flex items-center gap-3",
        isValid 
          ? "bg-status-active/10 border border-status-active/20" 
          : "bg-destructive/10 border border-destructive/20"
      )}>
        {isValid ? (
          <>
            <CheckCircle2 className="h-6 w-6 text-[hsl(var(--status-active))]" />
            <div>
              <p className="font-medium text-[hsl(var(--status-active))]">
                Kế hoạch sẵn sàng áp dụng
              </p>
              <p className="text-sm text-muted-foreground">
                Tất cả thiết bị đã được gán checklist và ngày kế hoạch
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="h-6 w-6 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                Kế hoạch chưa hoàn chỉnh
              </p>
              <p className="text-sm text-muted-foreground">
                {missingChecklist > 0 && `${missingChecklist} thiết bị chưa có checklist`}
                {missingChecklist > 0 && missingDate > 0 && ', '}
                {missingDate > 0 && `${missingDate} thiết bị chưa có ngày`}
                {items.length === 0 && 'Chưa thêm thiết bị nào vào kế hoạch'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Plan Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* General Info */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Thông tin kế hoạch
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tên kế hoạch:</dt>
              <dd className="font-medium text-right">
                {step1Data.name || `Kế hoạch PM ${getPlanTypeLabel()}`}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Loại kế hoạch:</dt>
              <dd>
                <Badge variant="secondary">{getPlanTypeName()}</Badge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Chu kỳ:</dt>
              <dd className="font-medium">{getPlanTypeLabel()}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-muted-foreground flex items-center gap-1">
                <Factory className="h-4 w-4" /> Nhà máy:
              </dt>
              <dd className="font-medium">{factory?.name || '-'}</dd>
            </div>
          </dl>
        </div>

        {/* Assignee Info */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Phân công thực hiện
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between items-start">
              <dt className="text-muted-foreground">Người phụ trách:</dt>
              <dd className="text-right">
                {step2Data.assignees.length > 0 ? (
                  <div className="flex flex-wrap gap-1 justify-end">
                    {step2Data.assignees.map(a => (
                      <Badge key={a} variant="outline">{a}</Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Chưa phân công</span>
                )}
              </dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Ngày mặc định:
              </dt>
              <dd className="font-medium">{step2Data.defaultDate || 'Chưa chọn'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Áp dụng chung:</dt>
              <dd>
                <Badge variant={step2Data.applyToAll ? "default" : "secondary"}>
                  {step2Data.applyToAll ? 'Có' : 'Không'}
                </Badge>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}