// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { triggerHapticFeedback } from './mobile-card.handler';

describe('mobile-card.handler', () => {

  describe('triggerHapticFeedback', () => {
    it('should call navigator.vibrate with correct patterns', () => {
      const vibrateMock = vi.fn();
      vi.stubGlobal('navigator', { vibrate: vibrateMock });

      triggerHapticFeedback('light');
      expect(vibrateMock).toHaveBeenCalledWith(5);

      triggerHapticFeedback('medium');
      expect(vibrateMock).toHaveBeenCalledWith(10);

      triggerHapticFeedback('heavy');
      expect(vibrateMock).toHaveBeenCalledWith(20);
    });
  });
});
