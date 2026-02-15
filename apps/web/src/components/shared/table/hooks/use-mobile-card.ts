import { useState, useCallback } from 'react';
import { triggerHapticFeedback } from '../handlers/mobile-card.handler';

interface UseMobileCardProps {
  onToggleSelection?: () => void;
}

/**
 * Custom hook to manage MobileCard state and interactions
 * Decouples stateful logic from the presentational component
 */
export const useMobileCard = ({
  onToggleSelection
}: UseMobileCardProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const openSheet = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSheetOpen(true);
    triggerHapticFeedback('light');
  }, []);

  const closeSheet = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  const handleSelection = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelection?.();
    triggerHapticFeedback('medium');
  }, [onToggleSelection]);

  return {
    isSheetOpen,
    openSheet,
    closeSheet,
    handleSelection,
  };
};
