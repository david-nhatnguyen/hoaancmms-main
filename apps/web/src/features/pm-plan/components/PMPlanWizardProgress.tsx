import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  { number: 1, title: 'Loại kế hoạch', description: 'Chu kỳ & nhà máy' },
  { number: 2, title: 'Thời gian', description: 'Ngày & người phụ trách' },
  { number: 3, title: 'Thiết bị', description: 'Gán checklist' },
  { number: 4, title: 'Rà soát', description: 'Xác nhận & áp dụng' }
];

interface PMPlanWizardProgressProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function PMPlanWizardProgress({ currentStep, onStepClick }: PMPlanWizardProgressProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isClickable = onStepClick && currentStep > step.number;
          
          return (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              {/* Step circle and info */}
              <div 
                className={cn(
                  "flex items-center gap-3",
                  isClickable && "cursor-pointer"
                )}
                onClick={() => isClickable && onStepClick(step.number)}
              >
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : step.number}
                </div>
                <div className="hidden sm:block">
                  <p className={cn(
                    "font-medium text-sm",
                    (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              
              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-4">
                  <div 
                    className={cn(
                      "h-1 rounded-full transition-all",
                      currentStep > step.number ? "bg-primary" : "bg-muted"
                    )} 
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}