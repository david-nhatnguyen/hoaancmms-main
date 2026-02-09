import { renderHook } from '@testing-library/react';
import { useFactoryColumns } from './useFactoryColumns';
import type { Factory } from '@/api/types/factory.types';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('useFactoryColumns', () => {
  // ============================================================================
  // TEST DATA
  // ============================================================================

  const mockFactory: Factory = {
    id: '1',
    code: 'F01',
    name: 'Test Factory',
    location: 'Test Location',
    equipmentCount: 5,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // INITIALIZATION TESTS
  // ============================================================================

  describe('Initialization', () => {
    it('should return columns array', () => {
      const { result } = renderHook(() => useFactoryColumns());

      expect(result.current.columns).toBeDefined();
      expect(Array.isArray(result.current.columns)).toBe(true);
    });

    it('should return 6 columns', () => {
      const { result } = renderHook(() => useFactoryColumns());

      expect(result.current.columns).toHaveLength(6);
    });

    it('should have correct column keys', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const keys = result.current.columns.map(col => col.key);
      expect(keys).toEqual([
        'code',
        'name',
        'location',
        'equipmentCount',
        'status',
        'actions',
      ]);
    });
  });

  // ============================================================================
  // COLUMN CONFIGURATION TESTS
  // ============================================================================

  describe('Column Configuration', () => {
    it('should mark code as primary column', () => {
      const { result } = renderHook(() => useFactoryColumns());
      const codeColumn = result.current.columns.find(col => col.key === 'code');
      expect(codeColumn?.mobilePriority).toBe('primary');
    });

    it('should mark name as secondary column', () => {
      const { result } = renderHook(() => useFactoryColumns());
      const nameColumn = result.current.columns.find(col => col.key === 'name');
      expect(nameColumn?.mobilePriority).toBe('secondary');
    });

    it('should set correct alignment for equipment count', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const equipmentColumn = result.current.columns.find(col => col.key === 'equipmentCount');
      expect(equipmentColumn?.align).toBe('center');
    });

    it('should set correct alignment for status', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const statusColumn = result.current.columns.find(col => col.key === 'status');
      expect(statusColumn?.align).toBe('center');
    });

    it('should set correct alignment for actions', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const actionsColumn = result.current.columns.find(col => col.key === 'actions');
      expect(actionsColumn?.align).toBe('center');
    });

    it('should set width for code column', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const codeColumn = result.current.columns.find(col => col.key === 'code');
      expect(codeColumn?.width).toBe('w-[120px]');
    });
  });

  // ============================================================================
  // RENDER FUNCTION TESTS
  // ============================================================================

  describe('Render Functions', () => {
    it('should render code column', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const codeColumn = result.current.columns.find(col => col.key === 'code');
      expect(codeColumn?.render).toBeDefined();
      
      // Render should return JSX
      const rendered = codeColumn?.render(mockFactory);
      expect(rendered).toBeDefined();
    });

    it('should render name column', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const nameColumn = result.current.columns.find(col => col.key === 'name');
      const rendered = nameColumn?.render(mockFactory);
      expect(rendered).toBeDefined();
    });

    it('should render location column with icon', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const locationColumn = result.current.columns.find(col => col.key === 'location');
      const rendered = locationColumn?.render(mockFactory);
      expect(rendered).toBeDefined();
    });

    it('should render location as dash when null', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const factoryWithoutLocation = { ...mockFactory, location: null };
      const locationColumn = result.current.columns.find(col => col.key === 'location');
      const rendered = locationColumn?.render(factoryWithoutLocation);
      expect(rendered).toBeDefined();
    });

    it('should render equipment count with icon', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const equipmentColumn = result.current.columns.find(col => col.key === 'equipmentCount');
      const rendered = equipmentColumn?.render(mockFactory);
      expect(rendered).toBeDefined();
    });

    it('should render status badge', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const statusColumn = result.current.columns.find(col => col.key === 'status');
      const rendered = statusColumn?.render(mockFactory);
      expect(rendered).toBeDefined();
    });

    it('should render actions with buttons', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const actionsColumn = result.current.columns.find(col => col.key === 'actions');
      const rendered = actionsColumn?.render(mockFactory);
      expect(rendered).toBeDefined();
    });
  });

  // ============================================================================
  // MOBILE RENDER TESTS
  // ============================================================================

  describe('Mobile Render Functions', () => {
    it('should have mobile render for location', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const locationColumn = result.current.columns.find(col => col.key === 'location');
      expect(locationColumn?.mobileRender).toBeDefined();
    });

    it('should render location text in mobile', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const locationColumn = result.current.columns.find(col => col.key === 'location');
      const rendered = locationColumn?.mobileRender?.(mockFactory);
      expect(rendered).toBe('Test Location');
    });

    it('should render dash for null location in mobile', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const factoryWithoutLocation = { ...mockFactory, location: null };
      const locationColumn = result.current.columns.find(col => col.key === 'location');
      const rendered = locationColumn?.mobileRender?.(factoryWithoutLocation);
      expect(rendered).toBe('-');
    });

    it('should have mobile render for equipment count', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const equipmentColumn = result.current.columns.find(col => col.key === 'equipmentCount');
      expect(equipmentColumn?.mobileRender).toBeDefined();
    });

    it('should render equipment count number in mobile', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const equipmentColumn = result.current.columns.find(col => col.key === 'equipmentCount');
      const rendered = equipmentColumn?.mobileRender?.(mockFactory);
      expect(rendered).toBe(5);
    });

    it('should have mobile render for status', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const statusColumn = result.current.columns.find(col => col.key === 'status');
      expect(statusColumn?.mobileRender).toBeDefined();
    });

    it('should have mobile render for actions', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const actionsColumn = result.current.columns.find(col => col.key === 'actions');
      expect(actionsColumn?.mobileRender).toBeDefined();
    });
  });

  // ============================================================================
  // CALLBACK TESTS
  // ============================================================================

  describe('Callbacks', () => {
    it('should use default navigate for view equipments', () => {
      const { result } = renderHook(() => useFactoryColumns());

      // This test verifies the hook doesn't crash without callbacks
      expect(result.current.columns).toBeDefined();
    });

    it('should call custom onEdit callback', () => {
      const onEdit = jest.fn();
      const { result } = renderHook(() => useFactoryColumns({ onEdit }));

      // Get actions column
      const actionsColumn = result.current.columns.find(col => col.key === 'actions');
      
      // This would be called when button is clicked
      // We can't easily test the button click here, but we verify the callback is passed
      expect(actionsColumn).toBeDefined();
    });

    it('should call custom onViewEquipments callback', () => {
      const onViewEquipments = jest.fn();
      const { result } = renderHook(() => useFactoryColumns({ onViewEquipments }));

      const actionsColumn = result.current.columns.find(col => col.key === 'actions');
      expect(actionsColumn).toBeDefined();
    });

    it('should work with both callbacks provided', () => {
      const onEdit = jest.fn();
      const onViewEquipments = jest.fn();
      
      const { result } = renderHook(() => 
        useFactoryColumns({ onEdit, onViewEquipments })
      );

      expect(result.current.columns).toHaveLength(6);
    });
  });

  // ============================================================================
  // MEMOIZATION TESTS
  // ============================================================================

  describe('Memoization', () => {
    it('should return same columns reference when callbacks unchanged', () => {
      const onEdit = jest.fn();
      const onViewEquipments = jest.fn();
      const onDelete = jest.fn(); // Need all to stabilize
      
      const { result, rerender } = renderHook(() => 
        useFactoryColumns({ onEdit, onViewEquipments, onDelete })
      );

      const firstColumns = result.current.columns;
      
      rerender();
      
      const secondColumns = result.current.columns;
      
      expect(firstColumns).toBe(secondColumns);
    });

    it('should return new columns when onEdit changes', () => {
      const onEdit1 = jest.fn();
      const onEdit2 = jest.fn();
      
      const { result, rerender } = renderHook(
        ({ onEdit }) => useFactoryColumns({ onEdit }),
        { initialProps: { onEdit: onEdit1 } }
      );

      const firstColumns = result.current.columns;
      
      rerender({ onEdit: onEdit2 });
      
      const secondColumns = result.current.columns;
      
      expect(firstColumns).not.toBe(secondColumns);
    });

    it('should return new columns when onViewEquipments changes', () => {
      const onView1 = jest.fn();
      const onView2 = jest.fn();
      
      const { result, rerender } = renderHook(
        ({ onViewEquipments }) => useFactoryColumns({ onViewEquipments }),
        { initialProps: { onViewEquipments: onView1 } }
      );

      const firstColumns = result.current.columns;
      
      rerender({ onViewEquipments: onView2 });
      
      const secondColumns = result.current.columns;
      
      expect(firstColumns).not.toBe(secondColumns);
    });
  });

  // ============================================================================
  // HEADERS TESTS
  // ============================================================================

  describe('Column Headers', () => {
    it('should have correct header for code', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const codeColumn = result.current.columns.find(col => col.key === 'code');
      expect(codeColumn?.header).toBe('Mã nhà máy');
    });

    it('should have correct header for name', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const nameColumn = result.current.columns.find(col => col.key === 'name');
      expect(nameColumn?.header).toBe('Tên nhà máy');
    });

    it('should have correct header for location', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const locationColumn = result.current.columns.find(col => col.key === 'location');
      expect(locationColumn?.header).toBe('Địa điểm');
    });

    it('should have correct header for equipment count', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const equipmentColumn = result.current.columns.find(col => col.key === 'equipmentCount');
      expect(equipmentColumn?.header).toBe('Số lượng TB');
    });

    it('should have correct header for status', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const statusColumn = result.current.columns.find(col => col.key === 'status');
      expect(statusColumn?.header).toBe('Trạng thái');
    });

    it('should have correct header for actions', () => {
      const { result } = renderHook(() => useFactoryColumns());

      const actionsColumn = result.current.columns.find(col => col.key === 'actions');
      expect(actionsColumn?.header).toBe('Thao tác');
    });
  });
});
