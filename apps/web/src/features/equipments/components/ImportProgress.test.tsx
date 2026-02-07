import { render, screen, fireEvent } from '@testing-library/react';
import { ImportProgress } from './ImportProgress';
import { useImportProgress } from '../hooks/useImportProgress';

// Mock dependencies
jest.mock('../hooks/useImportProgress');
jest.mock('@/config/env', () => ({
  env: {
    API_URL: 'http://localhost:3000/api'
  }
}));

describe('ImportProgress Component', () => {
  const jobId = 'test-job-id';
  const onClose = jest.fn();
  const mockOpen = jest.fn();

  beforeEach(() => {
    onClose.mockClear();
    mockOpen.mockClear();
    window.open = mockOpen;
    (useImportProgress as jest.Mock).mockReturnValue({
      progress: 0,
      history: null,
      isSimulationDone: false
    });
  });

  it('should render nothing if jobId is missing', () => {
    const { container } = render(<ImportProgress jobId="" onClose={onClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render processing state correctly', () => {
    (useImportProgress as jest.Mock).mockReturnValue({
      progress: 45,
      history: { status: 'PROCESSING' },
      isSimulationDone: false
    });

    render(<ImportProgress jobId={jobId} onClose={onClose} />);
    
    expect(screen.getByText('Đang xử lý dữ liệu')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('should render completed state with success', () => {
    (useImportProgress as jest.Mock).mockReturnValue({
      progress: 100,
      history: { 
        status: 'COMPLETED',
        successCount: 10,
        failedCount: 0,
        fileName: 'test.xlsx'
      },
      isSimulationDone: true
    });

    render(<ImportProgress jobId={jobId} onClose={onClose} />);
    
    expect(screen.getByText('Import Hoàn Tất')).toBeInTheDocument();
    expect(screen.getByText('Thành công')).toBeInTheDocument();
    expect(screen.getAllByText('10')[0]).toBeInTheDocument(); // In MetricStat
    expect(screen.getByText('Đồng bộ thành công!')).toBeInTheDocument();
  });

  it('should render completed state with errors and download button', () => {
    (useImportProgress as jest.Mock).mockReturnValue({
      progress: 100,
      history: { 
        status: 'COMPLETED',
        successCount: 8,
        failedCount: 2,
        fileName: 'test.xlsx',
        errorFileUrl: '/uploads/imports/errors/err.xlsx'
      },
      isSimulationDone: true
    });

    render(<ImportProgress jobId={jobId} onClose={onClose} />);
    
    expect(screen.getByText('Dòng lỗi')).toBeInTheDocument();
    expect(screen.getAllByText('2')[0]).toBeInTheDocument();
    expect(screen.getByText('Tải báo cáo lỗi (.xlsx)')).toBeInTheDocument();
  });

  it('should handle report download click', () => {
    (useImportProgress as jest.Mock).mockReturnValue({
      progress: 100,
      history: { 
        status: 'COMPLETED',
        successCount: 8,
        failedCount: 2,
        errorFileUrl: '/uploads/imports/errors/err.xlsx'
      },
      isSimulationDone: true
    });

    render(<ImportProgress jobId={jobId} onClose={onClose} />);
    
    const downloadBtn = screen.getByText('Tải báo cáo lỗi (.xlsx)');
    fireEvent.click(downloadBtn);

    expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:3000/uploads/imports/errors/err.xlsx'),
        '_blank'
    );
  });

  it('should render failed state', () => {
    (useImportProgress as jest.Mock).mockReturnValue({
      progress: 0,
      history: { status: 'FAILED' },
      isSimulationDone: true
    });

    render(<ImportProgress jobId={jobId} onClose={onClose} />);
    
    expect(screen.getByText('Tiến Trình Thất Bại')).toBeInTheDocument();
    expect(screen.getByText(/Hệ thống gặp lỗi nghiêm trọng/)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    (useImportProgress as jest.Mock).mockReturnValue({
      progress: 10,
      history: { status: 'PROCESSING' },
      isSimulationDone: false
    });

    render(<ImportProgress jobId={jobId} onClose={onClose} />);
    
    const closeBtn = screen.getByRole('button', { name: '' }); // The X button
    fireEvent.click(closeBtn);
    
    expect(onClose).toHaveBeenCalled();
  });
});
