import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EquipmentForm from './EquipmentForm';
import { useEquipment, useCreateEquipment, useUpdateEquipment } from '../features/equipments/hooks/useEquipments';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
jest.mock('../features/equipments/hooks/useEquipments', () => ({
  useEquipment: jest.fn(),
  useCreateEquipment: jest.fn(),
  useUpdateEquipment: jest.fn(),
  STATUS_OPTIONS: [
    { value: 'ACTIVE', label: 'Hoạt động', color: 'bg-green-500' },
    { value: 'INACTIVE', label: 'Ngừng hoạt động', color: 'bg-gray-500' },
    { value: 'MAINTENANCE', label: 'Bảo trì', color: 'bg-yellow-500' }
  ]
}));

jest.mock('@/api/endpoints/factories.api', () => ({
  factoriesApi: {
    getAll: jest.fn().mockResolvedValue({ data: [], meta: { total: 0 } })
  }
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock URL.createObjectURL/revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('EquipmentForm', () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useEquipment as jest.Mock).mockReturnValue({ data: null, isLoading: false });
    (useCreateEquipment as jest.Mock).mockReturnValue({ mutate: mockMutate, isPending: false });
    (useUpdateEquipment as jest.Mock).mockReturnValue({ mutate: mockMutate, isPending: false });
  });

  const renderWithProviders = (initialEntries = ['/equipments/new']) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/equipments/new" element={<EquipmentForm />} />
            <Route path="/equipments/:id/edit" element={<EquipmentForm />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('should render create form correctly', () => {
    renderWithProviders();
    expect(screen.getByText('Thêm thiết bị mới')).toBeInTheDocument();
    expect(screen.getByLabelText(/Mã thiết bị/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tên thiết bị/i)).toBeInTheDocument();
  });

  it('should show validation errors on submit with empty fields', async () => {
    renderWithProviders();
    
    // Find specify button by text or by searching for the Save icon-containing button
    const createBtn = screen.getAllByText('Tạo thiết bị')[0];
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText('Mã thiết bị không được để trống')).toBeInTheDocument();
      expect(screen.getByText('Tên thiết bị không được để trống')).toBeInTheDocument();
      expect(screen.getByText('Chủng loại máy không được để trống')).toBeInTheDocument();
    });
  });

  it('should call create mutation on valid submit', async () => {
    renderWithProviders();
    
    fireEvent.change(screen.getByLabelText(/Mã thiết bị/i), { target: { value: 'EQ-001' } });
    fireEvent.change(screen.getByLabelText(/Tên thiết bị/i), { target: { value: 'Test Machine' } });
    fireEvent.change(screen.getByLabelText(/Chủng loại máy/i), { target: { value: 'CNC' } });

    const createBtn = screen.getAllByText('Tạo thiết bị')[0];
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      // Check if first arg to mutate is FormData
      const call = mockMutate.mock.calls[0][0];
      expect(call).toBeInstanceOf(FormData);
      expect(call.get('code')).toBe('EQ-001');
      expect(call.get('name')).toBe('Test Machine');
    });
  });

  it('should render edit form with pre-filled values', async () => {
    (useEquipment as jest.Mock).mockReturnValue({
      data: {
        data: {
          id: '123',
          code: 'EQ-FIXED',
          name: 'Fixed Machine',
          category: 'Drill',
          status: 'ACTIVE',
          quantity: 2
        }
      },
      isLoading: false
    });

    renderWithProviders(['/equipments/123/edit']);

    expect(screen.getByText('Cập nhật thiết bị')).toBeInTheDocument();
    
    await waitFor(() => {
      expect((screen.getByLabelText(/Mã thiết bị/i) as HTMLInputElement).value).toBe('EQ-FIXED');
      expect((screen.getByLabelText(/Tên thiết bị/i) as HTMLInputElement).value).toBe('Fixed Machine');
    });
  });
});
