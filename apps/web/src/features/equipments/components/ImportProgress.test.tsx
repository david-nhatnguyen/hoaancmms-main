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
      history: { status: 'PROCESSING', fileName: 'test.xlsx' },
      isSimulationDone: false
    });

    render(<ImportProgress jobId={jobId} onClose={onClose} />);
    
    // Header
    expect(screen.getByText('test.xlsx')).toBeInTheDocument();
    // Badge
    expect(screen.getByText('PROCESSING')).toBeInTheDocument();
    // Progress
    expect(screen.getByText('Tiến độ xử lý')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('should render completed state with success', () => {
    (useImportProgress as jest.Mock).mockReturnValue({
      progress: 100,
      history: { 
        status: 'COMPLETED',
        successCount: 10,
        failedCount: 0,
        fileName: 'test.xlsx',
        totalRecords: 10,
        processedRecords: 10
      },
      isSimulationDone: true
    });

    render(<ImportProgress jobId={jobId} onClose={onClose} />);
    
    expect(screen.getByText('test.xlsx')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    
    // Success message
    expect(screen.getByText('Toàn bộ 10 thiết bị đã được import thành công!')).toBeInTheDocument();
    
    // Metrics
    expect(screen.getAllByText('10').length).toBeGreaterThan(0); 
    expect(screen.getAllByText(/Thành công/i).length).toBeGreaterThan(0);
  });

  it('should render completed state with errors and download button', () => {
    (useImportProgress as jest.Mock).mockReturnValue({
      progress: 100,
      history: { 
        status: 'COMPLETED',
        successCount: 8,
        failedCount: 2,
        fileName: 'test.xlsx',
        totalRecords: 10,
        processedRecords: 10,
        errorFileUrl: '/uploads/imports/errors/err.xlsx'
      },
      isSimulationDone: true
    });

    render(<ImportProgress jobId={jobId} onClose={onClose} />);
    
    expect(screen.getByText(/Thất bại/i)).toBeInTheDocument();
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    
    // Error section text
    expect(screen.getByText('Phát hiện 2 dòng lỗi')).toBeInTheDocument();
    expect(screen.getByText('Tải báo cáo lỗi')).toBeInTheDocument();
  });

  it('should handle report download click', () => {
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
    
    const downloadBtn = screen.getByText('Tải báo cáo lỗi');
    fireEvent.click(downloadBtn);

    expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:3000/uploads/imports/errors/err.xlsx'),
        '_blank'
    );
  });

  it('should render failed state (job failed)', () => {
    (useImportProgress as jest.Mock).mockReturnValue({
      progress: 0,
      history: { 
        status: 'FAILED', 
        fileName: 'test.xlsx',
        // Assuming if job failed entirely, counts might be 0 but status is FAILED
        totalRecords: 0,
        successCount: 0,
        failedCount: 0
      },
      isSimulationDone: true
    });

    render(<ImportProgress jobId={jobId} onClose={onClose} />);
    
    expect(screen.getByText('test.xlsx')).toBeInTheDocument();
    expect(screen.getByText('FAILED')).toBeInTheDocument();
    
    // Since failedCount is 0, no error download section.
    // Just empty grid and failed badge.
    expect(screen.queryByText('Phát hiện')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    (useImportProgress as jest.Mock).mockReturnValue({
      progress: 10,
      history: { status: 'PROCESSING' },
      isSimulationDone: false
    });

    render(<ImportProgress jobId={jobId} onClose={onClose} />);
    
    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons[0]; 
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
