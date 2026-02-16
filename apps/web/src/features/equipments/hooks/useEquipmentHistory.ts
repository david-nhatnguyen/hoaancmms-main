import { useState, useCallback, useMemo } from 'react';

// Mock data for PM History
const pmHistoryData = [
  {
    id: 'wo-001',
    date: '05/12/2026',
    workOrderCode: 'WO-122026-001',
    checklist: 'Injection Machine – Bảo dưỡng tháng',
    cycle: 'Tháng',
    technician: 'Nguyễn Văn A',
    result: 'pass',
    status: 'completed',
    startTime: '08:00',
    endTime: '10:30',
    duration: '2 giờ 30 phút',
    notes: 'Bảo dưỡng định kỳ theo kế hoạch, tất cả hạng mục đạt yêu cầu.',
    checklistItems: [
      { name: 'Kiểm tra hệ thống bôi trơn', result: 'OK' },
      { name: 'Kiểm tra áp suất thủy lực', result: 'OK' },
      { name: 'Vệ sinh bộ lọc', result: 'OK' },
      { name: 'Kiểm tra nhiệt độ vận hành', result: 'OK' },
    ],
    images: ['image1.jpg', 'image2.jpg'],
  },
  {
    id: 'wo-002',
    date: '05/11/2026',
    workOrderCode: 'WO-112026-004',
    checklist: 'Injection Machine – Bảo dưỡng tháng',
    cycle: 'Tháng',
    technician: 'Trần Văn B',
    result: 'has_ng',
    status: 'completed_late',
    startTime: '09:00',
    endTime: '14:00',
    duration: '5 giờ',
    notes: 'Phát hiện rò rỉ nhỏ tại van áp suất, đã xử lý tại chỗ.',
    checklistItems: [
      { name: 'Kiểm tra hệ thống bôi trơn', result: 'OK' },
      { name: 'Kiểm tra áp suất thủy lực', result: 'NG', note: 'Phát hiện rò rỉ nhỏ' },
      { name: 'Vệ sinh bộ lọc', result: 'OK' },
      { name: 'Kiểm tra nhiệt độ vận hành', result: 'OK' },
    ],
    images: ['image3.jpg'],
  },
];

// Mock data for Incident History
const incidentHistoryData = [
  {
    id: 'cm-001',
    date: '18/11/2026',
    incidentCode: 'CM-112026-003',
    description: 'Rò rỉ dầu tại cụm xy lanh',
    severity: 'critical',
    downtime: 4.5,
    status: 'resolved',
    reportedBy: 'Lê Văn C',
    reportedAt: '18/11/2026 08:15',
    detailedDescription: 'Phát hiện dầu thủy lực rò rỉ nghiêm trọng từ cụm xy lanh chính. Máy đã dừng hoạt động để đảm bảo an toàn.',
    images: ['incident1.jpg', 'incident2.jpg'],
    linkedRepair: 'RP-112026-002',
  },
  {
    id: 'cm-002',
    date: '02/10/2026',
    incidentCode: 'CM-102026-001',
    description: 'Máy báo lỗi nhiệt',
    severity: 'medium',
    downtime: 1.2,
    status: 'resolved',
    reportedBy: 'Nguyễn Thị D',
    reportedAt: '02/10/2026 14:30',
    detailedDescription: 'Hệ thống cảnh báo nhiệt độ vượt ngưỡng cho phép. Cần kiểm tra cảm biến và hệ thống làm mát.',
    images: ['incident3.jpg'],
    linkedRepair: 'RP-102026-001',
  },
];

// Mock data for Repair History
const repairHistoryData = [
  {
    id: 'rp-001',
    date: '18/11/2026',
    repairCode: 'RP-112026-002',
    cause: 'Phớt dầu xy lanh bị mòn',
    action: 'Thay phớt + vệ sinh khu vực',
    technician: 'Nguyễn Văn A',
    result: 'fixed',
    linkedIncident: 'CM-112026-003',
    detailedCause: 'Phớt dầu tại xy lanh chính đã mòn sau thời gian sử dụng dài, gây rò rỉ dầu thủy lực.',
    repairDetails: 'Thay thế toàn bộ phớt dầu xy lanh chính (02 cái), vệ sinh khu vực bị rò rỉ và kiểm tra lại áp suất.',
    beforeImages: ['before1.jpg'],
    afterImages: ['after1.jpg'],
    repairDuration: '3 giờ 15 phút',
    evaluation: 'Máy hoạt động ổn định sau sửa chữa, không còn hiện tượng rò rỉ.',
  },
  {
    id: 'rp-002',
    date: '02/10/2026',
    repairCode: 'RP-102026-001',
    cause: 'Cảm biến nhiệt sai lệch',
    action: 'Hiệu chỉnh cảm biến',
    technician: 'Trần Văn B',
    result: 'fixed',
    linkedIncident: 'CM-102026-001',
    detailedCause: 'Cảm biến nhiệt bị lệch thông số sau thời gian hoạt động, gây cảnh báo sai.',
    repairDetails: 'Hiệu chỉnh lại cảm biến nhiệt theo thông số tiêu chuẩn. Kiểm tra toàn bộ hệ thống làm mát.',
    beforeImages: [],
    afterImages: ['after2.jpg'],
    repairDuration: '1 giờ',
    evaluation: 'Hệ thống hoạt động ổn định, nhiệt độ hiển thị chính xác.',
  },
];

export type PMHistoryItem = typeof pmHistoryData[0];
export type IncidentHistoryItem = typeof incidentHistoryData[0];
export type RepairHistoryItem = typeof repairHistoryData[0];

export const useEquipmentHistory = (equipmentId: string) => {
  const [activeTab, setActiveTab] = useState('pm');
  const [selectedPM, setSelectedPM] = useState<PMHistoryItem | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentHistoryItem | null>(null);
  const [selectedRepair, setSelectedRepair] = useState<RepairHistoryItem | null>(null);

  const handleSelectPM = useCallback((pm: PMHistoryItem) => {
    setSelectedPM(pm);
  }, []);

  const handleSelectIncident = useCallback((incident: IncidentHistoryItem) => {
    setSelectedIncident(incident);
  }, []);

  const handleSelectRepair = useCallback((repair: RepairHistoryItem) => {
    setSelectedRepair(repair);
  }, []);

  const closeDrawers = useCallback(() => {
    setSelectedPM(null);
    setSelectedIncident(null);
    setSelectedRepair(null);
  }, []);

  const handleSwitchToRepair = useCallback((repairCode: string) => {
    const repair = repairHistoryData.find(r => r.repairCode === repairCode);
    if (repair) {
      setSelectedIncident(null);
      setSelectedRepair(repair);
    }
  }, []);

  const handleSwitchToIncident = useCallback((incidentCode: string) => {
    const incident = incidentHistoryData.find(i => i.incidentCode === incidentCode);
    if (incident) {
      setSelectedRepair(null);
      setSelectedIncident(incident);
    }
  }, []);

  return {
    activeTab,
    setActiveTab,
    selectedPM,
    selectedIncident,
    selectedRepair,
    handlers: {
      handleSelectPM,
      handleSelectIncident,
      handleSelectRepair,
      closeDrawers,
      handleSwitchToRepair,
      handleSwitchToIncident,
    },
    pmHistory: pmHistoryData,
    incidentHistory: incidentHistoryData,
    repairHistory: repairHistoryData,
    isLoading: false,
  };
};
