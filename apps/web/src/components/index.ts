export { Sidebar } from './Sidebar';
export { Breadcrumbs } from './Breadcrumbs';
export {
  AmbientInsight,
  AmbientInsightStack,
  FloatingInsight,
  ReadinessIndicator,
} from './AmbientInsight';
export {
  AIAssistant,
  FloatingAIAssistant,
  InlineAIAssistant,
  AIPresenceIndicator,
  AIIndicator,
  ReadinessCard,
  PatternInsightsList,
  TimeAwareGreeting,
  EncouragementBanner,
  DailySummaryCard,
  QuickTip,
} from './AIAssistant';
export {
  SmartSuggestion,
  SmartSuggestionRow,
  ContextualTip,
  QuickAction,
  TryAlternative,
} from './SmartSuggestion';

// Loading states and skeletons
export {
  Skeleton,
  SkeletonStatCard,
  SkeletonSessionCard,
  SkeletonListItem,
  SkeletonBodyRegion,
  SkeletonPage,
  Spinner,
  LoadingOverlay,
  ProgressBar,
  PullToRefreshIndicator,
  OptimisticWrapper,
} from './Skeleton';

// Micro-interaction components
export {
  AnimatedButton,
  MagneticButton,
  RippleButton,
  AnimatedCard,
  StaggeredList,
  AnimatedToggle,
  AnimatedCounter,
  FocusRing,
  AnimatedIcon,
  AnimatedPresence,
} from './MicroInteractions';

// Page transitions and animations
export {
  PageTransition,
  StaggerContainer,
  RevealOnScroll,
  AnimatedNumber,
  ShimmerBlock,
  PulseIndicator,
} from './PageTransition';

// Liquid Glass UI Design System - visionOS inspired
export {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassTextarea,
  GlassSelect,
  GlassModal,
  GlassNav,
  GlassBadge,
  GlassProgress,
  GlassTooltip,
  GlassAlert,
  GlassDivider,
  GlassAvatar,
  GlassSkeleton,
  GlassToggle,
  GlassTabs,
  // New advanced glass components
  GlassAccordion,
  GlassSlider,
  GlassCheckbox,
  GlassRadioGroup,
  GlassDropdown,
  GlassSpinner,
  GlassChip,
} from './GlassUI';

// Analytics and Error Monitoring
export {
  AnalyticsProvider,
  useAnalyticsContext,
  AnalyticsErrorBoundary,
  ConsentBanner,
  Features,
} from './AnalyticsProvider';

export type {
  AnalyticsProviderProps,
  AnalyticsContextValue,
  WebVitals,
} from './AnalyticsProvider';

// PWA Components
export { InstallPrompt } from './InstallPrompt';
export { NotificationPrompt } from './NotificationPrompt';
export { OfflineIndicator } from './OfflineIndicator';
export { UpdatePrompt } from './UpdatePrompt';
export { PWAProvider, usePWA } from './PWAProvider';

// Performance Components - Lazy Loading & Suspense
export {
  SuspenseBoundary,
  DashboardSkeleton,
  BodyMapSkeleton,
  ProgressSkeleton,
  SettingsSkeleton,
  HistorySkeleton,
  PageLoadingSkeleton,
  LazyLoadWrapper,
  PrefetchLink,
  // Lazy chart components - use these instead of direct recharts imports
  LazyLineChart,
  LazyAreaChart,
  LazyBarChart,
  LazyResponsiveContainer,
  LazyLine,
  LazyArea,
  LazyBar,
  LazyXAxis,
  LazyYAxis,
  LazyCartesianGrid,
  LazyTooltip,
  LazyLegend,
  LazyChartWrapper,
  RouteLoadingIndicator,
  ErrorFallback,
} from './LazyComponents';

// Optimized Image Components
export {
  OptimizedImage,
  LazyImage,
  ResponsiveImage,
  AvatarImage,
  BackgroundImage,
  BLUR_PLACEHOLDERS,
  generateBlurPlaceholder,
} from './OptimizedImage';

// Virtualized Lists
export {
  VirtualList,
  VirtualGrid,
  InfiniteScroll,
  WindowedItem,
} from './VirtualList';

// Web Vitals Tracking
export {
  WebVitalsProvider,
  useWebVitals,
  WebVitalsDisplay,
  PerformanceBudgetWarning,
} from './WebVitalsProvider';

// Accessibility Components
// Note: useReducedMotion is exported from hooks/useMediaQuery.ts, not here to avoid duplicate exports
export {
  SkipLink,
  VisuallyHidden,
  LiveRegion,
  AnnouncerProvider,
  useAnnouncer,
  FocusTrap,
  useRovingTabIndex,
  useKeyboardShortcuts,
  useFocusManagement,
  AccessibleIconButton,
  AccessibleHeading,
  AccessibleLink,
  AccessibleLoading,
  AccessibleProgress,
  AccessibleError,
  AccessibleDescription,
  RequiredIndicator,
  // Note: useHighContrastMode is exported from hooks/useA11y.tsx to avoid duplicates
  // New WCAG 2.1 AA compliance components
  AnimationPauseControl,
  AccessibleSlider,
  StatusIndicator,
  AccessibleForm,
  AccessibleTable,
  MainLandmark,
  NavigationLandmark,
  AsideLandmark,
  FooterLandmark,
  HeaderLandmark,
  SearchLandmark,
  A11yTestingOverlay,
  // useReducedMotion is available from hooks/index.ts
} from './A11y';

// Keyboard Shortcuts
export {
  KeyboardShortcutsProvider,
  KeyboardShortcutsButton,
} from './KeyboardShortcuts';

// Internationalization (i18n)
export {
  LocaleSwitcher,
  LocaleFlag,
} from './LocaleSwitcher';
