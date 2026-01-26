'use client';

import { X, ChevronRight, Check, AlertCircle, Info, Loader2 } from 'lucide-react';
import React, { useState, useRef, useEffect, forwardRef, useId } from 'react';

// ============================================
// GLASS CARD COMPONENT
// Frosted glass card with depth and hover effects
// ============================================

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'strong' | 'glow' | 'stat' | 'interactive';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animate?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({
  children,
  variant = 'default',
  hover = true,
  padding = 'md',
  rounded = 'xl',
  animate = false,
  className = '',
  ...props
}, ref) => {
  const variantClasses = {
    default: 'glass-card',
    subtle: 'glass-panel-subtle',
    strong: 'glass-panel-strong',
    glow: 'glass-card-glow',
    stat: 'glass-stat-card',
    interactive: 'glass-card interactive',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const roundedClasses = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    '2xl': 'rounded-[2rem]',
  };

  return (
    <div
      ref={ref}
      className={`
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${roundedClasses[rounded]}
        ${hover && variant !== 'interactive' ? 'hover-lift' : ''}
        ${animate ? 'animate-fadeInUp' : ''}
        ${className}
      `}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});

GlassCard.displayName = 'GlassCard';

// ============================================
// GLASS BUTTON COMPONENT
// Translucent button with glow on hover
// ============================================

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  ripple?: boolean;
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  ripple = true,
  className = '',
  disabled,
  onClick,
  ...props
}, ref) => {
  const [rippleEffect, setRippleEffect] = useState<{ x: number; y: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setRippleEffect({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setTimeout(() => setRippleEffect(null), 600);
    }
    onClick?.(e);
  };

  const variantClasses = {
    primary: 'liquid-button text-white',
    secondary: 'glass-button-ghost text-foreground',
    ghost: 'glass-button-ghost text-[var(--text-muted)] hover:text-foreground',
    danger: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50',
    success: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  };

  const iconSizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <button
      ref={(node) => {
        (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={`
        relative inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-300 overflow-hidden touch-target
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {rippleEffect && (
        <span
          className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
          style={{
            left: rippleEffect.x,
            top: rippleEffect.y,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
      {loading ? (
        <>
          <Loader2 className={`${iconSizeClasses[size]} animate-spin`} />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className={iconSizeClasses[size]}>{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className={iconSizeClasses[size]}>{icon}</span>
          )}
        </>
      )}
    </button>
  );
});

GlassButton.displayName = 'GlassButton';

// ============================================
// GLASS INPUT COMPONENT
// Frosted input field with glow focus
// ============================================

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(({
  label,
  error,
  hint,
  icon,
  iconPosition = 'left',
  className = '',
  id: providedId,
  required,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = providedId || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  // Build aria-describedby
  const describedBy = [
    error ? errorId : null,
    hint && !error ? hintId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {required && (
            <>
              <span aria-hidden="true" className="text-red-500 ml-0.5">*</span>
              <span className="sr-only"> (required)</span>
            </>
          )}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full glass-input px-4 py-2.5 text-foreground
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}
            ${className}
          `}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          aria-required={required}
          required={required}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p
          id={errorId}
          className="text-xs text-red-500 flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-xs text-[var(--text-muted)]">{hint}</p>
      )}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';

// ============================================
// GLASS TEXTAREA COMPONENT
// Frosted textarea with glow focus
// ============================================

interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(({
  label,
  error,
  hint,
  className = '',
  id: providedId,
  required,
  ...props
}, ref) => {
  const generatedId = useId();
  const textareaId = providedId || generatedId;
  const errorId = `${textareaId}-error`;
  const hintId = `${textareaId}-hint`;

  // Build aria-describedby
  const describedBy = [
    error ? errorId : null,
    hint && !error ? hintId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {required && (
            <>
              <span aria-hidden="true" className="text-red-500 ml-0.5">*</span>
              <span className="sr-only"> (required)</span>
            </>
          )}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={`
          w-full glass-input px-4 py-3 text-foreground min-h-[100px] resize-y
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}
          ${className}
        `}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        aria-required={required}
        required={required}
        {...props}
      />
      {error && (
        <p
          id={errorId}
          className="text-xs text-red-500 flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-xs text-[var(--text-muted)]">{hint}</p>
      )}
    </div>
  );
});

GlassTextarea.displayName = 'GlassTextarea';

// ============================================
// GLASS SELECT COMPONENT
// Frosted select dropdown
// ============================================

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string | number; label: string }[];
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(({
  label,
  error,
  hint,
  options,
  className = '',
  id: providedId,
  required,
  ...props
}, ref) => {
  const generatedId = useId();
  const selectId = providedId || generatedId;
  const errorId = `${selectId}-error`;
  const hintId = `${selectId}-hint`;

  // Build aria-describedby
  const describedBy = [
    error ? errorId : null,
    hint && !error ? hintId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {required && (
            <>
              <span aria-hidden="true" className="text-red-500 ml-0.5">*</span>
              <span className="sr-only"> (required)</span>
            </>
          )}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`
          w-full glass-input px-4 py-2.5 text-foreground cursor-pointer
          ${error ? 'border-red-500 focus:border-red-500' : ''}
          ${className}
        `}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        aria-required={required}
        required={required}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p
          id={errorId}
          className="text-xs text-red-500 flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-xs text-[var(--text-muted)]">{hint}</p>
      )}
    </div>
  );
});

GlassSelect.displayName = 'GlassSelect';

// ============================================
// GLASS MODAL COMPONENT
// Floating glass modal with backdrop
// ============================================

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  'aria-describedby'?: string;
}

export function GlassModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  'aria-describedby': ariaDescribedBy,
}: GlassModalProps) {
  const titleId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store the previously focused element and manage body scroll
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';

      // Focus the modal or first focusable element
      const timer = setTimeout(() => {
        if (modalRef.current) {
          const focusable = modalRef.current.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable) {
            focusable.focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 0);

      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
      // Restore focus when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[90vw] max-h-[90vh]',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        ref={modalRef}
        className={`
          relative w-full ${sizeClasses[size]}
          glass-panel-strong p-6 rounded-2xl
          shadow-2xl animate-popIn
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={ariaDescribedBy}
        tabIndex={-1}
      >
        {/* Iridescent top edge - decorative */}
        <div
          className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent"
          aria-hidden="true"
        />

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between mb-4">
            {title && (
              <h2
                id={titleId}
                className="text-lg font-semibold text-foreground"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="glass-button-ghost p-2 rounded-xl ml-auto"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================
// GLASS NAV COMPONENT
// Navigation with glass effect
// ============================================

interface GlassNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
}

interface GlassNavProps {
  items: GlassNavItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'tabs';
  className?: string;
}

export function GlassNav({
  items,
  activeId,
  onSelect,
  orientation = 'vertical',
  variant = 'default',
  className = '',
}: GlassNavProps) {
  const orientationClasses = {
    horizontal: 'flex flex-row items-center gap-1',
    vertical: 'flex flex-col gap-1',
  };

  const itemClasses = {
    default: 'glass-nav-item',
    pills: 'glass-panel-subtle hover:glass-panel rounded-full',
    tabs: 'border-b-2 border-transparent hover:border-[var(--primary)]/50 rounded-none',
  };

  const activeClasses = {
    default: 'glass-nav-item-active text-white',
    pills: 'liquid-button text-white',
    tabs: 'border-[var(--primary)] text-[var(--primary)]',
  };

  return (
    <nav className={`${orientationClasses[orientation]} ${className}`}>
      {items.map((item) => {
        const isActive = activeId === item.id;
        const Component = item.href ? 'a' : 'button';

        return (
          <Component
            key={item.id}
            href={item.href}
            onClick={() => {
              item.onClick?.();
              onSelect?.(item.id);
            }}
            className={`
              flex items-center gap-3 px-4 py-3 text-sm font-medium
              transition-all duration-300 touch-target
              ${itemClasses[variant]}
              ${isActive ? activeClasses[variant] : 'text-[var(--text-muted)] hover:text-foreground'}
            `}
          >
            {item.icon && (
              <span className="relative icon-glow">
                {item.icon}
              </span>
            )}
            <span className="relative z-10">{item.label}</span>
            {item.badge !== undefined && (
              <span className="ml-auto glass-badge-primary text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
            {isActive && variant === 'default' && (
              <ChevronRight className="ml-auto h-4 w-4" />
            )}
          </Component>
        );
      })}
    </nav>
  );
}

// ============================================
// GLASS BADGE COMPONENT
// Pill badges with glass effect
// ============================================

interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

export function GlassBadge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  className = '',
}: GlassBadgeProps) {
  const variantClasses = {
    default: 'glass-badge',
    primary: 'glass-badge-primary',
    success: 'glass-badge-success',
    warning: 'glass-badge-warning',
    error: 'glass-badge-error',
    info: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-500',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  const dotColors = {
    default: 'bg-[var(--text-muted)]',
    primary: 'bg-[var(--primary)]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-cyan-500',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        border backdrop-blur-sm
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`
            h-1.5 w-1.5 rounded-full ${dotColors[variant]}
            ${pulse ? 'animate-pulse' : ''}
          `}
        />
      )}
      {children}
    </span>
  );
}

// ============================================
// GLASS PROGRESS COMPONENT
// Progress bar with liquid fill animation
// ============================================

interface GlassProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  animate?: boolean;
  label?: string;
  className?: string;
}

export function GlassProgress({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showValue = false,
  animate = true,
  label,
  className = '',
}: GlassProgressProps) {
  const progressId = useId();
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variantClasses = {
    default: 'bg-gradient-to-r from-[var(--primary)] to-[#818cf8]',
    success: 'bg-gradient-to-r from-emerald-500 to-green-500',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-500',
    error: 'bg-gradient-to-r from-red-500 to-rose-500',
    gradient: 'bg-gradient-to-r from-[var(--primary)] via-cyan-500 to-emerald-500',
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const glowClasses = {
    default: 'shadow-[0_0_10px_var(--glow-primary)]',
    success: 'shadow-[0_0_10px_var(--glow-success)]',
    warning: 'shadow-[0_0_10px_var(--glow-warning)]',
    error: 'shadow-[0_0_10px_var(--glow-error)]',
    gradient: 'shadow-[0_0_15px_var(--glow-primary)]',
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span id={`${progressId}-label`} className="text-[var(--text-muted)]">
              {label}
            </span>
          )}
          {showValue && (
            <span className="font-medium text-foreground" aria-hidden="true">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`glass-progress rounded-full overflow-hidden ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={`${Math.round(percentage)}%`}
        aria-labelledby={label ? `${progressId}-label` : undefined}
        aria-label={!label ? 'Progress' : undefined}
      >
        <div
          className={`
            h-full rounded-full
            ${variantClasses[variant]}
            ${glowClasses[variant]}
            ${animate ? 'transition-all duration-700 ease-out' : ''}
          `}
          style={{ width: `${percentage}%` }}
        >
          {/* Liquid shimmer effect - decorative */}
          <div className="h-full w-full relative overflow-hidden" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// GLASS TOOLTIP COMPONENT
// Floating glass tooltip
// ============================================

interface GlassTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function GlassTooltip({
  children,
  content,
  position = 'top',
  delay = 200,
}: GlassTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isVisible) {
      setIsVisible(false);
    }
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      onKeyDown={handleKeyDown}
      aria-describedby={isVisible ? tooltipId : undefined}
    >
      {children}
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`
            absolute z-50 pointer-events-none
            ${positionClasses[position]}
          `}
        >
          <div className="glass-tooltip px-3 py-2 text-sm whitespace-nowrap animate-fadeIn shadow-lg">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// GLASS ALERT COMPONENT
// Alert/notification with glass effect
// ============================================

interface GlassAlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  title?: string;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function GlassAlert({
  children,
  variant = 'default',
  title,
  icon,
  dismissible = false,
  onDismiss,
  className = '',
}: GlassAlertProps) {
  const variantClasses = {
    default: 'glass-card border-[var(--glass-border)]',
    success: 'glass-card border-emerald-500/30 bg-emerald-500/5',
    warning: 'glass-card border-amber-500/30 bg-amber-500/5',
    error: 'glass-card border-red-500/30 bg-red-500/5',
    info: 'glass-card border-cyan-500/30 bg-cyan-500/5',
  };

  const iconColors = {
    default: 'text-[var(--text-muted)]',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    error: 'text-red-500',
    info: 'text-cyan-500',
  };

  const defaultIcons = {
    default: <Info className="h-5 w-5" />,
    success: <Check className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  return (
    <div
      className={`
        ${variantClasses[variant]}
        p-4 rounded-xl
        ${className}
      `}
      role="alert"
    >
      <div className="flex gap-3">
        <div className={`flex-shrink-0 ${iconColors[variant]}`}>
          {icon || defaultIcons[variant]}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold text-foreground mb-1">{title}</h4>
          )}
          <div className="text-sm text-[var(--text-muted)]">{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 glass-button-ghost p-1 rounded-lg"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// GLASS DIVIDER COMPONENT
// Subtle glass divider
// ============================================

interface GlassDividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function GlassDivider({
  orientation = 'horizontal',
  className = '',
}: GlassDividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={`w-[1px] bg-gradient-to-b from-transparent via-[var(--glass-border)] to-transparent ${className}`}
      />
    );
  }

  return (
    <div
      className={`h-[1px] bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent ${className}`}
    />
  );
}

// ============================================
// GLASS AVATAR COMPONENT
// Avatar with glass ring effect
// ============================================

interface GlassAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}

export function GlassAvatar({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  status,
  className = '',
}: GlassAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-gray-400',
    away: 'bg-amber-500',
    busy: 'bg-red-500',
  };

  const statusSizes = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full overflow-hidden
          glass-panel border-2 border-[var(--glass-border)]
          flex items-center justify-center font-semibold text-foreground
        `}
      >
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          fallback || alt.charAt(0).toUpperCase()
        )}
      </div>
      {status && (
        <span
          className={`
            absolute bottom-0 right-0
            ${statusSizes[size]} ${statusColors[status]}
            rounded-full border-2 border-[var(--background)]
          `}
        />
      )}
    </div>
  );
}

// ============================================
// GLASS SKELETON COMPONENT
// Loading skeleton with glass shimmer
// ============================================

interface GlassSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function GlassSkeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
}: GlassSkeletonProps) {
  const variantClasses = {
    text: 'rounded-md h-4',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={`
        skeleton skeleton-animate
        ${variantClasses[variant]}
        ${className}
      `}
      style={{ width, height }}
    />
  );
}

// ============================================
// GLASS TOGGLE COMPONENT
// Toggle switch with glass styling
// ============================================

interface GlassToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  id?: string;
}

export function GlassToggle({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
  id: providedId,
}: GlassToggleProps) {
  const generatedId = useId();
  const toggleId = providedId || generatedId;
  const labelId = `${toggleId}-label`;
  const descriptionId = `${toggleId}-description`;

  const sizeClasses = {
    sm: { track: 'h-5 w-9', thumb: 'h-4 w-4', translate: 'translate-x-4' },
    md: { track: 'h-6 w-11', thumb: 'h-5 w-5', translate: 'translate-x-5' },
    lg: { track: 'h-7 w-14', thumb: 'h-6 w-6', translate: 'translate-x-7' },
  };

  const sizes = sizeClasses[size];

  // Build aria-describedby
  const describedBy = description ? descriptionId : undefined;

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              id={labelId}
              htmlFor={toggleId}
              className="font-medium text-foreground cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p id={descriptionId} className="text-sm text-[var(--text-muted)]">
              {description}
            </p>
          )}
        </div>
      )}
      <button
        id={toggleId}
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={describedBy}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex shrink-0 cursor-pointer rounded-full
          transition-all duration-300 ease-in-out
          ${sizes.track}
          ${checked
            ? 'bg-gradient-to-r from-[var(--primary)] to-[#818cf8] shadow-lg shadow-[var(--glow-primary)]'
            : 'glass-panel-subtle'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block rounded-full
            bg-white shadow-lg ring-0
            transition-transform duration-300 ease-in-out
            ${sizes.thumb}
            ${checked ? sizes.translate : 'translate-x-0.5'}
          `}
          style={{ marginTop: '2px', marginLeft: checked ? 0 : '2px' }}
          aria-hidden="true"
        />
        <span className="sr-only">
          {checked ? 'Enabled' : 'Disabled'}
        </span>
      </button>
    </div>
  );
}

// ============================================
// GLASS TABS COMPONENT
// Tabbed navigation with glass effect
// ============================================

interface GlassTabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode; content: React.ReactNode }[];
  defaultTab?: string;
  className?: string;
  'aria-label'?: string;
}

export function GlassTabs({
  tabs,
  defaultTab,
  className = '',
  'aria-label': ariaLabel = 'Content tabs',
}: GlassTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const tablistId = useId();

  const handleKeyDown = (event: React.KeyboardEvent, currentIndex: number) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = tabs.length - 1;
        break;
      case 'ArrowRight':
        event.preventDefault();
        newIndex = currentIndex + 1;
        if (newIndex >= tabs.length) newIndex = 0;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    setActiveTab(tabs[newIndex].id);
    // Focus the new tab
    const tabButton = document.getElementById(`${tablistId}-tab-${tabs[newIndex].id}`);
    tabButton?.focus();
  };

  return (
    <div className={className}>
      {/* Tab headers */}
      <div
        className="glass-panel-subtle rounded-xl p-1 flex gap-1 mb-4 overflow-x-auto scrollbar-hide"
        role="tablist"
        aria-label={ariaLabel}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={`${tablistId}-tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tablistId}-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`
              flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg
              transition-all duration-300 whitespace-nowrap touch-target
              ${activeTab === tab.id
                ? 'liquid-button text-white'
                : 'text-[var(--text-muted)] hover:text-foreground hover:bg-[var(--glass-bg)]'
              }
            `}
          >
            {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`${tablistId}-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`${tablistId}-tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          tabIndex={0}
          className={activeTab === tab.id ? 'animate-fadeIn' : ''}
        >
          {activeTab === tab.id && tab.content}
        </div>
      ))}
    </div>
  );
}

// ============================================
// GLASS ACCORDION COMPONENT
// Collapsible sections with glass styling
// ============================================

interface GlassAccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface GlassAccordionProps {
  items: GlassAccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

export function GlassAccordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className = '',
}: GlassAccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);
  const accordionId = useId();

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);
        const headingId = `${accordionId}-heading-${item.id}`;
        const panelId = `${accordionId}-panel-${item.id}`;

        return (
          <div
            key={item.id}
            className="glass-panel-subtle rounded-xl overflow-hidden transition-all duration-300"
          >
            <button
              id={headingId}
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-[var(--glass-bg)]"
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <div className="flex items-center gap-3">
                {item.icon && (
                  <span className="text-[var(--primary)]" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="font-medium text-foreground">{item.title}</span>
              </div>
              <ChevronRight
                className={`h-5 w-5 text-[var(--text-muted)] transition-transform duration-300 ${
                  isOpen ? 'rotate-90' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headingId}
              hidden={!isOpen}
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-4 pt-0 text-sm text-[var(--text-muted)]">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// GLASS SLIDER COMPONENT
// Range slider with glass styling
// ============================================

interface GlassSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  variant?: 'default' | 'gradient';
  className?: string;
}

export function GlassSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  variant = 'default',
  className = '',
}: GlassSliderProps) {
  const sliderId = useId();
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={sliderId}
              className="text-sm font-medium text-foreground"
            >
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm font-medium text-[var(--primary)]">
              {value}
            </span>
          )}
        </div>
      )}
      <div className="relative h-2 rounded-full glass-panel-subtle">
        {/* Track fill */}
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-200 ${
            variant === 'gradient'
              ? 'bg-gradient-to-r from-[var(--primary)] via-cyan-500 to-emerald-500'
              : 'bg-gradient-to-r from-[var(--primary)] to-[#818cf8]'
          }`}
          style={{ width: `${percentage}%` }}
        >
          {/* Liquid shimmer effect */}
          <div
            className="absolute inset-0 overflow-hidden rounded-full"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
        {/* Native input for accessibility */}
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
        {/* Custom thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-lg border-2 border-[var(--primary)] transition-transform hover:scale-110 pointer-events-none"
          style={{ left: `calc(${percentage}% - 10px)` }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 rounded-full animate-pulse bg-[var(--primary)] opacity-20" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// GLASS CHECKBOX COMPONENT
// Checkbox with glass styling
// ============================================

interface GlassCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export function GlassCheckbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id: providedId,
}: GlassCheckboxProps) {
  const generatedId = useId();
  const checkboxId = providedId || generatedId;
  const descriptionId = `${checkboxId}-description`;

  return (
    <div className="flex items-start gap-3">
      <button
        id={checkboxId}
        role="checkbox"
        aria-checked={checked}
        aria-describedby={description ? descriptionId : undefined}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative flex-shrink-0 w-5 h-5 rounded-md
          transition-all duration-300
          ${checked
            ? 'bg-gradient-to-br from-[var(--primary)] to-[#818cf8] shadow-lg shadow-[var(--glow-primary)]'
            : 'glass-panel-subtle border border-[var(--glass-border)]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        `}
      >
        {checked && (
          <Check
            className="absolute inset-0 m-auto h-3 w-3 text-white animate-popIn"
            aria-hidden="true"
          />
        )}
      </button>
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={checkboxId}
              className={`text-sm font-medium cursor-pointer ${
                disabled ? 'text-[var(--text-muted)]' : 'text-foreground'
              }`}
            >
              {label}
            </label>
          )}
          {description && (
            <p id={descriptionId} className="text-xs text-[var(--text-muted)] mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// GLASS RADIO GROUP COMPONENT
// Radio buttons with glass styling
// ============================================

interface GlassRadioOption {
  value: string;
  label: string;
  description?: string;
}

interface GlassRadioGroupProps {
  options: GlassRadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function GlassRadioGroup({
  options,
  value,
  onChange,
  name,
  label,
  orientation = 'vertical',
  className = '',
}: GlassRadioGroupProps) {
  const groupId = useId();

  return (
    <div className={className}>
      {label && (
        <label
          id={`${groupId}-label`}
          className="block text-sm font-medium text-foreground mb-3"
        >
          {label}
        </label>
      )}
      <div
        role="radiogroup"
        aria-labelledby={label ? `${groupId}-label` : undefined}
        className={`
          ${orientation === 'horizontal' ? 'flex flex-wrap gap-3' : 'space-y-2'}
        `}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          const optionId = `${groupId}-${option.value}`;

          return (
            <button
              key={option.value}
              id={optionId}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={`
                flex items-start gap-3 p-3 rounded-xl text-left
                transition-all duration-300
                ${isSelected
                  ? 'glass-panel border border-[var(--primary)]/30 bg-[var(--primary)]/5'
                  : 'glass-panel-subtle hover:bg-[var(--glass-bg)]'
                }
                ${orientation === 'horizontal' ? 'flex-1 min-w-[150px]' : 'w-full'}
              `}
            >
              <div
                className={`
                  flex-shrink-0 w-5 h-5 rounded-full border-2
                  flex items-center justify-center
                  transition-all duration-300
                  ${isSelected
                    ? 'border-[var(--primary)] bg-[var(--primary)]'
                    : 'border-[var(--glass-border)]'
                  }
                `}
                aria-hidden="true"
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-white animate-popIn" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground">
                  {option.label}
                </span>
                {option.description && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {option.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// GLASS DROPDOWN COMPONENT
// Dropdown menu with glass styling
// ============================================

interface GlassDropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}

interface GlassDropdownProps {
  trigger: React.ReactNode;
  items: GlassDropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function GlassDropdown({
  trigger,
  items,
  align = 'left',
  className = '',
}: GlassDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={dropdownId}
        className="focus-ring"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={dropdownId}
          role="menu"
          aria-orientation="vertical"
          onKeyDown={handleKeyDown}
          className={`
            absolute z-50 mt-2 min-w-[200px]
            glass-panel-strong rounded-xl py-1 shadow-lg
            animate-popIn origin-top
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          {items.map((item) => (
            <button
              key={item.id}
              role="menuitem"
              onClick={() => {
                if (!item.disabled) {
                  item.onClick?.();
                  setIsOpen(false);
                }
              }}
              disabled={item.disabled}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                transition-colors
                ${item.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : item.danger
                    ? 'text-red-500 hover:bg-red-500/10'
                    : 'text-foreground hover:bg-[var(--glass-bg)]'
                }
              `}
            >
              {item.icon && (
                <span
                  className={item.danger ? 'text-red-500' : 'text-[var(--text-muted)]'}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
              )}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// GLASS SPINNER COMPONENT
// Loading spinner with glass styling
// ============================================

interface GlassSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function GlassSpinner({ size = 'md', className = '' }: GlassSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`
        ${sizeClasses[size]}
        rounded-full
        border-[var(--glass-border)]
        border-t-[var(--primary)]
        animate-spin
        ${className}
      `}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// ============================================
// GLASS CHIP COMPONENT
// Interactive chips with glass styling
// ============================================

interface GlassChipProps {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function GlassChip({
  children,
  selected = false,
  onClick,
  onRemove,
  icon,
  className = '',
}: GlassChipProps) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
        text-sm font-medium transition-all duration-300
        ${selected
          ? 'liquid-button text-white'
          : 'glass-panel-subtle text-foreground hover:bg-[var(--glass-bg)]'
        }
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
        ${className}
      `}
      aria-pressed={selected}
    >
      {icon && <span className="h-4 w-4" aria-hidden="true">{icon}</span>}
      {children}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 -mr-1 p-0.5 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Remove"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </button>
  );
}

// Export all components
export default {
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
  GlassAccordion,
  GlassSlider,
  GlassCheckbox,
  GlassRadioGroup,
  GlassDropdown,
  GlassSpinner,
  GlassChip,
};
