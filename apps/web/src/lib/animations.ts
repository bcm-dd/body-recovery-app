/**
 * Advanced Animation Library
 * Spring physics, stagger animations, magnetic hover effects, elastic button feedback
 */

// ============================================
// SPRING PHYSICS ENGINE
// ============================================

export interface SpringConfig {
  stiffness: number;    // Spring stiffness (tension)
  damping: number;      // Damping ratio
  mass: number;         // Mass of the object
  velocity?: number;    // Initial velocity
}

export const springPresets: Record<string, SpringConfig> = {
  // Gentle, natural motion
  gentle: { stiffness: 120, damping: 14, mass: 1 },
  // Snappy, responsive motion
  snappy: { stiffness: 400, damping: 30, mass: 1 },
  // Bouncy, playful motion
  bouncy: { stiffness: 300, damping: 10, mass: 1 },
  // Stiff, precise motion
  stiff: { stiffness: 700, damping: 35, mass: 1 },
  // Soft, slow motion
  soft: { stiffness: 100, damping: 20, mass: 1 },
  // Wobbly, elastic motion
  wobbly: { stiffness: 180, damping: 12, mass: 1 },
  // Default balanced motion
  default: { stiffness: 200, damping: 20, mass: 1 },
};

/**
 * Calculate spring animation values
 * Uses a simple damped harmonic oscillator model
 */
export function calculateSpringValue(
  current: number,
  target: number,
  velocity: number,
  config: SpringConfig,
  deltaTime: number
): { value: number; velocity: number; done: boolean } {
  const { stiffness, damping, mass } = config;

  const displacement = current - target;
  const springForce = -stiffness * displacement;
  const dampingForce = -damping * velocity;
  const acceleration = (springForce + dampingForce) / mass;

  const newVelocity = velocity + acceleration * deltaTime;
  const newValue = current + newVelocity * deltaTime;

  // Check if animation is essentially complete
  const isComplete =
    Math.abs(newVelocity) < 0.001 &&
    Math.abs(newValue - target) < 0.001;

  return {
    value: isComplete ? target : newValue,
    velocity: isComplete ? 0 : newVelocity,
    done: isComplete,
  };
}

/**
 * Create a spring animation that runs in requestAnimationFrame
 */
export function createSpringAnimation(
  from: number,
  to: number,
  config: SpringConfig,
  onUpdate: (value: number) => void,
  onComplete?: () => void
): () => void {
  let current = from;
  let velocity = config.velocity ?? 0;
  let lastTime = performance.now();
  let animationId: number | null = null;
  let isCancelled = false;

  const animate = (currentTime: number) => {
    if (isCancelled) return;

    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.064); // Cap at ~16fps
    lastTime = currentTime;

    const result = calculateSpringValue(current, to, velocity, config, deltaTime);
    current = result.value;
    velocity = result.velocity;

    onUpdate(current);

    if (result.done) {
      onComplete?.();
    } else {
      animationId = requestAnimationFrame(animate);
    }
  };

  animationId = requestAnimationFrame(animate);

  // Return cancel function
  return () => {
    isCancelled = true;
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
    }
  };
}

// ============================================
// STAGGER ANIMATIONS
// ============================================

export interface StaggerConfig {
  staggerDelay: number;     // Delay between each item (ms)
  initialDelay?: number;    // Initial delay before first item (ms)
  direction?: 'forward' | 'backward' | 'center';
}

/**
 * Calculate delay for each item in a stagger sequence
 */
export function getStaggerDelay(
  index: number,
  total: number,
  config: StaggerConfig
): number {
  const { staggerDelay, initialDelay = 0, direction = 'forward' } = config;

  let adjustedIndex = index;

  if (direction === 'backward') {
    adjustedIndex = total - 1 - index;
  } else if (direction === 'center') {
    const center = (total - 1) / 2;
    adjustedIndex = Math.abs(index - center);
  }

  return initialDelay + adjustedIndex * staggerDelay;
}

/**
 * CSS keyframe generator for stagger animations
 */
export function generateStaggerStyles(
  total: number,
  config: StaggerConfig
): string {
  let styles = '';
  for (let i = 0; i < total; i++) {
    const delay = getStaggerDelay(i, total, config);
    styles += `
      &:nth-child(${i + 1}) {
        animation-delay: ${delay}ms;
      }
    `;
  }
  return styles;
}

// ============================================
// MAGNETIC HOVER EFFECTS
// ============================================

export interface MagneticConfig {
  strength: number;     // 0-1, how strongly element follows cursor
  radius: number;       // Max distance of effect in pixels
  scale?: number;       // Scale multiplier on hover
}

/**
 * Calculate magnetic offset based on cursor position
 */
export function calculateMagneticOffset(
  cursorX: number,
  cursorY: number,
  elementRect: DOMRect,
  config: MagneticConfig
): { x: number; y: number; isInRange: boolean } {
  const { strength, radius } = config;

  const centerX = elementRect.left + elementRect.width / 2;
  const centerY = elementRect.top + elementRect.height / 2;

  const distanceX = cursorX - centerX;
  const distanceY = cursorY - centerY;
  const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

  if (distance > radius) {
    return { x: 0, y: 0, isInRange: false };
  }

  // Stronger effect closer to center
  const factor = 1 - distance / radius;
  const offsetX = distanceX * strength * factor;
  const offsetY = distanceY * strength * factor;

  return { x: offsetX, y: offsetY, isInRange: true };
}

/**
 * Create a magnetic hover handler
 */
export function createMagneticHandler(
  element: HTMLElement,
  config: MagneticConfig
): () => void {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const offset = calculateMagneticOffset(e.clientX, e.clientY, rect, config);

    if (offset.isInRange) {
      element.style.transform = `translate(${offset.x}px, ${offset.y}px) scale(${config.scale ?? 1})`;
    } else {
      element.style.transform = '';
    }
  };

  const handleMouseLeave = () => {
    element.style.transform = '';
  };

  document.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseleave', handleMouseLeave);
    element.style.transform = '';
  };
}

// ============================================
// ELASTIC BUTTON FEEDBACK
// ============================================

export interface ElasticConfig {
  scaleDown: number;    // Scale when pressed (e.g., 0.95)
  duration: number;     // Animation duration in ms
  easing: string;       // CSS easing function
}

export const elasticPresets: Record<string, ElasticConfig> = {
  subtle: { scaleDown: 0.98, duration: 100, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  normal: { scaleDown: 0.95, duration: 150, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  bouncy: { scaleDown: 0.9, duration: 200, easing: 'cubic-bezier(0.34, 2, 0.64, 1)' },
};

/**
 * Apply elastic click effect to an element
 */
export function applyElasticEffect(
  element: HTMLElement,
  config: ElasticConfig = elasticPresets.normal
): () => void {
  const originalTransition = element.style.transition;
  const originalTransform = element.style.transform;

  const handlePointerDown = () => {
    element.style.transition = `transform ${config.duration}ms ${config.easing}`;
    element.style.transform = `${originalTransform} scale(${config.scaleDown})`;
  };

  const handlePointerUp = () => {
    element.style.transform = originalTransform;
  };

  const handlePointerLeave = () => {
    element.style.transform = originalTransform;
  };

  element.addEventListener('pointerdown', handlePointerDown);
  element.addEventListener('pointerup', handlePointerUp);
  element.addEventListener('pointerleave', handlePointerLeave);

  return () => {
    element.removeEventListener('pointerdown', handlePointerDown);
    element.removeEventListener('pointerup', handlePointerUp);
    element.removeEventListener('pointerleave', handlePointerLeave);
    element.style.transition = originalTransition;
    element.style.transform = originalTransform;
  };
}

// ============================================
// PAGE TRANSITION CHOREOGRAPHY
// ============================================

export interface PageTransition {
  name: string;
  enter: {
    initial: Record<string, number | string>;
    animate: Record<string, number | string>;
    transition: { duration: number; easing: string };
  };
  exit: {
    animate: Record<string, number | string>;
    transition: { duration: number; easing: string };
  };
}

export const pageTransitions: Record<string, PageTransition> = {
  fade: {
    name: 'fade',
    enter: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 300, easing: 'ease-out' },
    },
    exit: {
      animate: { opacity: 0 },
      transition: { duration: 200, easing: 'ease-in' },
    },
  },
  slideUp: {
    name: 'slideUp',
    enter: {
      initial: { opacity: 0, transform: 'translateY(20px)' },
      animate: { opacity: 1, transform: 'translateY(0)' },
      transition: { duration: 400, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' },
    },
    exit: {
      animate: { opacity: 0, transform: 'translateY(-10px)' },
      transition: { duration: 200, easing: 'ease-in' },
    },
  },
  slideRight: {
    name: 'slideRight',
    enter: {
      initial: { opacity: 0, transform: 'translateX(-20px)' },
      animate: { opacity: 1, transform: 'translateX(0)' },
      transition: { duration: 400, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' },
    },
    exit: {
      animate: { opacity: 0, transform: 'translateX(20px)' },
      transition: { duration: 200, easing: 'ease-in' },
    },
  },
  scale: {
    name: 'scale',
    enter: {
      initial: { opacity: 0, transform: 'scale(0.95)' },
      animate: { opacity: 1, transform: 'scale(1)' },
      transition: { duration: 350, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
    },
    exit: {
      animate: { opacity: 0, transform: 'scale(0.98)' },
      transition: { duration: 200, easing: 'ease-in' },
    },
  },
};

/**
 * Apply page enter animation
 */
export function animatePageEnter(
  element: HTMLElement,
  transition: PageTransition = pageTransitions.slideUp
): void {
  const { initial, animate, transition: timing } = transition.enter;

  // Apply initial state
  Object.entries(initial).forEach(([key, value]) => {
    (element.style as unknown as Record<string, unknown>)[key] = value;
  });

  // Force reflow
  element.offsetHeight;

  // Apply animation
  element.style.transition = `all ${timing.duration}ms ${timing.easing}`;
  Object.entries(animate).forEach(([key, value]) => {
    (element.style as unknown as Record<string, unknown>)[key] = value;
  });
}

// ============================================
// CSS ANIMATION KEYFRAMES (for Tailwind/CSS)
// ============================================

export const animationKeyframes = {
  // Fade animations
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  fadeOut: `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `,

  // Slide animations
  slideInUp: `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  slideInDown: `
    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  slideInLeft: `
    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `,
  slideInRight: `
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `,

  // Scale animations
  scaleIn: `
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `,
  scaleOut: `
    @keyframes scaleOut {
      from {
        opacity: 1;
        transform: scale(1);
      }
      to {
        opacity: 0;
        transform: scale(0.95);
      }
    }
  `,

  // Bounce/elastic animations
  bounceIn: `
    @keyframes bounceIn {
      0% {
        opacity: 0;
        transform: scale(0.3);
      }
      50% {
        transform: scale(1.05);
      }
      70% {
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
  `,
  elasticScale: `
    @keyframes elasticScale {
      0% { transform: scale(1); }
      30% { transform: scale(0.95); }
      100% { transform: scale(1); }
    }
  `,

  // Shimmer animation for loading
  shimmer: `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `,

  // Pulse animations
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
  pulseScale: `
    @keyframes pulseScale {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `,

  // Wiggle animation
  wiggle: `
    @keyframes wiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-3deg); }
      75% { transform: rotate(3deg); }
    }
  `,

  // Float animation
  float: `
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `,

  // Spin animation
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,

  // Progress bar animation
  progressIndeterminate: `
    @keyframes progressIndeterminate {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(400%); }
    }
  `,
};

// ============================================
// UTILITY: INTERPOLATION FUNCTIONS
// ============================================

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Map a value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// ============================================
// EASING FUNCTIONS
// ============================================

export const easings = {
  // Standard easing
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // Cubic easing
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  // Elastic easing
  easeOutElastic: (t: number) => {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
  },

  // Bounce easing
  easeOutBounce: (t: number) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },

  // Back easing (overshoot)
  easeOutBack: (t: number) => {
    const s = 1.70158;
    return (t = t - 1) * t * ((s + 1) * t + s) + 1;
  },
};

/**
 * Create a custom cubic bezier easing function
 */
export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): (t: number) => number {
  // Approximate cubic bezier
  return (t: number) => {
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;

    const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
    const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
    const sampleCurveDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

    const solveCurveX = (x: number) => {
      let t2 = x;
      for (let i = 0; i < 8; i++) {
        const x2 = sampleCurveX(t2) - x;
        if (Math.abs(x2) < 1e-6) return t2;
        const d2 = sampleCurveDerivativeX(t2);
        if (Math.abs(d2) < 1e-6) break;
        t2 = t2 - x2 / d2;
      }
      return t2;
    };

    return sampleCurveY(solveCurveX(t));
  };
}
