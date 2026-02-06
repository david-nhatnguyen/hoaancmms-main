import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  Calendar,
  Factory,
  Filter,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  Activity,
  FileText,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { KPICard } from '@/features/dashboard/KPICard';
import { RiskTable } from '@/features/dashboard/RiskTable';
import { ActionCenter } from '@/features/dashboard/ActionCenter';
import { InsightPanel } from '@/features/dashboard/InsightPanel';
import {
  kpiCards,
  riskEquipments,
  actionItems,
  performanceData,
  performanceByGroup,
  incidentTrends,
  incidentsByCause,
  downtimeData,
  downtimeByGroup,
  managementInsights
} from '@/data/dashboardData';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  success: 'hsl(var(--status-active))',
  warning: 'hsl(var(--status-maintenance))',
  danger: 'hsl(var(--destructive))',
  muted: 'hsl(var(--muted-foreground))'
};

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState('12');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedFactory, setSelectedFactory] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "animate-fade-in",
      isMobile 
        ? "px-4 py-3 max-w-full overflow-x-hidden" 
        : "p-6 overflow-x-hidden"
    )}>
      {/* Page Header */}
      <div className={cn("mb-3", !isMobile && "mb-6")}>
        <p className={cn("page-subtitle", isMobile && "text-[10px]")}>DASHBOARD & KPI</p>
        <div className="flex items-center justify-between gap-2 min-w-0">
          <h1 className={cn("page-title truncate", isMobile && "text-base")}>Quản lý & Ra quyết định</h1>
          {!isMobile && (
            <Button variant="outline" size="sm" className="action-btn-secondary shrink-0">
              <Download className="h-4 w-4" />
              Xuất báo cáo
            </Button>
          )}
        </div>
      </div>

      {/* Global Filters - Responsive */}
      {!isMobile && (
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-card rounded-xl border border-border/50">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Lọc:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[100px] h-9 bg-secondary/50 border-border/50">
                <Calendar className="h-4 w-4 mr-1" />
                <SelectValue placeholder="Tháng" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    Tháng {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[90px] h-9 bg-secondary/50 border-border/50">
                <SelectValue placeholder="Năm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-6 w-px bg-border" />

          <Select value={selectedFactory} onValueChange={setSelectedFactory}>
            <SelectTrigger className="w-[150px] h-9 bg-secondary/50 border-border/50">
              <Factory className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Nhà máy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nhà máy</SelectItem>
              <SelectItem value="hcm">Nhà máy HCM</SelectItem>
              <SelectItem value="hn">Nhà máy Hà Nội</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-[200px] h-9 bg-secondary/50 border-border/50">
              <SelectValue placeholder="Nhóm thiết bị" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nhóm</SelectItem>
              <SelectItem value="injection">Máy ép nhựa</SelectItem>
              <SelectItem value="mold">Máy gia công khuôn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Mobile Filter - Single row, no overflow */}
      {isMobile && (
        <div className="mb-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full h-9 text-sm bg-secondary/50 border-border/50">
              <Calendar className="h-3.5 w-3.5 mr-2 shrink-0" />
              <span className="truncate">Tháng {selectedMonth}</span>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  Tháng {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className={cn("space-y-3", !isMobile && "space-y-6")}>
        {/* Mobile-optimized tabs - wrap to next line instead of scroll */}
        <TabsList className={cn(
          "bg-secondary/50 p-1",
          isMobile 
            ? "w-full grid grid-cols-4 h-auto"
            : ""
        )}>
          <TabsTrigger 
            value="overview" 
            className={cn(
              "gap-1.5", 
              isMobile && "text-[11px] px-1.5 py-2 flex-col h-auto [&>svg]:mb-0.5"
            )}
          >
            <Activity className={cn("h-4 w-4", isMobile && "h-3.5 w-3.5")} />
            <span className={isMobile ? "leading-tight" : ""}>Tổng quan</span>
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className={cn(
              "gap-1.5", 
              isMobile && "text-[11px] px-1.5 py-2 flex-col h-auto [&>svg]:mb-0.5"
            )}
          >
            <TrendingUp className={cn("h-4 w-4", isMobile && "h-3.5 w-3.5")} />
            <span className={isMobile ? "leading-tight" : ""}>PM</span>
          </TabsTrigger>
          <TabsTrigger 
            value="risk" 
            className={cn(
              "gap-1.5", 
              isMobile && "text-[11px] px-1.5 py-2 flex-col h-auto [&>svg]:mb-0.5"
            )}
          >
            <AlertTriangle className={cn("h-4 w-4", isMobile && "h-3.5 w-3.5")} />
            <span className={isMobile ? "leading-tight" : ""}>Rủi ro</span>
          </TabsTrigger>
          <TabsTrigger 
            value="incidents" 
            className={cn(
              "gap-1.5", 
              isMobile && "text-[11px] px-1.5 py-2 flex-col h-auto [&>svg]:mb-0.5"
            )}
          >
            <Clock className={cn("h-4 w-4", isMobile && "h-3.5 w-3.5")} />
            <span className={isMobile ? "leading-tight" : ""}>Sự cố</span>
          </TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="downtime" className="gap-1.5">
                <Clock className="h-4 w-4" />
                Downtime
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-1.5">
                <FileText className="h-4 w-4" />
                Báo cáo
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* TAB: Executive Overview */}
        <TabsContent value="overview" className={cn("space-y-3", !isMobile && "space-y-6")}>
          {/* KPI Cards - 2 columns on mobile */}
          <section>
            <div className={cn(
              "grid gap-2",
              isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
            )}>
              {kpiCards.slice(0, isMobile ? 4 : kpiCards.length).map(kpi => (
                <KPICard key={kpi.id} data={kpi} />
              ))}
            </div>
          </section>

          {/* Risk + Actions - Single column on mobile */}
          <section className={cn(
            "grid gap-3",
            isMobile ? "grid-cols-1" : "lg:grid-cols-12 gap-6"
          )}>
            {/* Risk Table */}
            <div className={cn(!isMobile && "lg:col-span-7 flex flex-col")}>
              <RiskTable data={riskEquipments} compact className="flex-1" />
            </div>

            {/* Action Center */}
            <div className={cn(!isMobile && "lg:col-span-5 flex flex-col")}>
              <ActionCenter data={actionItems} compact className="flex-1" />
            </div>
          </section>

          {/* Insights - Single column on mobile */}
          <section className={cn(
            "grid gap-2",
            isMobile ? "grid-cols-1" : "md:grid-cols-3 gap-4"
          )}>
            <InsightPanel 
              title="Hiệu suất bảo dưỡng" 
              insights={managementInsights.performance}
              type="warning"
            />
            {!isMobile && (
              <>
                <InsightPanel 
                  title="Phân tích sự cố" 
                  insights={managementInsights.incidents}
                  type="warning"
                />
                <InsightPanel 
                  title="Downtime & Tác động" 
                  insights={managementInsights.downtime}
                  type="warning"
                />
              </>
            )}
          </section>
        </TabsContent>

        {/* TAB: Performance */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* PM Completion Trend */}
            <div className="lg:col-span-2 bg-card rounded-xl border border-border/50 p-6">
              <h3 className="font-semibold mb-4">Tỷ lệ hoàn thành PM theo thời gian</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[80, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pmCompletion" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    name="Tỷ lệ hoàn thành (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Insights */}
            <div>
              <InsightPanel 
                title="Nhận xét hiệu suất" 
                insights={managementInsights.performance}
                type="info"
              />
            </div>
          </div>

          {/* PM On Time vs Late by Group */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border/50 p-6">
              <h3 className="font-semibold mb-4">PM đúng hạn vs Trễ theo nhóm thiết bị</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={performanceByGroup} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="group" type="category" stroke="hsl(var(--muted-foreground))" width={120} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="onTime" fill="hsl(var(--status-active))" name="Đúng hạn" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="late" fill="hsl(var(--destructive))" name="Trễ hạn" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card rounded-xl border border-border/50 p-6">
              <h3 className="font-semibold mb-4">Khối lượng công việc theo tháng</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="pmOnTime" stackId="a" fill="hsl(var(--status-active))" name="Đúng hạn" />
                  <Bar dataKey="pmLate" stackId="a" fill="hsl(var(--destructive))" name="Trễ hạn" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* TAB: Risk */}
        <TabsContent value="risk" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RiskTable data={riskEquipments} />
            </div>
            
            <div className="space-y-4">
              <InsightPanel 
                title="Đánh giá rủi ro" 
                insights={[
                  'IMM-01 có điểm rủi ro cao nhất (85/100)',
                  '3 thiết bị ở mức rủi ro cao',
                  'Cần ưu tiên xử lý PM trễ hạn'
                ]}
                type="warning"
              />
              
              {/* Risk Distribution */}
              <div className="bg-card rounded-xl border border-border/50 p-4">
                <h4 className="font-semibold mb-3 text-sm">Phân bố rủi ro</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cao</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-destructive" style={{ width: '50%' }} />
                      </div>
                      <span className="text-sm font-medium">3</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Trung bình</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-status-maintenance" style={{ width: '33%' }} />
                      </div>
                      <span className="text-sm font-medium">2</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Thấp</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-status-active" style={{ width: '17%' }} />
                      </div>
                      <span className="text-sm font-medium">1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB: Incidents */}
        <TabsContent value="incidents" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Incident Trend */}
            <div className="lg:col-span-2 bg-card rounded-xl border border-border/50 p-6">
              <h3 className="font-semibold mb-4">Xu hướng sự cố theo thời gian</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={incidentTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={3} name="Tổng" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="high" stroke="hsl(var(--destructive))" strokeWidth={2} name="Nặng" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="medium" stroke="hsl(var(--status-maintenance))" strokeWidth={2} name="Trung bình" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Severity Pie */}
            <div className="bg-card rounded-xl border border-border/50 p-6">
              <h3 className="font-semibold mb-4">Phân loại theo mức độ</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Nhẹ', value: 3 },
                      { name: 'Trung bình', value: 3 },
                      { name: 'Nặng', value: 2 }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {PIE_COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Causes & Insights */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border/50 p-6">
              <h3 className="font-semibold mb-4">Top nguyên nhân sự cố</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={incidentsByCause} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="cause" type="category" stroke="hsl(var(--muted-foreground))" width={150} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Số lượng" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <InsightPanel 
              title="Phân tích sự cố" 
              insights={managementInsights.incidents}
              type="warning"
            />
          </div>
        </TabsContent>

        {/* TAB: Downtime */}
        <TabsContent value="downtime" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Downtime by Equipment */}
            <div className="lg:col-span-2 bg-card rounded-xl border border-border/50 p-6">
              <h3 className="font-semibold mb-4">Top 5 Thiết bị có Downtime cao nhất</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={downtimeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" unit="h" />
                  <YAxis dataKey="equipmentCode" type="category" stroke="hsl(var(--muted-foreground))" width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value} giờ`, 'Downtime']}
                  />
                  <Bar dataKey="totalDowntime" fill="hsl(var(--destructive))" name="Downtime (giờ)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Downtime by Group Pie */}
            <div className="bg-card rounded-xl border border-border/50 p-6">
              <h3 className="font-semibold mb-4">Downtime theo nhóm</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={downtimeByGroup}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="downtime"
                    label={({ group, percentage }) => `${percentage}%`}
                  >
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--status-maintenance))" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              
              <InsightPanel 
                title="Khuyến nghị" 
                insights={managementInsights.downtime}
                type="warning"
              />
            </div>
          </div>

          {/* Downtime Table with Recommendations */}
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold">Chi tiết Downtime & Khuyến nghị</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Thiết bị</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Nhóm</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Downtime</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Số lần dừng</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Xu hướng</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Khuyến nghị</th>
                </tr>
              </thead>
              <tbody>
                {downtimeData.map((eq) => (
                  <tr key={eq.equipmentCode} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="p-4">
                      <p className="font-medium">{eq.equipmentCode}</p>
                      <p className="text-xs text-muted-foreground">{eq.equipmentName}</p>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{eq.equipmentGroup}</td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "font-bold",
                        eq.totalDowntime > 4 && "text-destructive"
                      )}>
                        {eq.totalDowntime}h
                      </span>
                    </td>
                    <td className="p-4 text-center font-medium">{eq.incidents}</td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        eq.trend === 'up' && "bg-destructive/20 text-destructive",
                        eq.trend === 'down' && "bg-status-active/20 text-[hsl(var(--status-active))]",
                        eq.trend === 'stable' && "bg-muted text-muted-foreground"
                      )}>
                        {eq.trend === 'up' ? '↑ Tăng' : eq.trend === 'down' ? '↓ Giảm' : '→ Ổn định'}
                      </span>
                    </td>
                    <td className="p-4">
                      {eq.recommendation && (
                        <span className="text-sm text-primary font-medium">{eq.recommendation}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* TAB: Reports */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Report Cards */}
            {[
              {
                title: 'Báo cáo hiệu quả bảo trì',
                description: 'Tổng hợp KPI, xu hướng PM và đánh giá hiệu suất',
                icon: BarChart3
              },
              {
                title: 'Báo cáo rủi ro thiết bị',
                description: 'Phân tích rủi ro, thiết bị cần ưu tiên',
                icon: AlertTriangle
              },
              {
                title: 'Báo cáo Downtime',
                description: 'Thống kê downtime, xu hướng và tác động',
                icon: Clock
              }
            ].map((report) => (
              <div 
                key={report.title}
                className="bg-card rounded-xl border border-border/50 p-6 hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <report.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{report.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-1" />
                    Excel
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Period Selection for Reports */}
          <div className="bg-card rounded-xl border border-border/50 p-6">
            <h3 className="font-semibold mb-4">Tạo báo cáo tùy chỉnh</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <Select defaultValue="12-2026">
                <SelectTrigger>
                  <SelectValue placeholder="Kỳ báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12-2026">Tháng 12/2026</SelectItem>
                  <SelectItem value="q4-2026">Q4/2026</SelectItem>
                  <SelectItem value="2026">Năm 2026</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Nhà máy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nhà máy</SelectItem>
                  <SelectItem value="hcm">Nhà máy HCM</SelectItem>
                  <SelectItem value="hn">Nhà máy Hà Nội</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue="executive">
                <SelectTrigger>
                  <SelectValue placeholder="Loại báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive Summary</SelectItem>
                  <SelectItem value="detailed">Chi tiết</SelectItem>
                  <SelectItem value="risk">Phân tích rủi ro</SelectItem>
                </SelectContent>
              </Select>
              
              <Button className="action-btn-primary">
                <FileText className="h-4 w-4 mr-1" />
                Tạo báo cáo
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
