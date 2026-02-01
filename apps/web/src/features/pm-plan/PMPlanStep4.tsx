import { 
  Calendar, 
  Factory, 
  User, 
  CheckCircle2,
  AlertCircle,
  ClipboardList
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { factories, equipments } from '@/data/mockData';
import { MONTHS } from '@/data/pmPlanData';
import { cn } from '@/lib/utils';
import type { Step1Data } from './PMPlanStep1';
import type { Step2Data } from './PMPlanStep2';
import type { PMPlanEquipmentItem } from './PMPlanStep3';

interface PMPlanStep4Props {
  step1Data: Step1Data;
  step2Data: Step2Data;
  items: PMPlanEquipmentItem[];
}

export function PMPlanStep4({ step1Data, step2Data, items }: PMPlanStep4Props) {
  const factory = factories.find(f => f.id === step1Data.factoryId);
  const getEquipmentById = (id: string) => equipments.find(e => e.id === id);

  const totalEquipment = items.length;
  const totalCompanion = items.reduce((acc, i) => acc + i.companionEquipment.length, 0);
  const missingChecklist = items.filter(i => !i.checklistId).length;
  const missingDate = items.filter(i => !i.plannedDate).length;
  const isValid = missingChecklist === 0 && missingDate === 0 && items.length > 0;

  const getPlanTypeLabel = () => {
    switch (step1Data.planType) {
      case 'monthly':
        const monthLabel = MONTHS.find(m => m.value === step1Data.month)?.label || '';
        return `${monthLabel}/${step1Data.year}`;
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

      {/* Equipment Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-secondary/30 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-primary">{totalEquipment}</p>
          <p className="text-sm text-muted-foreground">Thiết bị chính</p>
        </div>
        <div className="bg-secondary/30 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-primary">{totalCompanion}</p>
          <p className="text-sm text-muted-foreground">Thiết bị đi kèm</p>
        </div>
        <div className="bg-secondary/30 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-primary">{totalEquipment + totalCompanion}</p>
          <p className="text-sm text-muted-foreground">Tổng thiết bị</p>
        </div>
      </div>

      {/* Equipment List Preview */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-secondary/30">
          <h3 className="font-semibold">Danh sách thiết bị bảo dưỡng</h3>
        </div>
        {items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Chưa có thiết bị nào trong kế hoạch
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="table-header-cell">Thiết bị chính</TableHead>
                  <TableHead className="table-header-cell">Thiết bị đi kèm</TableHead>
                  <TableHead className="table-header-cell">Checklist</TableHead>
                  <TableHead className="table-header-cell">Ngày KH</TableHead>
                  <TableHead className="table-header-cell">Người PT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="border-border/50">
                    <TableCell>
                      <div>
                        <p className="font-medium font-mono text-primary">{item.equipmentCode}</p>
                        <p className="text-sm">{item.equipmentName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.companionEquipment.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.companionEquipment.map(compId => {
                            const comp = getEquipmentById(compId);
                            return (
                              <Badge key={compId} variant="secondary" className="text-xs">
                                {comp?.code}
                              </Badge>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.checklistName ? (
                        <span className="text-sm">{item.checklistName}</span>
                      ) : (
                        <span className="text-destructive text-sm">Chưa chọn</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.plannedDate ? (
                        <span className="text-sm">{item.plannedDate}</span>
                      ) : (
                        <span className="text-destructive text-sm">Chưa chọn</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.assignee ? (
                        <span className="text-sm">{item.assignee}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
