import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from "@/components/layout/MainLayout";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import NotFound from "@/pages/NotFound";
import SystemSettingsPage from '@/features/system/pages/SystemSettingsPage';
import PMPlanCalendarPage from '@/features/pm-plan/pages/PMPlanCalendarPage';
import PMPlanCreatePage from '@/features/pm-plan/pages/PMPlanCreatePage';
import WorkOrderListPage from '@/features/work-order/pages/WorkOrderListPage';
import WorkOrderDetailPage from '@/features/work-order/pages/WorkOrderDetailPage';
import WorkOrderExecutePage from '@/features/work-order/pages/WorkOrderExecutePage';
import PMPlanListPage from '@/features/pm-plan/pages/PMPlanListPage';
import PMPlanDetailPage from '@/features/pm-plan/pages/PMPlanDetailPage';
import ChecklistListPage from '@/features/checklist/pages/ChecklistListPage';
import ChecklistCreatePage from '@/features/checklist/pages/ChecklistCreatePage';
import ChecklistDetailPage from '@/features/checklist/pages/ChecklistDetailPage';
import FactoryListPage from '@/features/assets/pages/FactoryListPage';
import EquipmentListPage from '@/features/assets/pages/EquipmentListPage';
import EquipmentCreatePage from '@/features/assets/pages/EquipmentCreatePage';
import EquipmentDetailPage from '@/features/assets/pages/EquipmentDetailPage';
import CorrectiveMaintenanceListPage from '@/features/corrective-maintenance/pages/CorrectiveMaintenanceListPage';
import CorrectiveMaintenanceCreatePage from '@/features/corrective-maintenance/pages/CorrectiveMaintenanceCreatePage';
import CorrectiveMaintenanceDetailPage from '@/features/corrective-maintenance/pages/CorrectiveMaintenanceDetailPage';
import UserListPage from '@/features/system/pages/UserListPage';
import RoleListPage from '@/features/system/pages/RoleListPage';
import RoleDetailPage from '@/features/system/pages/RoleDetailPage';
import SystemLogsPage from '@/features/system/pages/SystemLogsPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<DashboardPage />} />
                
                {/* System Module Routes */}
                <Route path="system/settings" element={<SystemSettingsPage />} />
                <Route path="system/users" element={<UserListPage />} />
                <Route path="system/roles" element={<RoleListPage />} />
                <Route path="system/roles/:id" element={<RoleDetailPage />} />
                <Route path="system/logs" element={<SystemLogsPage />} />

                {/* Assets Module Routes */}
                <Route path="factories" element={<FactoryListPage />} />
                <Route path="equipments" element={<EquipmentListPage />} />
                <Route path="equipments/new" element={<EquipmentCreatePage />} />
                <Route path="equipments/:id" element={<EquipmentDetailPage />} />
                <Route path="equipments/:id/edit" element={<EquipmentCreatePage />} />

                {/* PM Plan Module Routes */}
                <Route path="pm-plans" element={<PMPlanListPage />} />
                <Route path="pm-plans/new" element={<PMPlanCreatePage />} />
                <Route path="pm-plans/:id" element={<PMPlanDetailPage />} />
                <Route path="pm-plans/:id/edit" element={<PMPlanCreatePage />} />
                <Route path="pm-plans/:id/calendar" element={<PMPlanCalendarPage />} />

                {/* Work Order Module Routes */}
                <Route path="work-orders" element={<WorkOrderListPage />} />
                <Route path="work-orders/:id" element={<WorkOrderDetailPage />} />
                <Route path="work-orders/:id/execute" element={<WorkOrderExecutePage />} />

                {/* Checklist Module Routes */}
                <Route path="checklists" element={<ChecklistListPage />} />
                <Route path="checklists/new" element={<ChecklistCreatePage />} />
                <Route path="checklists/:id" element={<ChecklistDetailPage />} />
                <Route path="checklists/:id/edit" element={<ChecklistCreatePage />} />
                <Route path="checklists/:id/preview" element={<ChecklistDetailPage />} />

                {/* Corrective Maintenance Module Routes */}
                <Route path="corrective-maintenance" element={<CorrectiveMaintenanceListPage />} />
                <Route path="corrective-maintenance/new" element={<CorrectiveMaintenanceCreatePage />} />
                <Route path="corrective-maintenance/:id" element={<CorrectiveMaintenanceDetailPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;