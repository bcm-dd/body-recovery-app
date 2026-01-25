'use client';

import React, { useRef, useEffect, useState, useCallback, forwardRef } from 'react';

import { useReducedMotion } from '../hooks/useMediaQuery';
import { useSpring } from '../hooks/useSpring';
import { haptics } from '../lib/haptics';
import { sounds } from '../lib/sounds';

// ============================================
// ANIMATED BUTTON
// ============================================

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  haptic?: boolean;
  sound?: boolean;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      haptic = true,
      sound = false,
      className = '',
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isPressed, setIsPressed] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    const variantClasses = {
      primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary',
      secondary: 'bg-surface text-foreground border border-border hover:bg-card active:bg-surface',
      ghost: 'text-foreground hover:bg-surface active:bg-card',
      danger: 'bg-error text-white hover:bg-error/90 active:bg-error',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
    };

    const handlePointerDown = () => {
      if (disabled) return;
      setIsPressed(true);
      if (haptic) haptics.tap();
    };

    const handlePointerUp = () => {
      setIsPressed(false);
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (sound) sounds.click();
      onClick?.(e);
    };

    const scale = isPressed && !prefersReducedMotion ? 0.97 : 1;

    return (
      <button
        ref={ref}
        className={`
          relative inline-flex items-center justify-center rounded-lg font-medium
          transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        style={{
          transform: `scale(${scale})`,
          transition: prefersReducedMotion ? 'none' : 'transform 0.1s ease-out, background-color 0.15s',
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </span>
        )}
        <span className={`inline-flex items-center ${loading ? 'invisible' : ''}`}>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </span>
      </button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

// ============================================
// MAGNETIC BUTTON
// ============================================

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  strength?: number;
  radius?: number;
  children: React.ReactNode;
}

export function MagneticButton({
  strength = 0.3,
  radius = 100,
  children,
  className = '',
  ...props
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      if (distance < radius) {
        const factor = 1 - distance / radius;
        setOffset({
          x: distanceX * strength * factor,
          y: distanceY * strength * factor,
        });
      } else {
        setOffset({ x: 0, y: 0 });
      }
    };

    const handleMouseLeave = () => {
      setOffset({ x: 0, y: 0 });
    };

    document.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength, radius, prefersReducedMotion]);

  return (
    <button
      ref={buttonRef}
      className={className}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: offset.x === 0 && offset.y === 0 ? 'transform 0.3s ease-out' : 'none',
      }}
      {...props}
    >
      {children}
    </button>
  );
}

// ============================================
// RIPPLE BUTTON
// ============================================

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string;
}

export function RippleButton({
  children,
  className = '',
  color = 'rgba(255, 255, 255, 0.3)',
  onClick,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    onClick?.(e);
  };

  return (
    <button
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      {...props}
    >
      {ripples.map(({ x, y, id }) => (
        <span
          key={id}
          className="absolute rounded-full animate-ripple pointer-events-none"
          style={{
            left: x,
            top: y,
            backgroundColor: color,
          }}
        />
      ))}
      {children}
    </button>
  );
}

// ============================================
// ANIMATED CARD
// ============================================

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: 'lift' | 'glow' | 'scale' | 'none';
  delay?: number;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, hover = 'lift', delay = 0, className = '', style, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();

    const hoverClasses = {
      lift: 'hover:-translate-y-1 hover:shadow-lg',
      glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
      scale: 'hover:scale-[1.02]',
      none: '',
    };

    return (
      <div
        ref={ref}
        className={`
          transition-all duration-300 ease-out
          ${prefersReducedMotion ? '' : hoverClasses[hover]}
          ${className}
        `}
        style={{
          ...style,
          animationDelay: `${delay}ms`,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

// ============================================
// STAGGERED LIST
// ============================================

interface StaggeredListProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function StaggeredList({
  children,
  delay = 50,
  className = '',
  as: Component = 'div',
}: StaggeredListProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Component className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        return (
          <div
            key={index}
            className="animate-fadeInUp"
            style={{
              animationDelay: prefersReducedMotion ? '0ms' : `${index * delay}ms`,
              animationFillMode: 'backwards',
            }}
          >
            {child}
          </div>
        );
      })}
    </Component>
  );
}

// ============================================
// ANIMATED TOGGLE
// ============================================

interface AnimatedToggleProps {
  enabled: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  haptic?: boolean;
  sound?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AnimatedToggle({
  enabled,
  onToggle,
  size = 'md',
  haptic = true,
  sound = true,
  disabled = false,
  className = '',
}: AnimatedToggleProps) {
  const prefersReducedMotion = useReducedMotion();

  const sizeConfig = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
  };

  const config = sizeConfig[size];

  const handleToggle = () => {
    if (disabled) return;
    if (haptic) haptics.toggleFeedback();
    if (sound) sounds.toggleSound(!enabled);
    onToggle();
  };

  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={handleToggle}
      disabled={disabled}
      className={`
        relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${config.track}
        ${enabled ? 'bg-primary' : 'bg-border'}
        ${className}
      `}
      style={{
        transition: prefersReducedMotion ? 'none' : 'background-color 0.2s ease-out',
      }}
    >
      <span
        className={`
          pointer-events-none inline-block rounded-full bg-white shadow ring-0
          ${config.thumb}
          ${enabled ? config.translate : 'translate-x-0'}
        `}
        style={{
          transition: prefersReducedMotion ? 'none' : 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
    </button>
  );
}

// ============================================
// ANIMATED COUNTER
// ============================================

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    const startTime = performance.now();
    const startValue = displayValue;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (value - startValue) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, prefersReducedMotion]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// ============================================
// FOCUS RING
// ============================================

interface FocusRingProps {
  children: React.ReactElement;
  offset?: number;
  color?: string;
}

export function FocusRing({
  children,
  offset = 2,
  color = 'var(--primary)',
}: FocusRingProps) {
  return React.cloneElement(children, {
    className: `${children.props.className || ''} focus-ring`,
    style: {
      ...children.props.style,
      '--focus-ring-offset': `${offset}px`,
      '--focus-ring-color': color,
    },
  });
}

// ============================================
// ANIMATED ICON
// ============================================

interface AnimatedIconProps {
  icon: React.ReactNode;
  animation?: 'spin' | 'pulse' | 'bounce' | 'shake' | 'none';
  trigger?: 'always' | 'hover' | 'active';
  className?: string;
}

export function AnimatedIcon({
  icon,
  animation = 'none',
  trigger = 'always',
  className = '',
}: AnimatedIconProps) {
  const [isTriggered, setIsTriggered] = useState(trigger === 'always');
  const prefersReducedMotion = useReducedMotion();

  const animationClasses = {
    spin: 'animate-spin',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    shake: 'animate-wiggle',
    none: '',
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') setIsTriggered(true);
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') setIsTriggered(false);
  };

  const handleClick = () => {
    if (trigger === 'active') {
      setIsTriggered(true);
      setTimeout(() => setIsTriggered(false), 500);
    }
  };

  return (
    <span
      className={`inline-flex ${isTriggered && !prefersReducedMotion ? animationClasses[animation] : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {icon}
    </span>
  );
}

// ============================================
// ANIMATED PRESENCE
// ============================================

interface AnimatedPresenceProps {
  show: boolean;
  children: React.ReactNode;
  animation?: 'fade' | 'slideUp' | 'slideDown' | 'scale' | 'slideLeft' | 'slideRight';
  duration?: number;
  className?: string;
}

export function AnimatedPresence({
  show,
  children,
  animation = 'fade',
  duration = 200,
  className = '',
}: AnimatedPresenceProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsAnimating(false);
      }, prefersReducedMotion ? 0 : duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, prefersReducedMotion]);

  if (!shouldRender) return null;

  const animationStyles: Record<string, React.CSSProperties> = {
    fade: {
      opacity: show ? 1 : 0,
    },
    slideUp: {
      opacity: show ? 1 : 0,
      transform: show ? 'translateY(0)' : 'translateY(10px)',
    },
    slideDown: {
      opacity: show ? 1 : 0,
      transform: show ? 'translateY(0)' : 'translateY(-10px)',
    },
    scale: {
      opacity: show ? 1 : 0,
      transform: show ? 'scale(1)' : 'scale(0.95)',
    },
    slideLeft: {
      opacity: show ? 1 : 0,
      transform: show ? 'translateX(0)' : 'translateX(10px)',
    },
    slideRight: {
      opacity: show ? 1 : 0,
      transform: show ? 'translateX(0)' : 'translateX(-10px)',
    },
  };

  return (
    <div
      className={className}
      style={{
        ...animationStyles[animation],
        transition: prefersReducedMotion ? 'none' : `all ${duration}ms ease-out`,
      }}
    >
      {children}
    </div>
  );
}
