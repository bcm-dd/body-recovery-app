/**
 * @app/ui - Shared UI Components Package
 *
 * This package provides cross-platform UI components for the
 * Movement & Recovery Companion app, built with Tamagui.
 *
 * @example
 * ```tsx
 * import { Button, Text, Card, BodyMap, useTheme } from '@app/ui';
 * import { config } from '@app/ui/theme';
 * ```
 */

// Theme exports
export * from './theme';

// Primitive component exports
export * from './primitives';

// Composite component exports
export * from './components';

// Hook exports
export * from './hooks';

// Re-export commonly used Tamagui utilities
export {
  styled,
  Stack,
  XStack,
  YStack,
  Theme,
  TamaguiProvider,
  useThemeName,
} from 'tamagui';

// Re-export types for convenience
export type { GetProps } from 'tamagui';
