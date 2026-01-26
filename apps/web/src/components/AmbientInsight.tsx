'use client';

import {
  Lightbulb,
  Eye,
  Heart,
  AlertTriangle,
  X,
  ArrowRight,
  Sparkles,
  PartyPopper,
  Info,
  TrendingUp,
  Zap,
  Target,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';

import type { AIInsight } from '../lib/ambient-ai';

interface AmbientInsightProps {
  insight: AIInsight;
  onDismiss: (insightId: string) => void;
  onPermanentDismiss?: (dismissKey: string) => void;
  onActionClick?: (insight: AIInsight) => void;
  onView?: (insightId: string, durationMs: number) => void;
  autoDismissDelay?: number;
  index?: number;
  variant?: 'default' | 'compact' | 'elevated' | 'minimal';
  showProgress?: boolean;
}

const typeConfig = {
  tip: {
    icon: Info,
    bgClass: 'bg-cyan-500/5 border-cyan-500/20',
    iconClass: 'text-cyan-500 bg-cyan-500/10',
    glowClass: 'shadow-cyan-500/10',
  },
  suggestion: {
    icon: Lightbulb,
    bgClass: 'bg-primary/5 border-primary/20',
    iconClass: 'text-primary bg-primary/10',
    glowClass: 'shadow-primary/10',
  },
  observation: {
    icon: Eye,
    bgClass: 'bg-info/5 border-info/20',
    iconClass: 'text-info bg-info/10',
    glowClass: 'shadow-info/10',
  },
  encouragement: {
    icon: Heart,
    bgClass: 'bg-success/5 border-success/20',
    iconClass: 'text-success bg-success/10',
    glowClass: 'shadow-success/10',
  },
  celebration: {
    icon: PartyPopper,
    bgClass: 'bg-gradient-to-r from-amber-500/10 to-rose-500/10 border-amber-500/30',
    iconClass: 'text-amber-500 bg-gradient-to-br from-amber-500/20 to-rose-500/20',
    glowClass: 'shadow-amber-500/20',
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-warning/5 border-warning/20',
    iconClass: 'text-warning bg-warning/10',
    glowClass: 'shadow-warning/10',
  },
};

// Category-specific icons for more context
const categoryIcons: Partial<Record<AIInsight['category'], React.ComponentType<{ className?: string }>>> = {
  progress: TrendingUp,
  exercise: Zap,
  streak: Target,
  time: Clock,
  pattern: Sparkles,
};

export function AmbientInsight({
  insight,
  onDismiss,
  onPermanentDismiss,
  onActionClick,
  onView,
  autoDismissDelay = 15000,
  index = 0,
  variant = 'default',
  showProgress = true,
}: AmbientInsightProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showDismissOptions, setShowDismissOptions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const viewStartTimeRef = useRef<number | null>(null);

  const config = typeConfig[insight.type] || typeConfig.suggestion;
  const CategoryIcon = categoryIcons[insight.category];
  const Icon = CategoryIcon || config.icon;
  const isCelebration = insight.type === 'celebration';
  const isElevated = variant === 'elevated';
  const isCompact = variant === 'compact';
  const isMinimal = variant === 'minimal';

  // Fade in animation on mount
  useEffect(() => {
    const fadeInTimer = setTimeout(() => {
      setIsVisible(true);
      viewStartTimeRef.current = Date.now();
    }, 100 + index * 150); // Stagger fade-in for multiple insights

    return () => clearTimeout(fadeInTimer);
  }, [index]);

  // Intersection Observer to detect when card is read
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.8) {
            setIsRead(true);
          }
        });
      },
      { threshold: 0.8 }
    );

    if (cardRef.current) {
      observerRef.current.observe(cardRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Track view duration when component unmounts or insight changes
  useEffect(() => {
    return () => {
      if (viewStartTimeRef.current && onView) {
        const duration = Date.now() - viewStartTimeRef.current;
        onView(insight.id, duration);
      }
    };
  }, [insight.id, onView]);

  // Auto-dismiss after reading (pause on hover)
  useEffect(() => {
    if (isRead && insight.dismissible && insight.priority !== 'high' && !isHovered) {
      autoDismissTimerRef.current = setTimeout(() => {
        handleDismiss();
      }, autoDismissDelay);
    }

    return () => {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }
    };
  }, [isRead, insight.dismissible, insight.priority, autoDismissDelay, isHovered]);

  const handleDismiss = useCallback(() => {
    // Track view duration before dismissing
    if (viewStartTimeRef.current && onView) {
      const duration = Date.now() - viewStartTimeRef.current;
      onView(insight.id, duration);
      viewStartTimeRef.current = null;
    }

    setIsExiting(true);
    setTimeout(() => {
      onDismiss(insight.id);
    }, 300);
  }, [insight.id, onDismiss, onView]);

  const handlePermanentDismiss = useCallback(() => {
    if (insight.dismissKey && onPermanentDismiss) {
      onPermanentDismiss(insight.dismissKey);
    }
    handleDismiss();
  }, [insight.dismissKey, onPermanentDismiss, handleDismiss]);

  const handleActionClick = useCallback(() => {
    if (onActionClick) {
      onActionClick(insight);
    }
  }, [insight, onActionClick]);

  // Minimal variant
  if (isMinimal) {
    return (
      <div
        ref={cardRef}
        className={`
          inline-flex items-center gap-2 text-sm
          transition-all duration-300
          ${isVisible ? 'opacity-100' : 'opacity-0'}
          ${isExiting ? 'opacity-0' : ''}
        `}
        role="status"
        aria-live="polite"
      >
        <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        <span className="text-muted">{insight.message}</span>
        {insight.action && (
          <Link
            href={insight.action.href}
            onClick={handleActionClick}
            className="text-primary hover:underline font-medium"
          >
            {insight.action.label}
          </Link>
        )}
      </div>
    );
  }

  // Compact variant
  if (isCompact) {
    return (
      <div
        ref={cardRef}
        className={`
          flex items-center gap-2 py-2 px-3 rounded-lg border
          ${config.bgClass}
          transition-all duration-300
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
          ${isExiting ? 'opacity-0 scale-95' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="status"
        aria-live="polite"
      >
        <Icon className={`h-4 w-4 flex-shrink-0 ${config.iconClass.split(' ')[0]}`} aria-hidden="true" />
        <p className="text-sm text-foreground flex-1 truncate">{insight.message}</p>
        {insight.action && (
          <Link
            href={insight.action.href}
            onClick={handleActionClick}
            className="text-primary hover:underline text-sm font-medium whitespace-nowrap"
          >
            {insight.action.label}
          </Link>
        )}
        {insight.dismissible && (
          <button
            onClick={handleDismiss}
            className="p-1 text-muted hover:text-foreground rounded"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={`
        relative rounded-xl border p-4 transition-all duration-500 ease-out
        ${config.bgClass}
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        ${isExiting ? 'opacity-0 translate-y-2 scale-95' : ''}
        ${isCelebration ? 'celebration-glow' : ''}
        ${isElevated ? `shadow-lg ${config.glowClass}` : ''}
        ${isHovered ? 'scale-[1.01]' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`flex-shrink-0 p-2 rounded-lg ${config.iconClass} ${
            isCelebration ? 'animate-bounce-subtle' : ''
          } ${isHovered ? 'scale-110' : ''} transition-transform duration-300`}
          aria-hidden="true"
        >
          <Icon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground leading-relaxed">
            {insight.message}
          </p>

          {insight.action && (
            <Link
              href={insight.action.href}
              onClick={handleActionClick}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group"
            >
              {insight.action.label}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          )}
        </div>

        {/* Dismiss button with options */}
        {insight.dismissible && (
          <div className="relative flex-shrink-0">
            <button
              onClick={() => {
                if (insight.permanentDismissable && onPermanentDismiss) {
                  setShowDismissOptions(!showDismissOptions);
                } else {
                  handleDismiss();
                }
              }}
              className="p-1 rounded-full text-muted hover:text-foreground hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={insight.permanentDismissable ? 'Dismiss options' : 'Dismiss insight'}
              aria-expanded={showDismissOptions}
              aria-haspopup={insight.permanentDismissable ? 'menu' : undefined}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Dismiss options dropdown */}
            {showDismissOptions && insight.permanentDismissable && (
              <div
                className="absolute right-0 top-full mt-1 z-10 w-40 rounded-lg border border-border bg-card shadow-lg overflow-hidden animate-fadeIn"
                role="menu"
                aria-label="Dismiss options"
              >
                <button
                  onClick={handleDismiss}
                  className="w-full px-3 py-2 text-left text-xs text-foreground hover:bg-surface transition-colors focus:outline-none focus:bg-surface"
                  role="menuitem"
                >
                  Dismiss this time
                </button>
                <button
                  onClick={handlePermanentDismiss}
                  className="w-full px-3 py-2 text-left text-xs text-muted hover:bg-surface hover:text-foreground transition-colors border-t border-border focus:outline-none focus:bg-surface"
                  role="menuitem"
                >
                  Don't show again
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reading progress indicator (subtle) - not for celebrations */}
      {showProgress && isRead && insight.priority !== 'high' && !isCelebration && !isHovered && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface overflow-hidden rounded-b-xl">
          <div
            className="h-full bg-primary/30 transition-all ease-linear"
            style={{
              width: isRead && !isHovered ? '100%' : '0%',
              transitionDuration: `${autoDismissDelay}ms`,
            }}
          />
        </div>
      )}

      {/* Celebration sparkle effect */}
      {isCelebration && isVisible && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl" aria-hidden="true">
          <Sparkles className="absolute top-1 right-8 h-3 w-3 text-amber-400/60 animate-pulse" />
          <Sparkles className="absolute bottom-2 left-4 h-2 w-2 text-rose-400/40 animate-pulse delay-300" />
          {isHovered && (
            <>
              <Sparkles className="absolute top-3 left-8 h-2 w-2 text-amber-300/50 animate-ping" />
              <Sparkles className="absolute bottom-4 right-12 h-2.5 w-2.5 text-rose-300/50 animate-ping delay-150" />
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Container for multiple insights with stacking behavior
interface AmbientInsightStackProps {
  insights: AIInsight[];
  onDismiss: (insightId: string) => void;
  onPermanentDismiss?: (dismissKey: string) => void;
  onActionClick?: (insight: AIInsight) => void;
  onView?: (insightId: string, durationMs: number) => void;
  maxVisible?: number;
  variant?: 'default' | 'compact' | 'elevated' | 'minimal';
  showProgress?: boolean;
  showRemaining?: boolean;
}

export function AmbientInsightStack({
  insights,
  onDismiss,
  onPermanentDismiss,
  onActionClick,
  onView,
  maxVisible = 2,
  variant = 'default',
  showProgress = true,
  showRemaining = false,
}: AmbientInsightStackProps) {
  const visibleInsights = insights.slice(0, maxVisible);
  const remainingCount = insights.length - maxVisible;

  if (visibleInsights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {visibleInsights.map((insight, index) => (
        <AmbientInsight
          key={insight.id}
          insight={insight}
          onDismiss={onDismiss}
          onPermanentDismiss={onPermanentDismiss}
          onActionClick={onActionClick}
          onView={onView}
          index={index}
          variant={variant}
          showProgress={showProgress}
        />
      ))}
      {showRemaining && remainingCount > 0 && (
        <p className="text-xs text-muted text-center py-1">
          +{remainingCount} more insight{remainingCount > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

// Floating insight that appears at the top of the screen
interface FloatingInsightProps {
  insight: AIInsight | null;
  onDismiss: (insightId: string) => void;
  onActionClick?: (insight: AIInsight) => void;
  position?: 'top' | 'bottom';
}

export function FloatingInsight({
  insight,
  onDismiss,
  onActionClick,
  position = 'top',
}: FloatingInsightProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (insight) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [insight]);

  if (!insight) return null;

  const positionClasses = position === 'top'
    ? 'top-4 left-1/2 -translate-x-1/2'
    : 'bottom-4 left-1/2 -translate-x-1/2';

  return (
    <div
      className={`
        fixed ${positionClasses} z-50 w-full max-w-md px-4
        transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
    >
      <AmbientInsight
        insight={insight}
        onDismiss={onDismiss}
        onActionClick={onActionClick}
        variant="elevated"
        showProgress={false}
      />
    </div>
  );
}

// Readiness indicator component
interface ReadinessIndicatorProps {
  score: number;
  label: string;
  suggestion: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ReadinessIndicator({
  score,
  label,
  suggestion,
  size = 'md',
}: ReadinessIndicatorProps) {
  const sizeClasses = {
    sm: 'h-12 w-12 text-sm',
    md: 'h-16 w-16 text-base',
    lg: 'h-20 w-20 text-lg',
  };

  const getColorClass = () => {
    if (score >= 70) return 'from-emerald-500 to-green-500';
    if (score >= 40) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-red-500';
  };

  return (
    <div className="flex items-center gap-4">
      <div className={`relative ${sizeClasses[size]} rounded-full flex items-center justify-center`}>
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-surface"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={`text-transparent bg-gradient-to-r ${getColorClass()}`}
            fill="none"
            stroke="url(#readinessGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${score}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <defs>
            <linearGradient id="readinessGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'} />
              <stop offset="100%" stopColor={score >= 70 ? '#22c55e' : score >= 40 ? '#f97316' : '#dc2626'} />
            </linearGradient>
          </defs>
        </svg>
        <span className="font-bold text-foreground">{score}</span>
      </div>
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted">{suggestion}</p>
      </div>
    </div>
  );
}

export default AmbientInsight;
