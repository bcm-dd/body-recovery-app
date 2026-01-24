import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Text, Button } from '@/components/ui'
import { cn } from '@/lib/cn'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content:
      "Hey! I'm your movement coach. I know your body, your history, and what you're working on. How can I help today?",
  },
]

const suggestions = [
  'How should I modify today?',
  'Something hurts',
  'Generate a workout',
]

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response (will be replaced with actual API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(content),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 bg-base border-b border-border">
        <Text variant="title2">Coach</Text>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3',
                  message.role === 'user'
                    ? 'bg-accent text-white rounded-br-sm'
                    : 'bg-surface text-text-primary rounded-bl-sm'
                )}
              >
                <Text variant="body" as="span">
                  {message.content}
                </Text>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-surface rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto hide-scrollbar">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant="secondary"
              size="sm"
              onClick={() => handleSend(suggestion)}
              className="whitespace-nowrap"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-4 bg-base border-t border-border safe-bottom">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Ask anything..."
            className={cn(
              'flex-1 h-11 px-4 rounded-xl',
              'bg-surface border border-border',
              'text-body text-text-primary placeholder:text-text-tertiary',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
              'transition-colors duration-fast'
            )}
          />
          <Button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="h-11 w-11 p-0"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  )
}

function getAIResponse(input: string): string {
  const lower = input.toLowerCase()

  if (lower.includes('hurt') || lower.includes('pain')) {
    return "I hear you. Where exactly are you feeling discomfort? I'll adjust your training to work around it while we figure out what's going on."
  }

  if (lower.includes('modify') || lower.includes('today')) {
    return "Based on your readiness score of 72, I'd suggest keeping the intensity moderate today. Want me to swap any exercises that might be too demanding?"
  }

  if (lower.includes('generate') || lower.includes('workout')) {
    return "I can put together a workout for you. What are you in the mood for - upper body, lower body, or full body? I'll factor in your recovery state and any constraints."
  }

  return "I'm here to help you train smarter. Feel free to ask about your workout, report any discomfort, or just check in on how your body's doing."
}
