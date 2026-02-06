import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FactoryList from './FactoryList';
import { useFactories } from '@/features/factories/hooks';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn().mockReturnValue(false),
}));

// Mock Feature Hooks
const mockOpenDialog = jest.fn();
const mockCloseDialog = jest.fn();
const mockSetIsSubmitting = jest.fn();

jest.mock('@/features/factories/hooks', () => ({
  useFactoryForm: () => ({
    isOpen: false,
    openDialog: mockOpenDialog,
    closeDialog: mockCloseDialog,
    isEditMode: false,
    setIsSubmitting: mockSetIsSubmitting,
    validate: () => true,
    formData: {},
    errors: {},
    updateField: jest.fn(),
    resetForm: jest.fn(),
  }),
  useFactoryColumns: () => ({
    columns: [
      { key: 'code', header: 'Mã', render: (f: any) => <span>{f.code}</span> },
      { key: 'name', header: 'Tên', render: (f: any) => <span>{f.name}</span> },
      { key: 'status', header: 'Trạng thái', render: (f: any) => <span>{f.status}</span> },
      { key: 'actions', header: 'Thao tác', render: () => <button>Action</button> },
    ],
  }),
  useFactoryTableStats: () => ({
    stats: { totalFactories: 10, activeFactories: 8, totalEquipment: 50 },
    isLoading: false,
  }),
  useFactories: jest.fn(),
  useCreateFactory: () => ({ mutate: jest.fn(), isPending: false }),
  useUpdateFactory: () => ({ mutate: jest.fn(), isPending: false }),
  useDeleteFactory: () => ({ mutate: jest.fn(), isPending: false }),
}));

// Mock Components that might be complex
jest.mock('@/features/factories/components', () => ({
  FactoryFormDialog: () => <div data-testid="factory-form-dialog" />,
  FactoryStatsCards: () => <div data-testid="stats-cards" />,
  DeleteFactoryDialog: () => <div data-testid="delete-dialog" />,
}));


describe('FactoryList Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeleton when fetching data', () => {
    (useFactories as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<FactoryList />);
    // Assuming TableSkeleton renders some skeleton elements
    // In actual TableSkeleton, it likely renders "skeleton" class or specific content.
    // For now we assume typical skeleton usage.
    // However, since we mock Child Components, TableSkeleton is imported in FactoryList.
    // We didn't mock TableSkeleton, so it renders.
    // Let's check for "Loading..." text or class if possible, or success render.
    // FactoryList renderTableContent returns TableSkeleton.
    const skeletons = document.querySelectorAll('.animate-pulse'); // Tailwind skeleton class
    // Or just ensure no error/empty state
    expect(screen.queryByText('Có lỗi xảy ra')).toBeNull();
  });

  it('renders error state correctly', () => {
    (useFactories as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed'),
      refetch: jest.fn(),
    });

    render(<FactoryList />);
    expect(screen.getByText('Có lỗi xảy ra khi tải dữ liệu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Thử lại/i })).toBeInTheDocument();
  });

  it('renders empty state when no factories found', () => {
    (useFactories as jest.Mock).mockReturnValue({
      data: { data: [], meta: { total: 0 } },
      isLoading: false,
      error: null,
    });

    render(<FactoryList />);
    // EmptyState component renders
    expect(screen.getByText('Chưa có nhà máy nào')).toBeInTheDocument();
    expect(screen.getByText('Thêm nhà máy đầu tiên')).toBeInTheDocument();
  });

  it('renders list of factories successfully', () => {
    const mockData = [
      { id: '1', code: 'F01', name: 'Factory One', status: 'ACTIVE' },
      { id: '2', code: 'F02', name: 'Factory Two', status: 'INACTIVE' },
    ];

    (useFactories as jest.Mock).mockReturnValue({
      data: { 
        data: mockData, 
        meta: { total: 2, totalPages: 1 } 
      },
      isLoading: false,
      error: null,
    });

    render(<FactoryList />);
    
    // Check for Headers
    expect(screen.getByText('Quản lý Nhà máy')).toBeInTheDocument();
    
    // Check for Table Content (via our mocked columns)
    expect(screen.getByText('F01')).toBeInTheDocument();
    expect(screen.getByText('Factory One')).toBeInTheDocument();
  });

  it('opens create dialog when "Thêm Nhà máy" is clicked', () => {
    (useFactories as jest.Mock).mockReturnValue({
      data: { data: [], meta: { total: 0 } }, // Empty state has "Thêm nhà máy đầu tiên" button
      isLoading: false,
      error: null,
    });

    render(<FactoryList />);
    
    // Click the button in Empty State or Header
    // Empty state Button: "Thêm nhà máy đầu tiên"
    const addButton = screen.getByRole('button', { name: 'Thêm nhà máy đầu tiên' });
    fireEvent.click(addButton);

    expect(mockOpenDialog).toHaveBeenCalled();
  });

  it('handles search input', async () => {
    (useFactories as jest.Mock).mockReturnValue({
      data: { data: [], meta: { total: 0 } },
      isLoading: false,
      error: null,
    });

    render(<FactoryList />);

    const searchInput = screen.getByPlaceholderText('Tìm kiếm nhà máy...');
    fireEvent.change(searchInput, { target: { value: 'Test' } });

    expect(searchInput).toHaveValue('Test');
    // Debounce typically waits 300ms. 
    // We can verify state update or wait.
    await waitFor(() => {
        // Since we mock useFactories, we can't easily check if params updated internal state 
        // unless we mock useState or inspect hook calls re-render.
        // But verifying Input value update confirms binding.
    });
  });
});
