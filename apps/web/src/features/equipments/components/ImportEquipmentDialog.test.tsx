import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImportEquipmentDialog } from './ImportEquipmentDialog';
import { equipmentsApi } from '@/api/endpoints/equipments.api';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/api/endpoints/equipments.api');
jest.mock('sonner');
jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(({ mutationFn, onSuccess, onError }) => ({
    mutate: (vars: any) => {
        mutationFn(vars)
            .then(onSuccess)
            .catch(onError);
    },
    isPending: false
  }))
}));

describe('ImportEquipmentDialog Component', () => {
  const onOpenChange = jest.fn();
  const onUploadStart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when open is false', () => {
    render(
      <ImportEquipmentDialog 
        open={false} 
        onOpenChange={onOpenChange} 
        onUploadStart={onUploadStart} 
      />
    );
    expect(screen.queryByText('Import Thiết bị')).not.toBeInTheDocument();
  });

  it('should render correctly when open', () => {
    render(
      <ImportEquipmentDialog 
        open={true} 
        onOpenChange={onOpenChange} 
        onUploadStart={onUploadStart} 
      />
    );
    expect(screen.getByText('Import Thiết bị từ Excel')).toBeInTheDocument();
    expect(screen.getByText('File mẫu')).toBeInTheDocument();
  });

  it('should handle template download', async () => {
    const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    (equipmentsApi.getTemplate as jest.Mock).mockResolvedValue(mockBlob);
    
    // Mock URL.createObjectURL
    const mockCreateObjectURL = jest.fn().mockReturnValue('blob:url');
    window.URL.createObjectURL = mockCreateObjectURL;

    render(
      <ImportEquipmentDialog 
        open={true} 
        onOpenChange={onOpenChange} 
        onUploadStart={onUploadStart} 
      />
    );
    
    const downloadBtn = screen.getByText('File mẫu');
    fireEvent.click(downloadBtn);

    await waitFor(() => {
        expect(equipmentsApi.getTemplate).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Đã tải xuống file mẫu');
    });
  });

  it('should handle file selection', () => {
    render(
      <ImportEquipmentDialog 
        open={true} 
        onOpenChange={onOpenChange} 
        onUploadStart={onUploadStart} 
      />
    );
    
    const file = new File(['test'], 'machines.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const input = screen.getByTitle('Upload Excel File') as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('machines.xlsx')).toBeInTheDocument();
    expect(screen.getByText('Sẵn sàng')).toBeInTheDocument();
  });

  it('should handle start import mutation', async () => {
    const mockResponse = { data: { importId: 'job-123', estimatedDuration: 5000 } };
    (equipmentsApi.importExcel as jest.Mock).mockResolvedValue(mockResponse);

    render(
        <ImportEquipmentDialog 
          open={true} 
          onOpenChange={onOpenChange} 
          onUploadStart={onUploadStart} 
        />
    );

    // Select file
    const file = new File(['test'], 'data.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const input = screen.getByTitle('Upload Excel File');
    fireEvent.change(input, { target: { files: [file] } });

    // Click Import
    const importBtn = screen.getByText('Import');
    fireEvent.click(importBtn);

    await waitFor(() => {
        expect(equipmentsApi.importExcel).toHaveBeenCalledWith(file);
        expect(onUploadStart).toHaveBeenCalledWith('job-123', 5000, 'data.xlsx');
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should handle cancel action', () => {
    render(
      <ImportEquipmentDialog 
        open={true} 
        onOpenChange={onOpenChange} 
        onUploadStart={onUploadStart} 
      />
    );
    
    const cancelBtn = screen.getByText('Hủy bỏ');
    fireEvent.click(cancelBtn);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
