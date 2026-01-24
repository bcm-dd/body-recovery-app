/**
 * Health Adapter Factory
 *
 * Provides the appropriate health adapter based on platform and mode.
 * Use createHealthAdapter() to get a properly configured adapter.
 */

import { HealthAdapter } from './types';
import { MockHealthAdapter } from './mock';
import { HealthKitAdapter } from './healthkit';
import { HealthConnectAdapter } from './healthconnect';

// Re-export types and adapters
export * from './types';
export { MockHealthAdapter } from './mock';
export { HealthKitAdapter } from './healthkit';
export { HealthConnectAdapter } from './healthconnect';

/**
 * Platform type for adapter selection
 */
export type Platform = 'ios' | 'android' | 'web';

/**
 * Adapter type for explicit selection
 */
export type AdapterType = 'native' | 'mock';

/**
 * Singleton state for adapter management
 */
let currentAdapter: HealthAdapter | null = null;
let currentType: AdapterType = 'native';
let currentPlatform: Platform = 'web';

/**
 * Detect the current platform
 * In React Native, use Platform.OS
 * This is a fallback for non-RN environments
 */
function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') {
    return 'web';
  }

  const ua = navigator.userAgent;

  if (/iPhone|iPad|iPod/i.test(ua)) {
    return 'ios';
  }

  if (/Android/i.test(ua)) {
    return 'android';
  }

  return 'web';
}

/**
 * Create a health adapter for the specified platform
 *
 * @param platform - Target platform ('ios', 'android', 'web')
 * @returns Configured health adapter
 *
 * @example
 * ```typescript
 * // Auto-detect platform
 * const adapter = createHealthAdapter();
 *
 * // Explicit platform
 * const iosAdapter = createHealthAdapter('ios');
 *
 * // For demo/testing
 * const mockAdapter = createHealthAdapter('web'); // Returns mock
 * ```
 */
export function createHealthAdapter(platform?: Platform): HealthAdapter {
  const targetPlatform = platform || detectPlatform();
  currentPlatform = targetPlatform;

  if (currentType === 'mock') {
    return new MockHealthAdapter();
  }

  switch (targetPlatform) {
    case 'ios':
      return new HealthKitAdapter();
    case 'android':
      return new HealthConnectAdapter();
    case 'web':
    default:
      // Web always uses mock adapter
      return new MockHealthAdapter();
  }
}

/**
 * Get the current health adapter instance
 * Creates a new one if none exists
 *
 * @param type - Adapter type ('native' or 'mock')
 * @returns Cached or new health adapter
 */
export function getHealthAdapter(type: AdapterType = currentType): HealthAdapter {
  if (currentAdapter && currentType === type) {
    return currentAdapter;
  }

  currentType = type;

  if (type === 'mock') {
    currentAdapter = new MockHealthAdapter();
    return currentAdapter;
  }

  currentAdapter = createHealthAdapter(currentPlatform);
  return currentAdapter;
}

/**
 * Switch to mock adapter (for demo mode)
 * Call getHealthAdapter() after this to get the mock adapter
 */
export function useMockAdapter(): void {
  currentAdapter = new MockHealthAdapter();
  currentType = 'mock';
}

/**
 * Switch to native adapter
 * Call getHealthAdapter() after this to get the platform-appropriate adapter
 */
export function useNativeAdapter(): void {
  currentAdapter = null;
  currentType = 'native';
}

/**
 * Check if currently using mock adapter
 */
export function isMockAdapter(): boolean {
  return currentType === 'mock';
}

/**
 * Check if currently using native adapter
 */
export function isNativeAdapter(): boolean {
  return currentType === 'native';
}

/**
 * Get the current platform
 */
export function getCurrentPlatform(): Platform {
  return currentPlatform;
}

/**
 * Set the platform explicitly
 * Useful for testing or when platform detection fails
 */
export function setPlatform(platform: Platform): void {
  currentPlatform = platform;
  currentAdapter = null; // Reset adapter to use new platform
}

/**
 * Reset adapter state
 * Useful for testing
 */
export function resetAdapter(): void {
  currentAdapter = null;
  currentType = 'native';
  currentPlatform = detectPlatform();
}
