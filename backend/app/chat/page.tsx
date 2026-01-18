'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey! I'm your movement coach. How can I help you today? You can ask me about exercises, modifications, or anything fitness-related.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo', // Would be real auth token
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            currentWorkout: 'Upper Body',
            readinessScore: 78,
            activeInjuries: ['Right shoulder - moderate'],
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };

      setMessages(prev => [...prev, assistantMessage]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        // Parse SSE data
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const text = JSON.parse(line.slice(2));
              assistantContent += text;
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMessage.id
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            } catch {
              // Skip non-JSON lines
            }
          }
        }
      }
    } catch (error) {
      // Fallback response for demo
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getOfflineResponse(input),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header className="screen-header">
        <h1 className="screen-title">Coach</h1>
        <p className="screen-subtitle">AI-powered movement guidance</p>
      </header>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 1rem',
        paddingBottom: '100px',
      }}>
        {messages.map(message => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '0.75rem 1rem',
                borderRadius: message.role === 'user'
                  ? '16px 16px 4px 16px'
                  : '16px 16px 16px 4px',
                background: message.role === 'user'
                  ? 'var(--brand-primary)'
                  : 'var(--bg-tertiary)',
                color: message.role === 'user'
                  ? 'white'
                  : 'var(--text-primary)',
              }}
            >
              {message.content || (
                <span className="skeleton" style={{ display: 'inline-block', width: 60, height: 16 }} />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      <div style={{
        padding: '0.5rem 1rem',
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        background: 'var(--bg-primary)',
      }}>
        {['My shoulder hurts', 'Modify this exercise', 'Is this weight ok?'].map(suggestion => (
          <button
            key={suggestion}
            className="btn btn-secondary"
            style={{
              fontSize: '0.75rem',
              padding: '0.5rem 0.75rem',
              whiteSpace: 'nowrap',
            }}
            onClick={() => setInput(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '1rem',
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-light)',
        position: 'sticky',
        bottom: 80,
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask your coach..."
            disabled={isLoading}
          />
          <button
            className="btn btn-primary"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            style={{ padding: '0.75rem 1rem' }}
          >
            {isLoading ? '...' : '→'}
          </button>
        </div>
      </div>
    </div>
  );
}

function getOfflineResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes('shoulder') || lower.includes('hurt') || lower.includes('pain')) {
    return "I hear you - shoulder discomfort needs attention. For now, avoid overhead movements and try cable flies instead of presses. Want me to modify today's workout?";
  }

  if (lower.includes('modify') || lower.includes('alternative')) {
    return "Sure! For a shoulder-friendly alternative, try:\n• Floor press instead of bench\n• Landmine press instead of overhead\n• Face pulls for rear delts\n\nWant me to swap these into your workout?";
  }

  if (lower.includes('weight') || lower.includes('heavy') || lower.includes('light')) {
    return "Based on your readiness score of 78, you're good for full intensity today. If something feels off mid-set though, drop 10% and see how it feels. You can always add back.";
  }

  if (lower.includes('rest') || lower.includes('tired')) {
    return "Listen to your body. If you're feeling worn down, consider:\n• Lighter weights, same reps\n• More rest between sets\n• Swapping to mobility work\n\nWhat feels right for you today?";
  }

  return "Got it. Is there a specific exercise or body part you'd like guidance on? I'm here to help you train smart.";
}
