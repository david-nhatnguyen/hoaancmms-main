/**
 * Orchestrates haptic feedback for mobile interactions
 */
export const triggerHapticFeedback = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof window === 'undefined' || !window.navigator.vibrate) return;
  
  switch (intensity) {
    case 'heavy':
      window.navigator.vibrate(20);
      break;
    case 'medium':
      window.navigator.vibrate(10);
      break;
    case 'light':
    default:
      window.navigator.vibrate(5);
      break;
  }
};
