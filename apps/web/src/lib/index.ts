// Animation library
export {
  // Spring physics
  springPresets,
  calculateSpringValue,
  createSpringAnimation,
  // Stagger animations
  getStaggerDelay,
  generateStaggerStyles,
  // Magnetic effects
  calculateMagneticOffset,
  createMagneticHandler,
  // Elastic buttons
  elasticPresets,
  applyElasticEffect,
  // Page transitions
  pageTransitions,
  animatePageEnter,
  // Animation keyframes
  animationKeyframes,
  // Utilities
  lerp,
  clamp,
  mapRange,
  easings,
  cubicBezier,
} from './animations';

export type {
  SpringConfig,
  StaggerConfig,
  MagneticConfig,
  ElasticConfig,
  PageTransition as PageTransitionConfig,
} from './animations';

// Sound system
export {
  sounds,
  setSoundsEnabled,
  isSoundsEnabled,
  setVolume,
  getVolume,
  playClick,
  playToggle,
  playSuccess,
  playComplete,
  playAlert,
  playWarning,
  playError,
  playPop,
  playWhoosh,
  playTap,
  playSwipe,
} from './sounds';

// Haptic feedback
export {
  haptics,
  isHapticSupported,
  isHapticsEnabled,
  setHapticsEnabled,
  hapticPatterns,
  hapticTap,
  hapticClick,
  hapticSelection,
  hapticSuccess,
  hapticWarning,
  hapticError,
  hapticToggle,
  hapticSwipe,
  hapticImpact,
} from './haptics';

export type { HapticIntensity, HapticPattern } from './haptics';

// Scroll effects
export {
  getScrollPosition,
  calculateParallax,
  applyParallax,
  calculateStickyState,
  applyStickyHeader,
  calculateScrollAnimation,
  applyScrollAnimation,
  createFadeInObserver,
  applyFadeInOnScroll,
  createInfiniteScrollObserver,
  applyScrollSnap,
  applyRevealOnScroll,
} from './scroll-effects';

export type {
  ScrollPosition,
  ParallaxConfig,
  StickyHeaderConfig,
  StickyHeaderState,
  ScrollAnimationConfig,
  FadeInConfig,
  InfiniteScrollConfig,
  ScrollSnapConfig,
  RevealConfig,
  RevealDirection,
} from './scroll-effects';

// Analytics - Privacy-respecting analytics system
export {
  analytics,
  trackEvent,
  trackPageView,
  trackFeatureUsed,
  trackTiming,
  setUserProperties,
  trackSessionStarted,
  trackSessionCompleted,
  trackSessionAbandoned,
  trackExerciseSubstituted,
  trackExerciseSkipped,
  trackPainLogged,
  trackCheckinCompleted,
  trackPlanGenerated,
  trackPlanModified,
  AnalyticsEvents,
  Features,
} from './analytics';

export type {
  AnalyticsEvent,
  UserProperties,
  TimingEvent,
  AnalyticsConfig,
  AnalyticsProvider,
  FeatureName,
  AnalyticsEventName,
} from './analytics';

// Error Monitoring
export {
  errorMonitoring,
  captureError,
  captureMessage,
  addBreadcrumb,
  setErrorContext,
  setErrorUser,
  setErrorRoute,
  createErrorBoundaryHandler,
  addHttpBreadcrumb,
  addUIBreadcrumb,
  addUserBreadcrumb,
  wrapWithErrorCapture,
} from './error-monitoring';

export type {
  ErrorContext as MonitoringErrorContext,
  Breadcrumb,
  BreadcrumbType,
  BreadcrumbLevel,
  ErrorReport,
  ErrorMonitoringConfig,
  ErrorMonitoringProvider,
} from './error-monitoring';

// Error Tracking with Rate Limiting
export {
  errorTracker,
  captureError as captureRateLimitedError,
  captureMessage as captureRateLimitedMessage,
  captureAsync,
  getErrorStats,
  createRateLimitedErrorBoundaryHandler,
  captureFetchError,
} from './errorTracking';

export type { RateLimitConfig as ErrorRateLimitConfig } from './errorTracking';

// =============================================================================
// Security Utilities
// =============================================================================

// Input sanitization
export {
  encodeHTML,
  decodeHTML,
  stripXSS,
  sanitizeXSS,
  hasXSSPatterns,
  escapeSQL,
  hasSQLInjectionPatterns,
  validateEmail,
  validateURL,
  validateLength,
  validateAlphanumeric,
  validateNumber,
  sanitizeObject,
  safeJSONParse,
  sanitizePath,
  hasPathTraversal,
} from './sanitize';

export type { ValidationResult } from './sanitize';

// Secure storage
export {
  SecureStorage,
  setSecure,
  getSecure,
  removeSecure,
  clearSecure,
  cleanupSecure,
  storeSensitive,
  getSensitive,
  removeSensitive,
  clearAllSensitive,
  createSecureStorage,
} from './secure-storage';

export type { StorageOptions, StoredItem } from './secure-storage';

// Rate limiting
export {
  RateLimiter,
  RateLimitError,
  createThrottle,
  calculateBackoffDelay,
  withRetry,
  RequestDeduplicator,
  CircuitBreaker,
  CircuitBreakerError,
  CircuitState,
  debounce,
  rateLimitPresets,
  circuitBreakerPresets,
} from './rate-limit';

export type {
  RateLimitConfig,
  ThrottleConfig,
  RetryConfig,
  RateLimitState,
  CircuitBreakerConfig,
} from './rate-limit';

// Authentication
export {
  AuthManager,
  AuthError,
  generateCSRFToken,
  getCSRFToken,
  createAuthHeaders,
  getAuthManager,
  initializeAuth,
  useAuthPlaceholder,
} from './auth';

export type {
  User,
  AuthTokens,
  AuthSession,
  AuthConfig,
  LoginCredentials,
  RegisterData,
  AuthState,
  AuthErrorCode,
} from './auth';

// Secure error handling
export {
  toSafeError,
  getUserFriendlyMessage,
  AppError,
  Errors,
  logError,
  logSecurityEvent,
  withErrorHandling,
  withSyncErrorHandling,
  generateRequestId,
  setErrorReporter,
  reportError,
  isNetworkError,
  isTimeoutError,
  isRetryableError,
  getErrorStatusCode,
  setupGlobalErrorHandlers,
  getRecentErrors,
  getSecurityEvents,
  clearErrorLogs,
} from './error-handling';

export type {
  SafeError,
  ErrorLogEntry,
  ErrorContext,
  ErrorSeverity,
  SecurityEventType,
  ErrorReporter,
  ErrorBoundaryProps,
} from './error-handling';

// Internationalization (i18n)
export {
  // Configuration
  locales,
  defaultLocale,
  localeMetadata,
  // Locale detection & persistence
  getStoredLocale,
  setStoredLocale,
  detectBrowserLocale,
  getCurrentLocale,
  // RTL support
  isRTL,
  getTextDirection,
  // Date/time formatting
  formatDate,
  formatTime,
  formatRelativeTime,
  // Number formatting
  formatNumber,
  formatPercent,
  formatCompactNumber,
  formatCurrency,
  // Pluralization
  getPluralCategory,
  selectPlural,
  pluralize,
  // List formatting
  formatList,
  // Interpolation
  interpolate,
  // Copy package adapter
  createCopyAdapter,
  // Messages
  getMessages,
} from './i18n';

export type {
  Locale,
  LocaleMetadata,
  DateFormatOptions,
  NumberFormatOptions,
  PluralCategory,
  ListStyle,
  ListType,
} from './i18n';

// =============================================================================
// Performance Utilities
// =============================================================================

// Performance optimization utilities
export {
  // Debounce & Throttle
  debounce as debounceFn,
  throttle,
  useDebounce,
  useThrottle,
  useDebouncedValue,
  // Prefetch utilities
  prefetchRoute,
  usePrefetchOnHover,
  // Lazy loading
  createLazyComponent,
  useLazyLoad,
  // Performance measurement
  measurePerformance,
  useRenderCount,
  // Memory optimization
  useDeepMemo,
  // Idle callbacks
  requestIdleCallback,
  cancelIdleCallback,
  useIdleCallback,
  // Resource hints
  preloadResource,
  prefetchResource,
  // Web vitals reporting
  reportWebVitals,
} from './performance';

export type { WebVitalMetric } from './performance';

// Memoization utilities
export {
  createMemoComponent,
  shallowEqual,
  deepEqual as deepEqualMemo,
  createPropsComparison,
  memoize,
  useStableValue,
  useStableCallback,
  usePickedMemo,
  useWhyDidYouRender,
  createLazyValue,
  useLazyInit,
  useComputeOnce,
  createSelector,
  batchUpdates,
  scheduleUpdate,
  cancelScheduledUpdate,
} from './memoization';

// Web Vitals tracking and optimization
export {
  initWebVitals,
  setWebVitalsReporter,
  defaultReporter,
  // Layout shift prevention
  getAspectRatioStyles,
  getImagePlaceholderStyles,
  // Performance marks
  markStart,
  markEnd,
  measureAsync,
  measureSync,
  // Resource timing
  getResourceTimings,
  getSlowResources,
  getLargeResources,
  // Long task detection
  observeLongTasks,
  // Paint timing
  getPaintTimings,
  // Interaction timing
  measureInteractionToPaint,
  // Memory usage
  getMemoryUsage,
  // Bundle tracking
  trackBundleSizes,
  // Performance budget
  checkPerformanceBudget,
} from './web-vitals';

export type {
  WebVitalName,
  WebVitalMetric as WebVitalMetricFull,
  ResourceTiming,
  PaintTiming,
  MemoryInfo,
  PerformanceBudget,
} from './web-vitals';

// =============================================================================
// Copy Package Adapter
// =============================================================================

export {
  createTranslatedCopy,
  getBaseCopy,
  getSafetyDisclaimer,
  getEmergencyMessage,
  getProfessionalMessage,
  getActionText,
  getStatusText,
  getPainLevelText,
  useCopyStrings,
  interpolate as copyInterpolate,
} from './copy-adapter';

export type {
  TranslatedCopy,
  CopyMessages,
} from './copy-adapter';

// =============================================================================
// Exercise i18n
// =============================================================================

export {
  defaultExerciseCatalog,
  defaultExerciseUI,
  getTranslatedExercise,
  getAllTranslatedExercises,
  getExerciseUIString,
  formatSetsCompleted,
  formatReps,
  formatHold,
  formatRest,
  useExerciseTranslation,
} from './exercise-i18n';

export type {
  TranslatedExercise,
  ExerciseCatalog,
  ExerciseTranslations,
} from './exercise-i18n';

// =============================================================================
// Client-Side Encryption
// =============================================================================

export {
  // Key management
  isEncryptionSupported,
  deriveKey,
  generateEncryptionKey,
  exportKey,
  importKey,
  // Encryption/Decryption
  encrypt,
  decrypt,
  encryptWithKey,
  decryptWithKey,
  // Encrypted storage
  EncryptedStorage,
  createEncryptedStorage,
  quickEncrypt,
  quickDecrypt,
  // Hashing
  sha256,
  sha512,
  fingerprint,
  // Secure random
  generateSecureToken,
  generateUUID,
  secureRandomInt,
} from './encryption';

export type {
  EncryptedData,
  KeyDerivationOptions,
  EncryptionOptions,
} from './encryption';

// =============================================================================
// Environment Variable Validation
// =============================================================================

export {
  // Validation
  validateEnv,
  validateEnvOrThrow,
  ENV_DEFINITIONS,
  // Type-safe access
  requireEnv,
  getEnv,
  getBoolEnv,
  getNumEnv,
  env,
  // Documentation generation
  generateEnvDocs,
  generateEnvExample,
} from './env-validation';

export type {
  EnvVarDefinition,
  ValidationResult as EnvValidationResult,
} from './env-validation';
