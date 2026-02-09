import { render, screen, fireEvent } from '@testing-library/react';
import { ResponsiveTable, Column } from './ResponsiveTable';
import * as useMobileHook from '@/hooks/use-mobile';

// Mock useIsMobile hook
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(),
}));

describe('ResponsiveTable', () => {
  interface MockData {
    id: string;
    code: string;
    name: string;
    status: string;
  }

  const mockData: MockData[] = [
    { id: '1', code: 'EQ01', name: 'Equipment 1', status: 'ACTIVE' },
    { id: '2', code: 'EQ02', name: 'Equipment 2', status: 'INACTIVE' },
  ];

  const columns: Column<MockData>[] = [
    {
      key: 'code',
      header: 'Code',
      mobilePriority: 'primary',
      render: (item) => <span>{item.code}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      mobilePriority: 'secondary',
      render: (item) => <span>{item.name}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      mobilePriority: 'metadata',
      render: (item) => <span>{item.status}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      mobilePriority: 'metadata',
      render: () => <span>Tools</span>,
    },
  ];

  const defaultProps = {
    data: mockData,
    columns: columns,
    keyExtractor: (item: MockData) => item.id,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Desktop View', () => {
    beforeEach(() => {
      (useMobileHook.useIsMobile as jest.Mock).mockReturnValue(false);
    });

    it('should render a table with correct headers', () => {
      render(<ResponsiveTable {...defaultProps} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Code')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should render data rows correctly', () => {
      render(<ResponsiveTable {...defaultProps} />);
      
      expect(screen.getByText('EQ01')).toBeInTheDocument();
      expect(screen.getByText('Equipment 1')).toBeInTheDocument();
      expect(screen.getByText('EQ02')).toBeInTheDocument();
      expect(screen.getByText('Equipment 2')).toBeInTheDocument();
    });

    it('should call onRowClick when a row is clicked', () => {
      const onRowClick = jest.fn();
      render(<ResponsiveTable {...defaultProps} onRowClick={onRowClick} />);
      
      fireEvent.click(screen.getByText('EQ01'));
      expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
    });
  });

  describe('Mobile View', () => {
    beforeEach(() => {
      (useMobileHook.useIsMobile as jest.Mock).mockReturnValue(true);
    });

    it('should render cards instead of a table', () => {
      render(<ResponsiveTable {...defaultProps} />);
      
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      
      // Check for primary and secondary info in cards
      expect(screen.getByText('EQ01')).toBeInTheDocument();
      expect(screen.getByText('Equipment 1')).toBeInTheDocument();
    });

    it('should render metadata fields with labels', () => {
      render(<ResponsiveTable {...defaultProps} />);
      
      // Category is a normal metadata field, so its label should be rendered (once per item or just once?)
      // Labels are rendered inside each card. Mock has 2 items.
      expect(screen.getAllByText(/Category/)).toHaveLength(2);
      expect(screen.getAllByText('Tools')).toHaveLength(2);
      
      // Status is special and should be in the top-right
      expect(screen.getAllByText('ACTIVE')).toHaveLength(1);
    });

    it('should respect hiddenOnMobile property', () => {
      const columnsWithHidden = [
        ...columns,
        {
          key: 'hidden',
          header: 'Hidden',
          hiddenOnMobile: true,
          render: () => <span>Hidden content</span>,
        },
      ];
      
      render(<ResponsiveTable {...defaultProps} columns={columnsWithHidden} />);
      
      expect(screen.queryByText('HIDDEN')).not.toBeInTheDocument();
      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });

    it('should call onRowClick when a card is clicked', () => {
      const onRowClick = jest.fn();
      render(<ResponsiveTable {...defaultProps} onRowClick={onRowClick} />);
      
      fireEvent.click(screen.getByText('EQ01').closest('div')!);
      expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
    });
  });

  describe('Selection', () => {
    it('should handle selection across views', () => {
      const onSelectionChange = jest.fn();
      (useMobileHook.useIsMobile as jest.Mock).mockReturnValue(false);
      
      render(
        <ResponsiveTable 
          {...defaultProps} 
          selectedIds={[]} 
          onSelectionChange={onSelectionChange} 
        />
      );

      // In desktop, selection is usually a checkbox. 
      // We'll find all checkboxes and click the one for the first item.
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // Index 0 is select all, 1 is first item
      
      expect(onSelectionChange).toHaveBeenCalledWith(['1']);
    });
  });
});
