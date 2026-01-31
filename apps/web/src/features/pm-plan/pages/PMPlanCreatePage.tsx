import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { pmPlans, generatePMPlanCode } from '@/api/mock/pmPlanData';

import { PMPlanWizardProgress } from '../components/PMPlanWizardProgress';
import { PMPlanStep1, Step1Data } from '../components/wizard/PMPlanStep1';
import { PMPlanStep2, Step2Data } from '../components/wizard/PMPlanStep2';
import { PMPlanStep3, PMPlanEquipmentItem } from '../components/wizard/PMPlanStep3';
import { PMPlanStep4 } from '../components/wizard/PMPlanStep4';

const currentYear = new Date().getFullYear();

export default function PMPlanCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const existingPlan = isEditing ? pmPlans.find(p => p.id === id) : null;

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 Data
  const [step1Data, setStep1Data] = useState<Step1Data>({
    name: existingPlan?.name || '',
    factoryId: existingPlan?.factoryId || '',
    planType: 'monthly',
    month: existingPlan?.month || new Date().getMonth() + 1,
    year: existingPlan?.year || currentYear,
    dateFrom: '',
    dateTo: '',
    runningHours: 500
  });

  // Step 2 Data
  const [step2Data, setStep2Data] = useState<Step2Data>({
    defaultDate: '',
    assignees: [],
    maintenanceGroup: '',
    applyToAll: true,
    allowPerDeviceChange: true
  });

  // Step 3 Data
  const [items, setItems] = useState<PMPlanEquipmentItem[]>(
    existingPlan?.items.map(i => ({ ...i, companionEquipment: [] })) || []
  );

  // Validation per step
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        if (!step1Data.factoryId) return false;
        if (step1Data.planType === 'monthly' && (!step1Data.month || !step1Data.year)) return false;
        if (step1Data.planType === 'daily' && (!step1Data.dateFrom || !step1Data.dateTo)) return false;
        return true;
      case 2:
        return true; // Optional step
      case 3:
        return items.length > 0;
      case 4: {
        const missingChecklist = items.filter(i => !i.checklistId).length;
        const missingDate = items.filter(i => !i.plannedDate).length;
        return items.length > 0 && missingChecklist === 0 && missingDate === 0;
      }
      default:
        return false;
    }
  }, [currentStep, step1Data, items]);

  const handleNext = () => {
    if (currentStep < 4 && canProceed) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    toast.success('Đã lưu bản nháp');
    navigate('/pm-plans');
  };

  const handleApply = () => {
    if (!canProceed) {
      toast.error('Vui lòng hoàn thành tất cả thông tin bắt buộc');
      return;
    }
    toast.success('Đã áp dụng kế hoạch thành công!');
    navigate('/pm-plans');
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/pm-plans')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing ? 'Chỉnh sửa Kế hoạch PM' : 'Tạo Kế hoạch PM mới'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step1Data.name || generatePMPlanCode(step1Data.month, step1Data.year)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Lưu nháp
          </Button>
        </div>
      </div>

      {/* Wizard Progress */}
      <PMPlanWizardProgress currentStep={currentStep} onStepClick={(step) => setCurrentStep(step)} />

      {/* Step Content */}
      <div className="bg-card rounded-xl border border-border/50 p-6 mb-6 min-h-[400px]">
        {currentStep === 1 && (
          <PMPlanStep1 data={step1Data} onChange={(updates) => setStep1Data({ ...step1Data, ...updates })} />
        )}
        {currentStep === 2 && (
          <PMPlanStep2 data={step2Data} onChange={(updates) => setStep2Data({ ...step2Data, ...updates })} />
        )}
        {currentStep === 3 && (
          <PMPlanStep3
            factoryId={step1Data.factoryId}
            items={items}
            defaultDate={step2Data.defaultDate}
            defaultAssignees={step2Data.assignees}
            applyToAll={step2Data.applyToAll}
            allowPerDeviceChange={step2Data.allowPerDeviceChange}
            onChange={setItems}
          />
        )}
        {currentStep === 4 && (
          <PMPlanStep4 step1Data={step1Data} step2Data={step2Data} items={items} />
        )}
      </div>

      {/* Navigation Buttons (Giữ nguyên logic) */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
        </Button>
        <div className="flex items-center gap-2">
          {currentStep < 4 ? (
            <Button onClick={handleNext} disabled={!canProceed}>
              Tiếp theo <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleApply} disabled={!canProceed}>
              <CheckCircle className="h-4 w-4 mr-2" /> Áp dụng kế hoạch
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}