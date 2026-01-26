import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic pattern definitions based on the UX specification.
 *
 * Pattern vocabulary (users learn these):
 * - Light single tap: Confirmation/selection
 * - Double medium tap: Set complete
 * - Triple rising tap: Exercise complete
 * - Long satisfying purr: Session complete
 * - Gentle double pulse: Friendly nudge (timer warning)
 * - Sharp single tap: Timer ended
 * - Quick triple buzz: Error/didn't catch
 */

export type HapticPattern =
  | 'tap'
  | 'doubleTap'
  | 'tripleTap'
  | 'success'
  | 'warning'
  | 'error'
  | 'setComplete'
  | 'exerciseComplete'
  | 'sessionComplete';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Trigger a specific haptic pattern
 */
export async function triggerHapticPattern(pattern: HapticPattern): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    switch (pattern) {
      case 'tap':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;

      case 'doubleTap':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await delay(80);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;

      case 'tripleTap':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await delay(80);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await delay(80);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;

      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;

      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;

      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;

      case 'setComplete':
        // Double medium tap
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await delay(80);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;

      case 'exerciseComplete':
        // Triple rising intensity
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await delay(80);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await delay(80);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;

      case 'sessionComplete':
        // Long satisfying pattern
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await delay(150);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await delay(100);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await delay(100);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
    }
  } catch (error) {
    // Haptics may fail silently on some devices
    console.warn('Haptic pattern failed:', error);
  }
}

/**
 * Simple impact haptic
 */
export async function impact(
  style: 'light' | 'medium' | 'heavy' = 'medium'
): Promise<void> {
  if (Platform.OS === 'web') return;

  const impactStyle = {
    light: Haptics.ImpactFeedbackStyle.Light,
    medium: Haptics.ImpactFeedbackStyle.Medium,
    heavy: Haptics.ImpactFeedbackStyle.Heavy,
  }[style];

  try {
    await Haptics.impactAsync(impactStyle);
  } catch (error) {
    console.warn('Haptic impact failed:', error);
  }
}

/**
 * Selection haptic (lightest feedback)
 */
export async function selection(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.warn('Haptic selection failed:', error);
  }
}

/**
 * Notification haptic
 */
export async function notification(
  type: 'success' | 'warning' | 'error' = 'success'
): Promise<void> {
  if (Platform.OS === 'web') return;

  const notificationType = {
    success: Haptics.NotificationFeedbackType.Success,
    warning: Haptics.NotificationFeedbackType.Warning,
    error: Haptics.NotificationFeedbackType.Error,
  }[type];

  try {
    await Haptics.notificationAsync(notificationType);
  } catch (error) {
    console.warn('Haptic notification failed:', error);
  }
}

export default {
  triggerHapticPattern,
  impact,
  selection,
  notification,
};
