import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, Camera, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { workOrderService } from '@/services/work-order.service';
import { WorkOrder } from '@/api/mock/workOrderData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Mock tasks for execution
const MOCK_TASKS = [
  { id: 1, title: 'Kiểm tra nhiệt độ động cơ', standard: '60-80 độ C' },
  { id: 2, title: 'Kiểm tra độ rung', standard: 'Không rung lắc mạnh' },
  { id: 3, title: 'Vệ sinh bộ lọc khí', standard: 'Sạch bụi bẩn' },
];

export default function WorkOrderExecutePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [results, setResults] = useState<Record<number, 'pass' | 'fail'>>({});

  useEffect(() => {
    const fetchWO = async () => {
      if (!id) return;
      const data = await workOrderService.getById(id);
      if (data) setWorkOrder(data);
    };
    fetchWO();
  }, [id]);

  const handleResultChange = (taskId: number, value: 'pass' | 'fail') => {
    setResults(prev => ({ ...prev, [taskId]: value }));
  };

  const handleComplete = async () => {
    if (Object.keys(results).length < MOCK_TASKS.length) {
      toast.error('Vui lòng hoàn thành tất cả các hạng mục kiểm tra');
      return;
    }
    
    // Mock API call
    toast.success('Đã hoàn thành công việc!');
    navigate(`/work-orders/${id}`);
  };

  if (!workOrder) return <div>Loading...</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 sticky top-0 bg-background/95 backdrop-blur py-4 z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/work-orders/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-bold text-lg">Thực thi công việc</h1>
          <p className="text-xs text-muted-foreground">{workOrder.code} - {workOrder.equipmentName}</p>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {MOCK_TASKS.map((task) => (
          <Card key={task.id} className={cn(
            "p-4 border-l-4 transition-all",
            results[task.id] === 'pass' ? "border-l-green-500" : 
            results[task.id] === 'fail' ? "border-l-red-500" : "border-l-transparent"
          )}>
            <div className="mb-3">
              <h3 className="font-medium">{task.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">Tiêu chuẩn: {task.standard}</p>
            </div>

            <div className="flex flex-col gap-3">
              <RadioGroup 
                onValueChange={(v) => handleResultChange(task.id, v as 'pass' | 'fail')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1 cursor-pointer hover:bg-green-500/5 has-[[data-state=checked]]:bg-green-500/10 has-[[data-state=checked]]:border-green-500">
                  <RadioGroupItem value="pass" id={`t${task.id}-pass`} className="text-green-600 border-green-600" />
                  <Label htmlFor={`t${task.id}-pass`} className="cursor-pointer flex-1 text-green-700 font-medium">Đạt (OK)</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1 cursor-pointer hover:bg-red-500/5 has-[[data-state=checked]]:bg-red-500/10 has-[[data-state=checked]]:border-red-500">
                  <RadioGroupItem value="fail" id={`t${task.id}-fail`} className="text-red-600 border-red-600" />
                  <Label htmlFor={`t${task.id}-fail`} className="cursor-pointer flex-1 text-red-700 font-medium">Không đạt (NG)</Label>
                </div>
              </RadioGroup>

              {results[task.id] === 'fail' && (
                <div className="animate-fade-in space-y-3 mt-2 pl-1">
                  <Textarea placeholder="Mô tả vấn đề gặp phải..." className="min-h-[80px]" />
                  <Button variant="outline" size="sm" className="w-full border-dashed">
                    <Camera className="h-4 w-4 mr-2" /> Chụp ảnh hiện trường
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate(`/work-orders/${id}`)}>
            Lưu nháp
          </Button>
          <Button className="flex-[2]" onClick={handleComplete}>
            <Save className="h-4 w-4 mr-2" /> Hoàn thành công việc
          </Button>
        </div>
      </div>
    </div>
  );
}