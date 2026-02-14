import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useChecklistDetail } from './useChecklistDetail';
import { MemoryRouter } from 'react-router-dom';

// Mock the modules that use real browser APIs or navigation
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => jest.fn(),
    useParams: () => ({ id: 'cl-001' }),
  };
});

describe('useChecklistDetail', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={['/checklists/cl-001']}>
      {children}
    </MemoryRouter>
  );

  it('should find and return a checklist based on ID', () => {
    const { result } = renderHook(() => useChecklistDetail('cl-001'), { wrapper });

    expect(result.current.checklist).not.toBeNull();
    expect(result.current.checklist?.id).toBe('cl-001');
    expect(result.current.isLoading).toBe(false);
  });

  it('should return null if checklist is not found', () => {
    const { result } = renderHook(() => useChecklistDetail('non-existent-id'), { wrapper });

    expect(result.current.checklist).toBeNull();
  });

  it('should handle tab changes', () => {
    const { result } = renderHook(() => useChecklistDetail('cl-001'), { wrapper });

    expect(result.current.activeTab).toBe('preview');

    act(() => {
      result.current.setActiveTab('info');
    });

    expect(result.current.activeTab).toBe('info');
  });

  it('should provide handlers', () => {
    const { result } = renderHook(() => useChecklistDetail('cl-001'), { wrapper });

    expect(result.current.handlers).toBeDefined();
    expect(typeof result.current.handlers.handleGoBack).toBe('function');
    expect(typeof result.current.handlers.handleCopy).toBe('function');
  });
});
