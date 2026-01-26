/**
 * Web App Exports
 * @app/web - Next.js companion web application
 *
 * This is the web companion for the Body Recovery app.
 * It provides a desktop-friendly interface for:
 * - Viewing and editing the body map
 * - Tracking progress and pain trends
 * - Reviewing session history
 * - Managing settings and preferences
 *
 * Micro-interactions System:
 * - Spring physics animations
 * - Gesture support (swipe, pinch, long-press)
 * - Sound design (Web Audio API)
 * - Haptic feedback patterns
 * - Scroll effects and parallax
 * - Skeleton loading states
 */

// Components (includes PageTransition component)
export * from './components';

// Hooks
export * from './hooks';

// Libraries (PageTransition type is exported as PageTransitionConfig to avoid conflict)
export {
  // Animation library
  springPresets,
  calculateSpringValue,
  createSpringAnimation,
  getStaggerDelay,
  generateStaggerStyles,
  calculateMagneticOffset,
  createMagneticHandler,
  elasticPresets,
  applyElasticEffect,
  pageTransitions,
  animatePageEnter,
  animationKeyframes,
  lerp,
  clamp,
  mapRange,
  easings,
  cubicBezier,
  // Sound system
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
  // Haptic feedback
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
  // Scroll effects
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
} from './lib';

// Library types
export type {
  SpringConfig,
  StaggerConfig,
  MagneticConfig,
  ElasticConfig,
  PageTransitionConfig,
  HapticIntensity,
  HapticPattern,
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
} from './lib';

// =============================================================================
// Security Utilities
// =============================================================================

export {
  // Input sanitization
  sanitizeXSS,
  encodeHTML,
  stripXSS,
  hasXSSPatterns,
  validateEmail,
  validateURL,
  sanitizeObject,
  safeJSONParse,
  // Secure storage
  storeSensitive,
  getSensitive,
  removeSensitive,
  clearAllSensitive,
  SecureStorage,
  // Encryption
  encrypt,
  decrypt,
  createEncryptedStorage,
  sha256,
  generateSecureToken,
  isEncryptionSupported,
  // Rate limiting
  RateLimiter,
  withRetry,
  CircuitBreaker,
  rateLimitPresets,
  // Auth helpers
  getCSRFToken,
  createAuthHeaders,
  // Error handling
  toSafeError,
  logSecurityEvent,
  Errors,
  setupGlobalErrorHandlers,
  // Environment
  validateEnv,
  validateEnvOrThrow,
  env,
} from './lib';

// Security types
export type {
  ValidationResult,
  EncryptedData,
  RateLimitConfig,
  SafeError,
  SecurityEventType,
  EnvVarDefinition,
} from './lib';
