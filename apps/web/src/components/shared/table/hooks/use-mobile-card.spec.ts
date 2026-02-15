// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMobileCard } from './use-mobile-card';

describe('useMobileCard', () => {
  it('should initialize with sheet closed', () => {
    const { result } = renderHook(() => useMobileCard({ }));
    expect(result.current.isSheetOpen).toBe(false);
  });

  it('should open and close sheet', () => {
    const { result } = renderHook(() => useMobileCard({ }));
    
    const mockEvent = { stopPropagation: vi.fn() } as any;

    act(() => {
      result.current.openSheet(mockEvent);
    });
    expect(result.current.isSheetOpen).toBe(true);

    act(() => {
      result.current.closeSheet();
    });
    expect(result.current.isSheetOpen).toBe(false);
  });

  it('should call onToggleSelection when handleSelection is triggered', () => {
    const onToggleSelection = vi.fn();
    const { result } = renderHook(() => useMobileCard({ onToggleSelection }));
    
    const mockEvent = { stopPropagation: vi.fn() } as any;
    
    act(() => {
      result.current.handleSelection(mockEvent);
    });

    expect(onToggleSelection).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });
});
