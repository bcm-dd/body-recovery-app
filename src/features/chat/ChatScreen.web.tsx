/**
 * Chat Screen (Web) - Movement & Recovery Companion
 *
 * Web-specific version without react-native-reanimated animations.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  ActivityIndicator,
  FlatList,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { Text, Card } from '@/components/ui';
import { useWorkoutStore, useBodyModelStore, useReadinessStore } from '@/store';

// ============================================================================
// Types
// ============================================================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: ChatContext;
}

interface ChatContext {
  currentWorkout?: string;
  currentExercise?: string;
  readinessScore?: number;
  activeInjuries?: string[];
}

// ============================================================================
// Message Components
// ============================================================================

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const isUser = message.role === 'user';

  return (
    <View
      style={[
        styles.messageBubble,
        {
          backgroundColor: isUser ? colors.accent : colors.card,
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          maxWidth: '85%',
          // @ts-ignore - web style
          animation: 'fadeIn 0.2s ease',
        },
      ]}
    >
      <Text
        variant="body"
        style={{ color: isUser ? colors.accentText : colors.textPrimary }}
      >
        {message.content}
        {isStreaming && (
          <Text
            variant="body"
            style={{ color: isUser ? colors.accentText : colors.textSecondary }}
          >
            {' '}|
          </Text>
        )}
      </Text>
      <Text
        variant="caption"
        style={{
          color: isUser ? `${colors.accentText}99` : colors.textTertiary,
          marginTop: 4,
          alignSelf: 'flex-end',
        }}
      >
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

// ============================================================================
// Quick Suggestions
// ============================================================================

interface SuggestionChipProps {
  text: string;
  onPress: () => void;
}

function SuggestionChip({ text, onPress }: SuggestionChipProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.suggestionChip,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          // @ts-ignore - web style
          cursor: 'pointer',
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={text}
    >
      <Text variant="bodySmall" color="secondary">
        {text}
      </Text>
    </Pressable>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ChatScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  const flatListRef = useRef<FlatList<Message>>(null);
  const inputRef = useRef<TextInput>(null);

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [_streamingMessage, setStreamingMessage] = useState<string>('');

  // Store state for context
  const activeWorkout = useWorkoutStore((state) => state.activeWorkout);
  const getCurrentExercise = useWorkoutStore((state) => state.getCurrentExercise);
  const activeInjuries = useBodyModelStore((state) => state.getActiveInjuries());
  const readiness = useReadinessStore((state) => state.currentReadiness);

  const currentExercise = getCurrentExercise();

  // Build context for AI
  const buildContext = useCallback((): ChatContext => {
    return {
      currentWorkout: activeWorkout ? 'Active workout in progress' : undefined,
      currentExercise: currentExercise?.exerciseId,
      readinessScore: readiness?.score,
      activeInjuries: activeInjuries.map((i) => `${i.bodyRegion}: ${i.description}`),
    };
  }, [activeWorkout, currentExercise, readiness, activeInjuries]);

  // Send message to AI
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
      context: buildContext(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setStreamingMessage('');

    try {
      // Simulate streaming response (in production, use actual API)
      const response = await simulateAIResponse(text, buildContext());

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_response`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'Sorry, I encountered an issue. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingMessage('');
    }
  }, [buildContext]);

  // Quick suggestions based on context
  const getSuggestions = useCallback((): string[] => {
    const suggestions: string[] = [];

    if (activeWorkout && currentExercise) {
      suggestions.push('This hurts, what should I do?');
      suggestions.push('Give me an alternative exercise');
      suggestions.push('Is my form correct?');
    } else if (activeWorkout) {
      suggestions.push('Should I continue or stop?');
      suggestions.push('How am I doing so far?');
    } else {
      suggestions.push('How should I train today?');
      if (activeInjuries.length > 0) {
        suggestions.push('Update on my recovery');
      }
      suggestions.push('I have a new pain');
    }

    return suggestions.slice(0, 3);
  }, [activeWorkout, currentExercise, activeInjuries]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSuggestionPress = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isLastMessage = index === messages.length - 1;
    const isStreaming = isLastMessage && isLoading && item.role === 'assistant';

    return (
      <MessageBubble
        message={item}
        isStreaming={isStreaming}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="h3" align="center">
        Hi there!
      </Text>
      <Text
        variant="body"
        color="secondary"
        align="center"
        style={{ marginTop: spacing[2], maxWidth: 280 }}
      >
        I'm your movement coach. Ask me anything about your training, injuries, or recovery.
      </Text>

      {activeInjuries.length > 0 && (
        <Card variant="outlined" style={styles.contextCard}>
          <Text variant="caption" color="warning">
            {activeInjuries.length} active injury concern{activeInjuries.length > 1 ? 's' : ''}
          </Text>
          <Text variant="caption" color="secondary">
            I'll adapt my advice accordingly
          </Text>
        </Card>
      )}

      {readiness && (
        <Card variant="outlined" style={styles.contextCard}>
          <Text variant="caption" color="accent">
            Readiness: {readiness.score}/100
          </Text>
          <Text variant="caption" color="secondary">
            {readiness.recommendation} session recommended
          </Text>
        </Card>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleClose}
          hitSlop={16}
          accessibilityRole="button"
          accessibilityLabel="Close chat"
          // @ts-ignore - web style
          style={{ cursor: 'pointer' }}
        >
          <Text variant="body" color="accent">
            Close
          </Text>
        </Pressable>

        <Text variant="h4">Coach</Text>

        <View style={{ width: 50 }} />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 && styles.messagesListEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />

        {/* Streaming indicator */}
        {isLoading && (
          <View
            style={[styles.streamingIndicator, { backgroundColor: colors.card }]}
          >
            <ActivityIndicator size="small" color={colors.accent} />
            <Text variant="bodySmall" color="secondary" style={{ marginLeft: spacing[2] }}>
              Thinking...
            </Text>
          </View>
        )}

        {/* Quick Suggestions */}
        {messages.length === 0 && !isLoading && (
          <View style={styles.suggestions}>
            {getSuggestions().map((suggestion, index) => (
              <SuggestionChip
                key={index}
                text={suggestion}
                onPress={() => handleSuggestionPress(suggestion)}
              />
            ))}
          </View>
        )}

        {/* Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            ref={inputRef}
            style={[
              styles.textInput,
              {
                backgroundColor: colors.background,
                color: colors.textPrimary,
                borderColor: colors.border,
                // @ts-ignore - web style
                outlineStyle: 'none',
              },
            ]}
            placeholder="Ask me anything..."
            placeholderTextColor={colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
            accessibilityLabel="Message input"
            accessibilityHint="Type your message to the coach"
          />
          <Pressable
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() && !isLoading ? colors.accent : colors.disabledBackground,
                cursor: inputText.trim() && !isLoading ? 'pointer' : 'not-allowed',
              } as ViewStyle,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: !inputText.trim() || isLoading }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.accentText} />
            ) : (
              <Text
                variant="body"
                weight="semibold"
                style={{ color: colors.accentText }}
              >
                Send
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================================================
// Simulated AI Response (replace with actual API in production)
// ============================================================================

async function simulateAIResponse(message: string, context: ChatContext): Promise<string> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 500));

  const lowerMessage = message.toLowerCase();

  // Context-aware responses
  if (lowerMessage.includes('hurt') || lowerMessage.includes('pain')) {
    if (context.currentExercise) {
      return `I noticed you're working on ${context.currentExercise.replace(/_/g, ' ')}. If you're experiencing pain, let's pause and assess. Can you describe where exactly it hurts and what type of pain it is? Sharp, dull, or more of a tightness?`;
    }
    return "I hear you. Pain during exercise is important to address. Can you tell me where it hurts and describe what type of pain you're feeling?";
  }

  if (lowerMessage.includes('alternative') || lowerMessage.includes('swap')) {
    if (context.currentExercise) {
      const alternatives: Record<string, string> = {
        bench_press: 'You could try push-ups, dumbbell press, or cable flyes as alternatives. These reduce shoulder stress while still targeting your chest.',
        squat: 'Consider leg press, goblet squats, or split squats. These give your lower back a break while still working your quads and glutes.',
        deadlift: 'Romanian deadlifts, hip thrusts, or cable pull-throughs are good alternatives that reduce spinal loading.',
      };
      return alternatives[context.currentExercise] || 'What exercise would you like an alternative for? I can suggest options that work similar muscle groups.';
    }
  }

  if (lowerMessage.includes('form') || lowerMessage.includes('technique')) {
    return "Good question! Proper form is crucial for both safety and results. What exercise would you like tips on? I can walk you through the key cues.";
  }

  if (lowerMessage.includes('how should i train') || lowerMessage.includes('workout')) {
    if (context.readinessScore !== undefined) {
      if (context.readinessScore >= 75) {
        return `Your readiness score is ${context.readinessScore}, which is great! You're good to go for a full session. Focus on progressive overload today.`;
      } else if (context.readinessScore >= 50) {
        return `Your readiness is at ${context.readinessScore}. I'd suggest a moderate session today. Listen to your body and don't push too hard on the heavy lifts.`;
      } else {
        return `Your readiness score is ${context.readinessScore}, which is on the lower side. Consider a lighter session focusing on mobility and recovery, or take a rest day if you need it.`;
      }
    }
  }

  if (lowerMessage.includes('recovery') && context.activeInjuries && context.activeInjuries.length > 0) {
    return `You have ${context.activeInjuries.length} area${context.activeInjuries.length > 1 ? 's' : ''} we're monitoring. Remember, recovery isn't linear. Some days will feel better than others. The key is staying consistent with your mobility work without pushing into pain.`;
  }

  // Default response
  return "I'm here to help with your training. Feel free to ask about exercises, pain you're experiencing, workout modifications, or recovery advice.";
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  messagesListEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contextCard: {
    marginTop: 16,
    width: '100%',
    maxWidth: 280,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 16,
    marginRight: 12,
  },
  sendButton: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
