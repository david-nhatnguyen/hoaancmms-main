import { render, screen } from '@testing-library/react';
import EquipmentList from './EquipmentList';
import { 
  useEquipments, 
  useEquipmentStats, 
  useDeleteEquipment, 
  useBulkDeleteEquipment 
} from '../features/equipments/hooks/useEquipments';
import { useEquipmentColumns } from '../features/equipments/hooks/useEquipmentColumns';
import { useEquipmentFilters } from '../features/equipments/hooks/useEquipmentFilters';
import { useIsMobile } from '@/hooks/use-mobile'; 
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
jest.mock('../features/equipments/hooks/useEquipments', () => ({
  useEquipments: jest.fn(),
  useEquipmentStats: jest.fn(),
  useDeleteEquipment: jest.fn(),
  useBulkDeleteEquipment: jest.fn()
}));
jest.mock('../features/equipments/hooks/useEquipmentColumns');
jest.mock('../features/equipments/hooks/useEquipmentFilters');
jest.mock('@/hooks/use-mobile');
jest.mock('@/components/ui/sonner', () => ({
  toast: { error: jest.fn() }
}));

// Mock child components
jest.mock('../features/equipments/components/ImportEquipmentDialog', () => ({
  ImportEquipmentDialog: () => <div data-testid="import-dialog" />
}));
jest.mock('../features/equipments/components/ImportProgress', () => ({
  ImportProgress: () => <div data-testid="import-progress" />
}));
jest.mock('../features/equipments/components/EquipmentStats', () => ({
  EquipmentStats: () => <div data-testid="equipment-stats" />
}));
jest.mock('../features/equipments/components/DeleteEquipmentDialog', () => ({
  DeleteEquipmentDialog: () => <div data-testid="delete-dialog" />
}));
jest.mock('@/components/shared/MobileFilters', () => ({
  MobileFilters: () => <div data-testid="mobile-filters" />
}));
jest.mock('@/components/shared/filters/ChipFilter', () => ({
  ChipFilter: () => <div data-testid="chip-filter" />
}));
jest.mock('@/components/shared/filters/MultiSelectDropdown', () => ({
  MultiSelectDropdown: () => <div data-testid="multi-select" />
}));
jest.mock('@/components/shared/table/BulkActionsToolbar', () => ({
  BulkActionsToolbar: () => <div data-testid="bulk-actions" />
}));
jest.mock('../features/equipments/components/EquipmentDesktopFilters', () => ({
  QuickAccessFilters: () => <div data-testid="quick-filters" />
}));

// Mock API
jest.mock('@/api/endpoints/factories.api', () => ({
  factoriesApi: {
    getAll: jest.fn().mockResolvedValue({ data: [] })
  }
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('EquipmentList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    (useEquipments as jest.Mock).mockReturnValue({
      data: {
        data: [
          {
            id: '1',
            name: 'Test Equipment',
            code: 'EQ-001',
            status: 'OPERATING',
            factory: { name: 'Factory A' },
            model: 'Model X',
            serialNumber: 'SN123'
          }
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      },
      isLoading: false,
      error: null
    });

    (useEquipmentStats as jest.Mock).mockReturnValue({
      data: { data: {} },
      isLoading: false
    });

    (useDeleteEquipment as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false
    });

    (useBulkDeleteEquipment as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false
    });

    (useEquipmentColumns as jest.Mock).mockReturnValue({
      columns: [
        { key: 'name', header: 'Name', render: (item: any) => item.name }
      ],
      previewDialog: null
    });

    (useEquipmentFilters as jest.Mock).mockReturnValue({
      filters: {},
      setFilters: jest.fn(),
      debouncedSearch: '',
      handleSearch: jest.fn(),
      handleFilterChange: jest.fn(),
      clearFilters: jest.fn(),
      isFiltersActive: false
    });

    (useIsMobile as jest.Mock).mockReturnValue(false);
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <EquipmentList />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('should render equipment list correctly', async () => {
    renderComponent();
    expect(screen.getByText('Danh sách Thiết bị')).toBeInTheDocument();
  });

  it('should render empty state when no data', () => {
    (useEquipments as jest.Mock).mockReturnValue({
        data: { data: [], meta: { total: 0 } },
        isLoading: false
    });

    renderComponent();

    expect(screen.getByText('Chưa có thiết bị nào')).toBeInTheDocument();
  });

  it('should show mobile layout', () => {
    (useIsMobile as jest.Mock).mockReturnValue(true);

    renderComponent();

    expect(screen.getByText('Thiết bị')).toBeInTheDocument();
  });
});
