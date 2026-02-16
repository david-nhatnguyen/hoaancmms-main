import { renderHook, act } from '@testing-library/react';
import { useEquipmentDetail } from './useEquipmentDetail';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the API
jest.mock('@/api/endpoints/equipments.api', () => ({
    equipmentsApi: {
        getByCode: jest.fn(),
    },
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => jest.fn(),
        useParams: () => ({ code: 'EQ-001' }),
    };
});

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/equipments/EQ-001']}>
            {children}
        </MemoryRouter>
    </QueryClientProvider>
);

describe('useEquipmentDetail', () => {
    it('should initialize with default active tab', () => {
        const { result } = renderHook(() => useEquipmentDetail('EQ-001'), { wrapper });
        expect(result.current.activeTab).toBe('info');
    });

    it('should allow changing tabs', () => {
        const { result } = renderHook(() => useEquipmentDetail('EQ-001'), { wrapper });

        act(() => {
            result.current.setActiveTab('history');
        });

        expect(result.current.activeTab).toBe('history');
    });

    it('should provide handlers', () => {
        const { result } = renderHook(() => useEquipmentDetail('EQ-001'), { wrapper });
        expect(result.current.handlers).toBeDefined();
        expect(typeof result.current.handlers.handleGoBack).toBe('function');
        expect(typeof result.current.handlers.handleEdit).toBe('function');
    });
});
