export { useLocalStorage, createWebStorageAdapter } from './useLocalStorage';
export {
  useMediaQuery,
  useReducedMotion,
  usePrefersDarkMode,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
} from './useMediaQuery';
export {
  useAmbientAI,
  useAmbientGreeting,
  useAmbientOnboarding,
  useReadinessInsight,
  useExerciseSuggestions,
  usePatternInsights,
} from './useAmbientAI';

// Spring animations
export { useSpring, useSpringValues, useSpringTransform } from './useSpring';

// Intersection observer / scroll animations
export {
  useInView,
  useStaggeredInView,
  useScrollProgress,
  useAnimateOnView,
} from './useInView';

// Haptic and sound feedback
export {
  useHaptic,
  useSound,
  useFeedback,
  useButtonFeedback,
  useToggleFeedback,
  useSliderFeedback,
} from './useHaptic';

// Gesture hooks
export {
  useSwipe,
  usePullToRefresh,
  useLongPress,
  usePinchToZoom,
  useDrag,
} from './useGestures';

// Re-export types
export type {
  UseInViewOptions,
  UseInViewReturn,
} from './useInView';

export type {
  SwipeHandlers,
  SwipeOptions,
  PullToRefreshOptions,
  LongPressOptions,
  PinchToZoomOptions,
  DragOptions,
} from './useGestures';

// Analytics hooks
export {
  useAnalytics,
  useSessionAnalytics,
  useFeatureAnalytics,
  useFormAnalytics,
  useTrackOnMount,
  useTrackPageView,
  useTrackVisibility,
  Features as AnalyticsFeatures,
  AnalyticsEvents,
} from './useAnalytics';

export type {
  UseAnalyticsOptions,
  UseAnalyticsReturn,
} from './useAnalytics';

// PWA Hooks
export { useServiceWorker } from './useServiceWorker';
export { useOffline } from './useOffline';
export { useBackgroundSync, SYNC_TAGS } from './useBackgroundSync';

// Internationalization (i18n)
export {
  useI18n,
  useDateFormatter,
  useNumberFormatter,
  useRTLStyles,
} from './useI18n';

export type {
  Locale,
  DateFormatOptions,
  NumberFormatOptions,
  PluralCategory,
} from './useI18n';

// Caching hooks
export {
  useCachedData,
  useOptimisticMutation,
  usePrefetch,
  useInvalidateCache,
  useMemoryCache,
  useStaleWhileRevalidate,
  memoryCache,
} from './useCache';

// Accessibility (A11y) hooks
// Note: useHighContrastMode is aliased to avoid duplicate export with components/A11y.tsx
export {
  useReducedMotion as useA11yReducedMotion,
  useFocusReturn,
  useArrowNavigation,
  useAnnounce,
  useHighContrastMode as useA11yHighContrastMode,
  useFocusVisible,
  useScreenReaderDetection,
  useSkipLinkTarget,
  useTrapFocus,
  useAnimationPause,
  useAccessibleIds,
  useColorScheme,
  useDocumentTitle,
} from './useA11y';
