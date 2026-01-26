'use client';

import {
  Sparkles,
  X,
  ChevronUp,
  ChevronDown,
  MessageCircle,
  Send,
  HelpCircle,
  Target,
  TrendingUp,
  Calendar,
  ArrowRight,
  Loader2,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Zap,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Activity,
  Award,
  Clock,
  Heart,
} from 'lucide-react';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import { AmbientInsightStack } from './AmbientInsight';
import type { AIInsight, SmartQuestion, AIResponse, AmbientContext } from '../lib/ambient-ai';
import { generateSmartQuestions, getMockAIResponse } from '../lib/ambient-ai';

interface AIAssistantProps {
  insights: AIInsight[];
  onDismiss: (insightId: string) => void;
  userName?: string;
  minimized?: boolean;
  onMinimizedChange?: (minimized: boolean) => void;
  context?: AmbientContext;
  showChat?: boolean;
}

// AI Presence Indicator - Subtle pulsing dot
export function AIPresenceIndicator({
  isActive = true,
  size = 'md',
  className = '',
}: {
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  if (!isActive) return null;

  return (
    <span
      className={`relative inline-flex ${className}`}
      role="status"
      aria-label="AI assistant is active"
    >
      <span
        className={`absolute inline-flex ${sizeClasses[size]} rounded-full bg-primary/40 animate-ping`}
        style={{ animationDuration: '2s' }}
        aria-hidden="true"
      />
      <span
        className={`relative inline-flex ${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary to-cyan-500`}
        style={{
          boxShadow: '0 0 8px var(--primary), 0 0 16px var(--primary)',
        }}
        aria-hidden="true"
      />
    </span>
  );
}

// Smart Question Button
function SmartQuestionButton({
  question,
  onClick,
  icon: Icon,
}: {
  question: SmartQuestion;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    explanation: HelpCircle,
    guidance: Target,
    progress: TrendingUp,
    planning: Calendar,
  };

  const QuestionIcon = Icon || categoryIcons[question.category] || HelpCircle;

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-lg bg-surface/50 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card"
      aria-label={`Ask: ${question.question}`}
    >
      <div
        className="flex-shrink-0 p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors"
        aria-hidden="true"
      >
        <QuestionIcon className="h-3.5 w-3.5" />
      </div>
      <span className="text-sm text-foreground group-hover:text-primary transition-colors flex-1">
        {question.question}
      </span>
      <ArrowRight className="h-3.5 w-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
    </button>
  );
}

// Chat Message Component
function ChatMessage({
  isUser,
  message,
  actions,
  isLoading,
}: {
  isUser: boolean;
  message: string;
  actions?: { label: string; href: string }[];
  isLoading?: boolean;
}) {
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      role="listitem"
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary text-white rounded-br-md'
            : 'bg-surface border border-border rounded-bl-md'
        }`}
        aria-label={isUser ? 'Your message' : 'AI assistant response'}
      >
        {isLoading ? (
          <div className="flex items-center gap-2" role="status" aria-live="polite">
            <Loader2 className="h-4 w-4 animate-spin text-muted" aria-hidden="true" />
            <span className="text-sm text-muted">Thinking...</span>
          </div>
        ) : (
          <>
            <p className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-foreground'}`}>
              {message}
            </p>
            {actions && actions.length > 0 && (
              <nav className="mt-3 flex flex-wrap gap-2" aria-label="Suggested actions">
                {actions.map((action, i) => (
                  <a
                    key={i}
                    href={action.href}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline bg-primary/10 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {action.label}
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </a>
                ))}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// AI Chat Interface
interface ChatInterfaceProps {
  context: AmbientContext;
  onClose: () => void;
}

function ChatInterface({ context, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<
    { id: string; isUser: boolean; message: string; actions?: { label: string; href: string }[] }[]
  >([]);
  const [isTyping, setIsTyping] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const smartQuestions = useMemo(() => generateSmartQuestions(context), [context]);

  const handleQuestionClick = async (question: SmartQuestion) => {
    // Add user question
    const userMessageId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, isUser: true, message: question.question },
    ]);

    // Show typing indicator
    setIsTyping(true);
    setAnnouncement('AI is thinking...');

    // Simulate AI thinking delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

    // Get mock AI response
    const response = getMockAIResponse(question.id, context);

    setIsTyping(false);

    // Add AI response
    setMessages((prev) => [
      ...prev,
      {
        id: `ai-${Date.now()}`,
        isUser: false,
        message: response.response,
        actions: response.followUpActions,
      },
    ]);
    setAnnouncement(`AI responded: ${response.response.substring(0, 100)}...`);
  };

  return (
    <section className="flex flex-col h-full" aria-label="AI Chat Interface">
      {/* Screen reader announcement for dynamic updates */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {/* Chat Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <AIPresenceIndicator size="sm" />
          <h3 className="text-sm font-medium text-foreground" id="chat-title">Recovery Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>

      {/* Chat Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div
                className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 mb-3"
                aria-hidden="true"
              >
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-foreground font-medium">How can I help you today?</p>
              <p className="text-xs text-muted mt-1">
                Ask me about your recovery, progress, or what to focus on
              </p>
            </div>

            {/* Smart Questions */}
            <nav className="space-y-2" aria-label="Suggested questions">
              <p className="text-xs font-medium text-muted uppercase tracking-wide px-1" id="suggested-questions-label">
                Suggested Questions
              </p>
              <div role="list" aria-labelledby="suggested-questions-label">
                {smartQuestions.map((q) => (
                  <div key={q.id} role="listitem">
                    <SmartQuestionButton
                      question={q}
                      onClick={() => handleQuestionClick(q)}
                    />
                  </div>
                ))}
              </div>
            </nav>
          </div>
        ) : (
          <div role="list" aria-label="Conversation">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                isUser={msg.isUser}
                message={msg.message}
                actions={msg.actions}
              />
            ))}
            {isTyping && <ChatMessage isUser={false} message="" isLoading />}

            {/* Show remaining questions after conversation */}
            {!isTyping && messages.length > 0 && (
              <nav className="pt-4 space-y-2 border-t border-border/50" aria-label="Follow-up questions">
                <p className="text-xs text-muted" id="followup-label">Ask another question:</p>
                <div role="list" aria-labelledby="followup-label">
                  {smartQuestions
                    .filter(
                      (q) => !messages.some((m) => m.isUser && m.message === q.question)
                    )
                    .slice(0, 2)
                    .map((q) => (
                      <div key={q.id} role="listitem">
                        <SmartQuestionButton
                          question={q}
                          onClick={() => handleQuestionClick(q)}
                        />
                      </div>
                    ))}
                </div>
              </nav>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export function AIAssistant({
  insights,
  onDismiss,
  userName,
  minimized = false,
  onMinimizedChange,
  context,
  showChat = true,
}: AIAssistantProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [localMinimized, setLocalMinimized] = useState(minimized);
  const [hasNewInsights, setHasNewInsights] = useState(false);
  const [lastInsightCount, setLastInsightCount] = useState(0);
  const [showChatInterface, setShowChatInterface] = useState(false);

  const isMinimized = onMinimizedChange ? minimized : localMinimized;
  const setMinimized = onMinimizedChange || setLocalMinimized;

  // Fade in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Detect new insights
  useEffect(() => {
    if (insights.length > lastInsightCount) {
      setHasNewInsights(true);
    }
    setLastInsightCount(insights.length);
  }, [insights.length, lastInsightCount]);

  // Clear new insights indicator when expanded
  useEffect(() => {
    if (!isMinimized && hasNewInsights) {
      const timer = setTimeout(() => setHasNewInsights(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isMinimized, hasNewInsights]);

  const handleToggleMinimized = useCallback(() => {
    if (showChatInterface) {
      setShowChatInterface(false);
    } else {
      setMinimized(!isMinimized);
    }
  }, [isMinimized, setMinimized, showChatInterface]);

  const handleOpenChat = useCallback(() => {
    setShowChatInterface(true);
    setMinimized(false);
  }, [setMinimized]);

  // Don't render if no insights and no chat
  if (insights.length === 0 && !showChat) {
    return null;
  }

  const firstName = userName?.split(' ')[0];
  const highPriorityCount = insights.filter((i) => i.priority === 'high').length;

  // Default context for chat if not provided
  const chatContext = context || {
    timeOfDay: 'morning' as const,
    dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    isWeekend: [0, 6].includes(new Date().getDay()),
    recentActivity: [],
    painTrend: 'stable' as const,
    sessionStreak: 0,
    lastCheckIn: null,
    daysSinceLastSession: 0,
    averagePainLevel: 0,
    highestPainRegion: null,
    totalSessionsThisWeek: 0,
    completionRate: 0,
    preferredSessionTime: null,
    typicalSessionDuration: 15,
    consistencyScore: 0,
    weather: 'mild' as const,
    lastBodyMapUpdate: null,
    daysSinceBodyMapUpdate: 0,
    regionsNotUpdatedRecently: [],
    // Advanced pattern recognition
    morningSessionEffectiveness: 50,
    eveningSessionEffectiveness: 50,
    bestTimeForRecovery: 'unknown' as const,
    restDayImpact: 'neutral' as const,
    weeklyPainReduction: 0,
    mostImprovedRegion: null,
    persistentPainRegion: null,
    sessionIntensityTrend: 'stable' as const,
    recoveryVelocity: 'moderate' as const,
    // Predictive data
    predictedReadiness: 70,
    suggestedIntensity: 'moderate' as const,
    suggestedDuration: 15,
    optimalNextSessionTime: null,
    // Behavioral patterns
    skippedDaysPattern: [],
    peakMotivationDays: [],
    sessionCompletionByTimeOfDay: {},
  };

  return (
    <aside
      className={`
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      aria-label="AI Recovery Companion"
    >
      {/* Assistant Card */}
      <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
        {/* Header - Always visible */}
        <button
          onClick={handleToggleMinimized}
          className="w-full flex items-center justify-between p-4 hover:bg-surface/50 transition-colors touch-target focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          aria-expanded={!isMinimized}
          aria-controls="ai-assistant-content"
          aria-label={`AI Assistant: ${isMinimized ? 'expand to show insights' : 'collapse'}`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-primary"
                aria-hidden="true"
              >
                <Sparkles className="h-4 w-4" />
              </div>
              {/* AI Presence - Subtle glow */}
              <AIPresenceIndicator
                size="sm"
                className="absolute -bottom-0.5 -right-0.5"
              />
              {/* New insights indicator */}
              {hasNewInsights && isMinimized && (
                <span
                  className="absolute -top-1 -right-1 flex h-3 w-3"
                  role="status"
                  aria-label="New insights available"
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" aria-hidden="true" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" aria-hidden="true" />
                </span>
              )}
              {/* High priority indicator */}
              {highPriorityCount > 0 && !hasNewInsights && !showChatInterface && (
                <span
                  className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-warning text-xs font-bold text-white"
                  role="status"
                  aria-label={`${highPriorityCount} high priority insights`}
                >
                  <span aria-hidden="true">{highPriorityCount}</span>
                </span>
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">
                {firstName ? `Hey ${firstName}` : 'Recovery Companion'}
              </p>
              <p className="text-xs text-muted">
                {showChatInterface
                  ? 'Ask me anything'
                  : isMinimized
                  ? `${insights.length} insight${insights.length !== 1 ? 's' : ''} for you`
                  : 'Personalized guidance'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Chat toggle button */}
            {showChat && !showChatInterface && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenChat();
                }}
                className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Open AI chat"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <div className="text-muted" aria-hidden="true">
              {showChatInterface ? (
                <X className="h-5 w-5" />
              ) : isMinimized ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </div>
        </button>

        {/* Content Container - Collapsible */}
        <div
          id="ai-assistant-content"
          className={`
            transition-all duration-300 ease-out overflow-hidden
            ${isMinimized ? 'max-h-0' : showChatInterface ? 'max-h-[400px]' : 'max-h-[500px]'}
          `}
          aria-hidden={isMinimized}
        >
          {showChatInterface ? (
            <div className="h-[350px]">
              <ChatInterface
                context={chatContext}
                onClose={() => setShowChatInterface(false)}
              />
            </div>
          ) : (
            <div className="p-4 pt-0 space-y-3">
              <AmbientInsightStack
                insights={insights}
                onDismiss={onDismiss}
                maxVisible={2}
              />

              {/* Quick chat prompt */}
              {showChat && insights.length > 0 && (
                <button
                  onClick={handleOpenChat}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-muted hover:text-primary border-t border-border/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Open chat to ask the AI a question"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span>Ask a question</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// Floating variant for overlay positioning
interface FloatingAIAssistantProps extends AIAssistantProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function FloatingAIAssistant({
  position = 'bottom-right',
  ...props
}: FloatingAIAssistantProps) {
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 w-80 max-w-[calc(100vw-2rem)]`}
    >
      <AIAssistant {...props} />
    </div>
  );
}

// Compact inline variant for embedding in pages
interface InlineAIAssistantProps {
  insights: AIInsight[];
  onDismiss: (insightId: string) => void;
  title?: string;
  context?: AmbientContext;
  showChat?: boolean;
}

export function InlineAIAssistant({
  insights,
  onDismiss,
  title = 'For You',
  context,
  showChat = false,
}: InlineAIAssistantProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (insights.length === 0 && !showChat) {
    return null;
  }

  return (
    <div
      className={`
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="relative">
          <Sparkles className="h-4 w-4 text-primary" />
          <AIPresenceIndicator size="sm" className="absolute -bottom-0.5 -right-0.5" />
        </div>
        <h3 className="text-sm font-medium text-muted">{title}</h3>
      </div>
      <AmbientInsightStack
        insights={insights}
        onDismiss={onDismiss}
        maxVisible={2}
      />
    </div>
  );
}

// Minimal AI indicator for subtle presence
export function AIIndicator({
  isActive = true,
  label = 'AI Active',
  className = '',
}: {
  isActive?: boolean;
  label?: string;
  className?: string;
}) {
  if (!isActive) return null;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <AIPresenceIndicator size="sm" />
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

// Readiness Card - Shows user's current readiness score
interface ReadinessCardProps {
  readinessScore: number;
  suggestedIntensity: 'light' | 'moderate' | 'full';
  suggestedDuration: number;
  onStartSession?: () => void;
}

export function ReadinessCard({
  readinessScore,
  suggestedIntensity,
  suggestedDuration,
  onStartSession,
}: ReadinessCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const getBatteryIcon = () => {
    if (readinessScore >= 70) return BatteryFull;
    if (readinessScore >= 40) return BatteryMedium;
    return BatteryLow;
  };

  const getColorClass = () => {
    if (readinessScore >= 70) return 'text-emerald-500';
    if (readinessScore >= 40) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getBgClass = () => {
    if (readinessScore >= 70) return 'bg-emerald-500/10';
    if (readinessScore >= 40) return 'bg-amber-500/10';
    return 'bg-rose-500/10';
  };

  const getReadinessLabel = () => {
    if (readinessScore >= 80) return 'Optimal';
    if (readinessScore >= 60) return 'Good';
    if (readinessScore >= 40) return 'Fair';
    return 'Rest';
  };

  const getIntensityLabel = () => {
    switch (suggestedIntensity) {
      case 'light':
        return 'Light session';
      case 'moderate':
        return 'Moderate session';
      case 'full':
        return 'Full session';
    }
  };

  const BatteryIcon = getBatteryIcon();

  return (
    <div
      className={`
        rounded-xl border border-border bg-card p-4
        transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${getBgClass()}`}>
            <BatteryIcon className={`h-4 w-4 ${getColorClass()}`} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-muted">Today's Readiness</p>
            <p className={`text-sm font-semibold ${getColorClass()}`}>{getReadinessLabel()}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${getColorClass()}`}>{readinessScore}</p>
          <p className="text-xs text-muted">/100</p>
        </div>
      </div>

      {/* Readiness bar */}
      <div className="h-2 bg-surface rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            readinessScore >= 70
              ? 'bg-gradient-to-r from-emerald-500 to-green-400'
              : readinessScore >= 40
              ? 'bg-gradient-to-r from-amber-500 to-orange-400'
              : 'bg-gradient-to-r from-rose-500 to-red-400'
          }`}
          style={{ width: `${readinessScore}%` }}
        />
      </div>

      {/* Suggestion */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            {getIntensityLabel()} ({suggestedDuration} min)
          </span>
        </div>
        {onStartSession && readinessScore >= 30 && (
          <button
            onClick={onStartSession}
            className="text-xs font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
          >
            Start
          </button>
        )}
      </div>
    </div>
  );
}

// Pattern Insights List - Shows discovered patterns
interface PatternInsightsListProps {
  patterns: string[];
  title?: string;
}

export function PatternInsightsList({ patterns, title = 'Your Patterns' }: PatternInsightsListProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (patterns.length === 0) return null;

  return (
    <div
      className={`
        transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        <h4 className="text-xs font-medium text-muted uppercase tracking-wide">{title}</h4>
      </div>
      <ul className="space-y-1.5">
        {patterns.map((pattern, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-sm text-foreground"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className="text-primary mt-1" aria-hidden="true">
              {'\u2022'}
            </span>
            <span>{pattern}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Time of Day Greeting with context
interface TimeAwareGreetingProps {
  userName?: string;
  context?: AmbientContext;
}

export function TimeAwareGreeting({ userName, context }: TimeAwareGreetingProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const hour = new Date().getHours();
  const firstName = userName?.split(' ')[0];

  const getTimeIcon = () => {
    if (hour >= 5 && hour < 12) return Sunrise;
    if (hour >= 12 && hour < 17) return Sun;
    if (hour >= 17 && hour < 21) return Sunset;
    return Moon;
  };

  const getGreeting = () => {
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Welcome back';
  };

  const getSubtext = () => {
    if (context?.sessionStreak && context.sessionStreak >= 7) {
      return `${context.sessionStreak} days strong!`;
    }
    if (context?.sessionStreak && context.sessionStreak >= 3) {
      return `${context.sessionStreak}-day streak going`;
    }
    if (context?.painTrend === 'improving') {
      return 'Your recovery is progressing';
    }
    if (context?.predictedReadiness && context.predictedReadiness >= 70) {
      return 'Ready for a great session';
    }
    return "Let's focus on recovery";
  };

  const TimeIcon = getTimeIcon();

  return (
    <div
      className={`
        flex items-center gap-3
        transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/10">
        <TimeIcon className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          {getGreeting()}
          {firstName && <span>, {firstName}</span>}
        </h2>
        <p className="text-sm text-muted">{getSubtext()}</p>
      </div>
    </div>
  );
}

// Encouragement Banner - Contextual encouragement
interface EncouragementBannerProps {
  context: AmbientContext;
  variant?: 'default' | 'celebration' | 'motivation';
}

export function EncouragementBanner({ context, variant = 'default' }: EncouragementBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Determine what encouragement to show
  const getEncouragement = () => {
    // Celebration for streaks
    if (context.sessionStreak >= 7) {
      return {
        icon: Award,
        title: `${context.sessionStreak} Day Streak!`,
        message: 'Your consistency is building lasting change.',
        type: 'celebration' as const,
      };
    }

    // Celebration for improvement
    if (context.painTrend === 'improving' && context.weeklyPainReduction && context.weeklyPainReduction >= 0.5) {
      return {
        icon: TrendingUp,
        title: 'Progress!',
        message: `Pain down ${context.weeklyPainReduction.toFixed(1)} points this week.`,
        type: 'celebration' as const,
      };
    }

    // Motivation for returning users
    if (context.daysSinceLastSession >= 3 && context.daysSinceLastSession <= 7) {
      return {
        icon: Heart,
        title: 'Welcome Back',
        message: "Small steps forward still count. Let's get moving.",
        type: 'motivation' as const,
      };
    }

    // High readiness
    if (context.predictedReadiness >= 80) {
      return {
        icon: Zap,
        title: 'High Readiness',
        message: 'Great day for a productive session!',
        type: 'default' as const,
      };
    }

    // Consistency acknowledgment
    if (context.consistencyScore >= 70) {
      return {
        icon: Target,
        title: 'Consistent Effort',
        message: `${context.consistencyScore}% consistency. That's how results happen.`,
        type: 'default' as const,
      };
    }

    return null;
  };

  const encouragement = getEncouragement();

  if (!encouragement) return null;

  const Icon = encouragement.icon;
  const typeStyles = {
    celebration: 'from-amber-500/10 to-rose-500/10 border-amber-500/30',
    motivation: 'from-primary/10 to-cyan-500/10 border-primary/30',
    default: 'from-primary/5 to-transparent border-primary/20',
  };

  return (
    <div
      className={`
        rounded-xl border p-4
        bg-gradient-to-r ${typeStyles[encouragement.type]}
        transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg ${
            encouragement.type === 'celebration'
              ? 'bg-amber-500/20 text-amber-500'
              : 'bg-primary/20 text-primary'
          }`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium text-foreground">{encouragement.title}</p>
          <p className="text-sm text-muted">{encouragement.message}</p>
        </div>
      </div>
    </div>
  );
}

// Daily Summary Card
interface DailySummaryCardProps {
  context: AmbientContext;
  onViewProgress?: () => void;
}

export function DailySummaryCard({ context, onViewProgress }: DailySummaryCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 250);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        rounded-xl border border-border bg-card p-4
        transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-foreground">Today's Summary</h4>
        {onViewProgress && (
          <button
            onClick={onViewProgress}
            className="text-xs text-primary hover:underline"
          >
            View all
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-2xl font-bold text-foreground">
            {context.predictedReadiness || 0}
          </p>
          <p className="text-xs text-muted">Readiness</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">
            {context.sessionStreak || 0}
          </p>
          <p className="text-xs text-muted">Streak</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">
            {context.totalSessionsThisWeek || 0}
          </p>
          <p className="text-xs text-muted">This week</p>
        </div>
      </div>

      {/* Trend indicator */}
      <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
        <div
          className={`p-1 rounded ${
            context.painTrend === 'improving'
              ? 'bg-emerald-500/10 text-emerald-500'
              : context.painTrend === 'worsening'
              ? 'bg-rose-500/10 text-rose-500'
              : 'bg-surface text-muted'
          }`}
        >
          {context.painTrend === 'improving' ? (
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
          ) : context.painTrend === 'worsening' ? (
            <Activity className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Activity className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </div>
        <span className="text-xs text-muted">
          Pain trend:{' '}
          <span
            className={
              context.painTrend === 'improving'
                ? 'text-emerald-500'
                : context.painTrend === 'worsening'
                ? 'text-rose-500'
                : 'text-foreground'
            }
          >
            {context.painTrend}
          </span>
        </span>
      </div>
    </div>
  );
}

// Quick Tip Component
interface QuickTipProps {
  tip: string;
  category?: string;
  onDismiss?: () => void;
}

export function QuickTip({ tip, category, onDismiss }: QuickTipProps) {
  return (
    <div className="flex items-start gap-2 py-2 px-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
      <Zap className="h-4 w-4 text-cyan-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1">
        {category && (
          <p className="text-xs font-medium text-cyan-500 mb-0.5">{category}</p>
        )}
        <p className="text-sm text-foreground">{tip}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-0.5 text-muted hover:text-foreground"
          aria-label="Dismiss tip"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default AIAssistant;
