import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback patterns for the app.
 * Based on the haptic vocabulary from the UX spec:
 *
 * - light: Light single tap - Confirmation/selection
 * - selection: Light tap for tapping buttons, selections
 * - success: Double medium tap - Positive confirmation
 * - warning: Gentle double pulse - Friendly nudge, attention needed
 * - error: Quick triple buzz - Error/didn't catch
 * - setComplete: Double medium tap - Finishing a set
 * - exerciseComplete: Triple rising tap - Moving to next exercise
 * - sessionComplete: Long satisfying purr - Workout finished
 * - timerWarning: Gentle double pulse - Timer warning (10s left)
 * - timerEnd: Sharp single tap - Rest period over
 */
type HapticType =
  | 'light'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error'
  | 'setComplete'
  | 'exerciseComplete'
  | 'sessionComplete'
  | 'timerWarning'
  | 'timerEnd';

export function useHaptics() {
  const triggerHaptic = useCallback(async (type: HapticType) => {
    // Haptics not available on web
    if (Platform.OS === 'web') return;

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;

        case 'selection':
          await Haptics.selectionAsync();
          break;

        case 'success':
          // Double medium tap
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await delay(80);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;

        case 'warning':
          // Gentle double pulse
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;

        case 'error':
          // Quick triple buzz
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;

        case 'setComplete':
          // Double medium tap
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await delay(80);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;

        case 'exerciseComplete':
          // Triple rising tap
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          await delay(80);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await delay(80);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;

        case 'sessionComplete':
          // Long satisfying purr - notification success
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await delay(150);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          await delay(100);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;

        case 'timerWarning':
          // Gentle double pulse
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          await delay(100);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;

        case 'timerEnd':
          // Sharp single tap
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;

        default:
          await Haptics.selectionAsync();
      }
    } catch (error) {
      // Haptics may not be available on all devices
      console.warn('Haptic feedback not available:', error);
    }
  }, []);

  return { triggerHaptic };
}

/**
 * Helper function to create delays between haptic pulses
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default useHaptics;
