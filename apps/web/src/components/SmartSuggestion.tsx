'use client';

import {
  Zap,
  ArrowRight,
  X,
  Clock,
  Target,
  TrendingUp,
  Activity,
  Sparkles,
  PartyPopper,
  Cloud,
  Info,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Check,
  RefreshCw,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';

import type { AIInsight } from '../lib/ambient-ai';

interface SmartSuggestionProps {
  insight: AIInsight;
  onDismiss?: (insightId: string) => void;
  onPermanentDismiss?: (dismissKey: string) => void;
  onActionClick?: (insight: AIInsight) => void;
  onFeedback?: (insightId: string, helpful: boolean) => void;
  variant?: 'default' | 'compact' | 'banner' | 'inline' | 'card' | 'floating';
  showFeedback?: boolean;
  showAlternative?: boolean;
  alternativeAction?: { label: string; onClick: () => void };
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  greeting: Zap,
  progress: TrendingUp,
  pain: Activity,
  streak: Target,
  time: Clock,
  rest: Clock,
  exercise: Activity,
  celebration: PartyPopper,
  tip: Info,
  weather: Cloud,
  pattern: Sparkles,
};

// Priority-based styling
const priorityStyles = {
  high: 'border-warning/30 bg-warning/5',
  medium: 'border-primary/20 bg-primary/5',
  low: 'border-border bg-card',
};

// Type-based styling for variety
const typeStyles = {
  tip: { bg: 'bg-cyan-500/5', border: 'border-cyan-500/20', icon: 'text-cyan-500 bg-cyan-500/10' },
  suggestion: { bg: 'bg-primary/5', border: 'border-primary/20', icon: 'text-primary bg-primary/10' },
  observation: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', icon: 'text-blue-500 bg-blue-500/10' },
  encouragement: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', icon: 'text-emerald-500 bg-emerald-500/10' },
  celebration: { bg: 'bg-gradient-to-r from-amber-500/10 to-rose-500/10', border: 'border-amber-500/30', icon: 'text-amber-500 bg-amber-500/10' },
  warning: { bg: 'bg-warning/5', border: 'border-warning/20', icon: 'text-warning bg-warning/10' },
};

export function SmartSuggestion({
  insight,
  onDismiss,
  onPermanentDismiss,
  onActionClick,
  onFeedback,
  variant = 'default',
  showFeedback = false,
  showAlternative = false,
  alternativeAction,
}: SmartSuggestionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showDismissOptions, setShowDismissOptions] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'helpful' | 'not_helpful' | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const Icon = categoryIcons[insight.category] || Zap;
  const isCelebration = insight.type === 'celebration';
  const style = typeStyles[insight.type] || typeStyles.suggestion;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowDismissOptions(false);
      }
    };

    if (showDismissOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDismissOptions]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss?.(insight.id);
    }, 200);
  }, [insight.id, onDismiss]);

  const handlePermanentDismiss = useCallback(() => {
    if (insight.dismissKey && onPermanentDismiss) {
      onPermanentDismiss(insight.dismissKey);
    }
    handleDismiss();
  }, [insight.dismissKey, onPermanentDismiss, handleDismiss]);

  const handleDismissClick = useCallback(() => {
    if (insight.permanentDismissable && onPermanentDismiss) {
      setShowDismissOptions(!showDismissOptions);
    } else {
      handleDismiss();
    }
  }, [insight.permanentDismissable, onPermanentDismiss, showDismissOptions, handleDismiss]);

  const handleActionClick = useCallback(() => {
    if (onActionClick) {
      onActionClick(insight);
    }
  }, [insight, onActionClick]);

  const handleFeedback = useCallback((helpful: boolean) => {
    setFeedbackGiven(helpful ? 'helpful' : 'not_helpful');
    if (onFeedback) {
      onFeedback(insight.id, helpful);
    }
    // Auto-dismiss after feedback
    setTimeout(() => {
      handleDismiss();
    }, 1500);
  }, [insight.id, onFeedback, handleDismiss]);

  // Inline variant
  if (variant === 'inline') {
    return (
      <div
        className={`
          inline-flex items-center gap-2 text-sm text-muted
          transition-all duration-300
          ${isVisible ? 'opacity-100' : 'opacity-0'}
          ${isExiting ? 'opacity-0' : ''}
        `}
        role="status"
        aria-live="polite"
      >
        <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        <span>{insight.message}</span>
        {insight.action && (
          <Link
            href={insight.action.href}
            onClick={handleActionClick}
            className="text-primary hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {insight.action.label}
          </Link>
        )}
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div
        className={`
          flex items-center gap-2 py-2 px-3 rounded-lg ${style.bg} border ${style.border}
          transition-all duration-300
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
          ${isExiting ? 'opacity-0 scale-95' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="status"
        aria-live="polite"
      >
        <Icon className={`h-4 w-4 flex-shrink-0 ${style.icon.split(' ')[0]}`} aria-hidden="true" />
        <p className="text-sm text-foreground flex-1 truncate">{insight.message}</p>
        {insight.action && (
          <Link
            href={insight.action.href}
            onClick={handleActionClick}
            className="text-primary hover:underline text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary group"
          >
            {insight.action.label}
            <ChevronRight className="inline h-3 w-3 ml-0.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        )}
        {onDismiss && insight.dismissible && (
          <button
            onClick={handleDismiss}
            className="p-1 text-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded"
            aria-label="Dismiss suggestion"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }

  // Banner variant
  if (variant === 'banner') {
    return (
      <div
        className={`
          relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent
          border border-primary/20 p-4
          transition-all duration-500
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
          ${isExiting ? 'opacity-0 translate-y-2' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className={`flex-shrink-0 p-2 rounded-lg ${style.icon} transition-transform ${isHovered ? 'scale-110' : ''}`} aria-hidden="true">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base text-foreground">{insight.message}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {insight.action && (
              <Link
                href={insight.action.href}
                onClick={handleActionClick}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary group"
              >
                {insight.action.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            )}
            {onDismiss && insight.dismissible && (
              <button
                onClick={handleDismissClick}
                className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Dismiss suggestion"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Decorative gradient overlay on hover */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-primary/10 pointer-events-none" />
        )}
      </div>
    );
  }

  // Card variant - more prominent with optional feedback
  if (variant === 'card') {
    return (
      <div
        className={`
          relative rounded-xl border ${style.border} ${style.bg} p-4 shadow-sm
          transition-all duration-300
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
          ${isExiting ? 'opacity-0 scale-95' : ''}
          ${isHovered ? 'shadow-md' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 p-2 rounded-lg ${style.icon}`} aria-hidden="true">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground leading-relaxed">{insight.message}</p>

            {/* Action buttons row */}
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              {insight.action && (
                <Link
                  href={insight.action.href}
                  onClick={handleActionClick}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group"
                >
                  {insight.action.label}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              )}
              {showAlternative && alternativeAction && (
                <button
                  onClick={alternativeAction.onClick}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  {alternativeAction.label}
                </button>
              )}
            </div>

            {/* Feedback section */}
            {showFeedback && !feedbackGiven && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-muted mb-2">Was this helpful?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFeedback(true)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-muted hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label="Mark as helpful"
                  >
                    <ThumbsUp className="h-3 w-3" aria-hidden="true" />
                    Yes
                  </button>
                  <button
                    onClick={() => handleFeedback(false)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                    aria-label="Mark as not helpful"
                  >
                    <ThumbsDown className="h-3 w-3" aria-hidden="true" />
                    No
                  </button>
                </div>
              </div>
            )}

            {/* Feedback confirmation */}
            {feedbackGiven && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-emerald-500 flex items-center gap-1">
                  <Check className="h-3 w-3" aria-hidden="true" />
                  Thanks for your feedback!
                </p>
              </div>
            )}
          </div>

          {/* Dismiss button with menu */}
          {onDismiss && insight.dismissible && (
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                onClick={handleDismissClick}
                className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={insight.permanentDismissable ? 'Dismiss options' : 'Dismiss suggestion'}
                aria-expanded={showDismissOptions}
                aria-haspopup={insight.permanentDismissable ? 'menu' : undefined}
              >
                {insight.permanentDismissable ? (
                  <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <X className="h-4 w-4" aria-hidden="true" />
                )}
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
      </div>
    );
  }

  // Floating variant - for overlay display
  if (variant === 'floating') {
    return (
      <div
        className={`
          rounded-xl border ${style.border} ${style.bg} p-4 shadow-xl backdrop-blur-sm
          transition-all duration-500
          ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
          ${isExiting ? 'opacity-0 translate-y-4 scale-95' : ''}
        `}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 p-2 rounded-lg ${style.icon} animate-pulse`} aria-hidden="true">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{insight.message}</p>
            {insight.action && (
              <Link
                href={insight.action.href}
                onClick={handleActionClick}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary group"
              >
                {insight.action.label}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            )}
          </div>
          {onDismiss && insight.dismissible && (
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 text-muted hover:text-foreground rounded-full hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Dismiss suggestion"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`
        rounded-lg border border-border bg-card p-3 sm:p-4
        transition-all duration-300
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        ${isExiting ? 'opacity-0 scale-95' : ''}
        ${isHovered ? 'border-primary/30' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 p-1.5 rounded-lg ${style.icon} transition-transform ${isHovered ? 'scale-110' : ''}`} aria-hidden="true">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">{insight.message}</p>
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
        {onDismiss && insight.dismissible && (
          <button
            onClick={handleDismissClick}
            className="flex-shrink-0 p-1 text-muted hover:text-foreground rounded-full hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Dismiss suggestion"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

// Multiple suggestions in a row
interface SmartSuggestionRowProps {
  insights: AIInsight[];
  onDismiss?: (insightId: string) => void;
  onActionClick?: (insight: AIInsight) => void;
}

export function SmartSuggestionRow({ insights, onDismiss, onActionClick }: SmartSuggestionRowProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
      {insights.slice(0, 2).map((insight) => (
        <div key={insight.id} className="flex-1">
          <SmartSuggestion
            insight={insight}
            onDismiss={onDismiss}
            onActionClick={onActionClick}
            variant="compact"
          />
        </div>
      ))}
    </div>
  );
}

// Quick action suggestion - minimal footprint
interface QuickActionProps {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function QuickAction({ label, icon: IconComponent, onClick, variant = 'secondary' }: QuickActionProps) {
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-surface border border-border text-foreground hover:bg-surface/80',
    ghost: 'text-muted hover:text-foreground hover:bg-surface',
  };

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
        transition-colors focus:outline-none focus:ring-2 focus:ring-primary
        ${variantStyles[variant]}
      `}
    >
      {IconComponent && <IconComponent className="h-3.5 w-3.5" aria-hidden="true" />}
      {label}
    </button>
  );
}

// Context-aware tip that appears next to relevant UI elements
interface ContextualTipProps {
  insight: AIInsight;
  onDismiss?: (insightId: string) => void;
  onActionClick?: (insight: AIInsight) => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function ContextualTip({
  insight,
  onDismiss,
  onActionClick,
  position = 'bottom',
}: ContextualTipProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick(insight);
    }
  };

  return (
    <div
      className={`
        absolute z-10 ${positionClasses[position]}
        w-64 max-w-[calc(100vw-2rem)]
        transition-all duration-300
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
      `}
      role="tooltip"
      aria-live="polite"
    >
      <div className="relative bg-card border border-border rounded-lg p-3 shadow-lg">
        {/* Arrow indicator - decorative */}
        <div
          className={`
            absolute w-2 h-2 bg-card border-border rotate-45
            ${position === 'bottom' ? 'top-0 -translate-y-1 border-l border-t left-4' : ''}
            ${position === 'top' ? 'bottom-0 translate-y-1 border-r border-b left-4' : ''}
          `}
          aria-hidden="true"
        />
        <div className="flex items-start gap-2">
          <Lightbulb className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-xs text-foreground">{insight.message}</p>
            {insight.action && (
              <Link
                href={insight.action.href}
                onClick={handleActionClick}
                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary group"
              >
                {insight.action.label}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={() => onDismiss(insight.id)}
              className="p-0.5 text-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded"
              aria-label="Dismiss tip"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Try alternative suggestion component
interface TryAlternativeProps {
  currentSuggestion: string;
  alternativeSuggestion: string;
  onAccept: () => void;
  onDismiss: () => void;
}

export function TryAlternative({
  currentSuggestion,
  alternativeSuggestion,
  onAccept,
  onDismiss,
}: TryAlternativeProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        rounded-lg border border-primary/20 bg-primary/5 p-3
        transition-all duration-300
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
      role="status"
      aria-live="polite"
    >
      <p className="text-xs text-muted mb-2">Instead of {currentSuggestion}, try:</p>
      <p className="text-sm font-medium text-foreground mb-3">{alternativeSuggestion}</p>
      <div className="flex gap-2">
        <button
          onClick={onAccept}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Check className="h-3 w-3" aria-hidden="true" />
          Try this
        </button>
        <button
          onClick={onDismiss}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted hover:text-foreground hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Keep original
        </button>
      </div>
    </div>
  );
}

export default SmartSuggestion;
