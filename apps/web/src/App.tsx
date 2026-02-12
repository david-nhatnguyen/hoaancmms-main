import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { MainLayout } from "./components/layout/MainLayout";
import FactoryList from "./pages/FactoryList";
import EquipmentList from "./pages/EquipmentList";
import EquipmentDetail from "./pages/EquipmentDetail";
import EquipmentForm from "./pages/EquipmentForm";
import ChecklistList from "./pages/ChecklistList";
import ChecklistForm from "./pages/ChecklistForm";
import ChecklistDetail from "./pages/ChecklistDetail";
import PMPlanList from "./pages/PMPlanList";
import PMPlanForm from "./pages/PMPlanForm";
import PMPlanDetail from "./pages/PMPlanDetail";
import PMPlanCalendar from "./pages/PMPlanCalendar";
import WorkOrderList from "./pages/WorkOrderList";
import WorkOrderDetail from "./pages/WorkOrderDetail";
import WorkOrderExecute from "./pages/WorkOrderExecute";
import CorrectiveMaintenanceList from "./pages/CorrectiveMaintenanceList";
import CorrectiveMaintenanceForm from "./pages/CorrectiveMaintenanceForm";
import CorrectiveMaintenanceDetail from "./pages/CorrectiveMaintenanceDetail";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
// System Admin pages
import UserList from "./pages/system/UserList";
import RoleList from "./pages/system/RoleList";
import RoleDetail from "./pages/system/RoleDetail";
import SystemLogs from "./pages/system/SystemLogs";
import SystemSettings from "./pages/system/SystemSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="factories" element={<FactoryList />} />
              <Route path="equipments" element={<EquipmentList />} />
              <Route path="equipments/new" element={<EquipmentForm />} />
              <Route path="equipments/:code" element={<EquipmentDetail />} />
              <Route path="equipments/:code/edit" element={<EquipmentForm />} />
              <Route path="checklists" element={<ChecklistList />} />
              <Route path="checklists/new" element={<ChecklistForm />} />
              <Route path="checklists/:id" element={<ChecklistDetail />} />
              <Route path="checklists/:id/edit" element={<ChecklistForm />} />
              <Route path="checklists/:id/preview" element={<ChecklistDetail />} />
              <Route path="pm-plans" element={<PMPlanList />} />
              <Route path="pm-plans/new" element={<PMPlanForm />} />
              <Route path="pm-plans/:id" element={<PMPlanDetail />} />
              <Route path="pm-plans/:id/edit" element={<PMPlanForm />} />
              <Route path="pm-plans/:id/calendar" element={<PMPlanCalendar />} />
              <Route path="work-orders" element={<WorkOrderList />} />
              <Route path="work-orders/:id" element={<WorkOrderDetail />} />
              <Route path="work-orders/:id/execute" element={<WorkOrderExecute />} />
              <Route path="corrective-maintenance" element={<CorrectiveMaintenanceList />} />
              <Route path="corrective-maintenance/new" element={<CorrectiveMaintenanceForm />} />
              <Route path="corrective-maintenance/:id" element={<CorrectiveMaintenanceDetail />} />
              {/* System Admin Routes */}
              <Route path="system/users" element={<UserList />} />
              <Route path="system/roles" element={<RoleList />} />
              <Route path="system/roles/:id" element={<RoleDetail />} />
              <Route path="system/logs" element={<SystemLogs />} />
              <Route path="system/settings" element={<SystemSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
