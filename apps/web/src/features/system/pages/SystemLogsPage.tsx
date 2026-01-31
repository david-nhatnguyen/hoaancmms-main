import { useState } from 'react';
import { Search, Filter, Download, Clock, User, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { systemLogs } from '@/api/mock/systemData';
import { cn } from '@/lib/utils';

export default function SystemLogsPage() {
  const [logs] = useState(systemLogs);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'text-green-600 bg-green-500/10';
      case 'update': return 'text-blue-600 bg-blue-500/10';
      case 'delete': return 'text-red-600 bg-red-500/10';
      case 'login': return 'text-purple-600 bg-purple-500/10';
      case 'approve': return 'text-teal-600 bg-teal-500/10';
      default: return 'text-gray-600 bg-gray-500/10';
    }
  };

  return (
    <div className="p-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm font-medium text-muted-foreground mb-1">HỆ THỐNG</p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Nhật ký hoạt động</h1>
          <Button variant="outline" size="sm" className="action-btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Xuất nhật ký
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border/50 p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm trong nhật ký..." className="pl-9 bg-background" />
        </div>
        
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Hành động" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="create">Tạo mới</SelectItem>
            <SelectItem value="update">Cập nhật</SelectItem>
            <SelectItem value="delete">Xóa</SelectItem>
            <SelectItem value="login">Đăng nhập</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="system">Hệ thống</SelectItem>
            <SelectItem value="work-order">Work Order</SelectItem>
            <SelectItem value="asset">Tài sản</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon">
          <Filter className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Logs Table */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30 hover:bg-secondary/30">
              <TableHead className="w-[180px]">Thời gian</TableHead>
              <TableHead className="w-[200px]">Người dùng</TableHead>
              <TableHead className="w-[120px]">Hành động</TableHead>
              <TableHead className="w-[150px]">Module</TableHead>
              <TableHead>Chi tiết</TableHead>
              <TableHead className="w-[150px]">IP / Thiết bị</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-secondary/10">
                <TableCell className="text-sm text-muted-foreground font-mono">{log.timestamp}</TableCell>
                <TableCell className="font-medium">{log.userName}</TableCell>
                <TableCell>
                  <span className={cn("px-2 py-1 rounded text-xs font-medium uppercase", getActionColor(log.action))}>
                    {log.action}
                  </span>
                </TableCell>
                <TableCell>{log.module}</TableCell>
                <TableCell className="text-sm">{log.details}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  <div>{log.ipAddress}</div>
                  <div>{log.device}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}