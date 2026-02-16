import { renderHook, act } from '@testing-library/react';
import { useEquipmentHistory } from './useEquipmentHistory';

describe('useEquipmentHistory', () => {
    it('should initialize with default active tab "pm"', () => {
        const { result } = renderHook(() => useEquipmentHistory('eq-123'));
        expect(result.current.activeTab).toBe('pm');
    });

    it('should allow changing tabs', () => {
        const { result } = renderHook(() => useEquipmentHistory('eq-123'));

        act(() => {
            result.current.setActiveTab('incident');
        });

        expect(result.current.activeTab).toBe('incident');
    });

    it('should handle selection of PM items', () => {
        const { result } = renderHook(() => useEquipmentHistory('eq-123'));
        const mockPM = result.current.pmHistory[0];

        act(() => {
            result.current.handlers.handleSelectPM(mockPM);
        });
        expect(result.current.selectedPM).toEqual(mockPM);
        expect(result.current.selectedIncident).toBeNull();
    });

    it('should handle selection of Incident items', () => {
        const { result } = renderHook(() => useEquipmentHistory('eq-123'));
        const mockIncident = result.current.incidentHistory[0];

        act(() => {
            result.current.handlers.handleSelectIncident(mockIncident);
        });
        expect(result.current.selectedIncident).toEqual(mockIncident);
    });

    it('should switch from incident to repair correctly', () => {
        const { result } = renderHook(() => useEquipmentHistory('eq-123'));
        const mockIncident = result.current.incidentHistory[0]; // CM-112026-003
        const linkedRepairCode = mockIncident.linkedRepair; // RP-112026-002

        act(() => {
            result.current.handlers.handleSelectIncident(mockIncident);
        });

        act(() => {
            result.current.handlers.handleSwitchToRepair(linkedRepairCode!);
        });

        expect(result.current.selectedIncident).toBeNull();
        expect(result.current.selectedRepair?.repairCode).toBe(linkedRepairCode);
    });

    it('should close all drawers', () => {
        const { result } = renderHook(() => useEquipmentHistory('eq-123'));

        act(() => {
            result.current.handlers.handleSelectPM(result.current.pmHistory[0]);
        });

        expect(result.current.selectedPM).not.toBeNull();

        act(() => {
            result.current.handlers.closeDrawers();
        });

        expect(result.current.selectedPM).toBeNull();
        expect(result.current.selectedIncident).toBeNull();
        expect(result.current.selectedRepair).toBeNull();
    });
});
