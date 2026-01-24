/**
 * Chat Page - Ambient AI Presence
 *
 * Not a chatbot. A presence woven throughout the experience.
 * The whole screen softens when conversation happens.
 * Responses are short, actionable, honest, warm.
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Text } from '@/components/ui'
import { cn } from '@/lib/cn'

interface Exchange {
  id: string
  thought: string
  response: string
  timestamp: Date
}

// Gentle invitations, not commands
const invitations = [
  'Something feels off today',
  'I pushed through pain',
  'Feeling stuck',
  'Not sure what to do',
  'Need to talk it through',
]

export function ChatPage() {
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [currentThought, setCurrentThought] = useState('')
  const [isPresent, setIsPresent] = useState(false)
  const [isResponding, setIsResponding] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }, [currentThought])

  const handleShare = async (thought: string) => {
    if (!thought.trim() || isResponding) return

    const trimmedThought = thought.trim()
    setCurrentThought('')
    setIsResponding(true)
    setIsPresent(true)

    // Simulate presence (will be replaced with API)
    await new Promise((resolve) => setTimeout(resolve, 1200))

    const response = getTendResponse(trimmedThought)
    const exchange: Exchange = {
      id: Date.now().toString(),
      thought: trimmedThought,
      response,
      timestamp: new Date(),
    }

    setExchanges((prev) => [...prev, exchange])
    setIsResponding(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleShare(currentThought)
    }
  }

  const hasHistory = exchanges.length > 0

  return (
    <div className="min-h-full bg-void relative overflow-hidden">
      {/* Ambient background that responds to presence */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-[1500ms] ease-out',
          isPresent
            ? 'bg-gradient-radial from-accent/[0.03] via-transparent to-transparent'
            : 'bg-transparent'
        )}
      />

      {/* Soft vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-void/50 pointer-events-none" />

      {/* Content */}
      <div className="relative min-h-full flex flex-col">
        {/* Breathing room at top */}
        <div className="flex-shrink-0 h-16" />

        {/* Main conversation space - centered */}
        <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-lg mx-auto w-full">
          <AnimatePresence mode="wait">
            {!hasHistory && !isResponding ? (
              // Initial state - ambient awareness
              <motion.div
                key="initial"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-8"
              >
                {/* The presence speaks softly */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <Text
                    variant="title2"
                    color="secondary"
                    className="font-normal leading-relaxed"
                  >
                    Here if you need.
                  </Text>
                </motion.div>

                {/* Gentle invitations */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="flex flex-wrap justify-center gap-2"
                >
                  {invitations.map((invitation, index) => (
                    <motion.button
                      key={invitation}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                      onClick={() => handleShare(invitation)}
                      className={cn(
                        'px-4 py-2.5 rounded-full',
                        'bg-surface/50 hover:bg-surface',
                        'border border-border/50 hover:border-border',
                        'text-text-secondary hover:text-text-primary',
                        'text-footnote',
                        'transition-all duration-normal',
                        'cursor-pointer'
                      )}
                    >
                      {invitation}
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              // Conversation flow - centered exchanges
              <motion.div
                key="conversation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-12"
              >
                {/* Past exchanges */}
                {exchanges.map((exchange, index) => (
                  <motion.div
                    key={exchange.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className={cn(
                      'space-y-6',
                      index < exchanges.length - 1 && 'opacity-50'
                    )}
                  >
                    {/* User's thought - smaller, secondary */}
                    <div className="text-center">
                      <Text
                        variant="footnote"
                        color="tertiary"
                        className="italic"
                      >
                        {exchange.thought}
                      </Text>
                    </div>

                    {/* Response - centered, warm */}
                    <div className="text-center">
                      <Text
                        variant="title3"
                        color="primary"
                        className="font-normal leading-relaxed"
                      >
                        {exchange.response}
                      </Text>
                    </div>
                  </motion.div>
                ))}

                {/* Responding state */}
                {isResponding && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="text-center space-y-6"
                  >
                    <Text
                      variant="footnote"
                      color="tertiary"
                      className="italic"
                    >
                      {currentThought || exchanges[exchanges.length - 1]?.thought || '...'}
                    </Text>
                    <PresenceIndicator />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input area - soft, unobtrusive */}
        <div className="flex-shrink-0 px-6 pb-8 pt-4">
          <div className="max-w-lg mx-auto">
            {/* Contextual invitations after conversation */}
            {hasHistory && !isResponding && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="flex flex-wrap justify-center gap-2 mb-4"
              >
                {getFollowUpInvitations(exchanges[exchanges.length - 1]?.response || '').map(
                  (invitation) => (
                    <button
                      key={invitation}
                      onClick={() => handleShare(invitation)}
                      className={cn(
                        'px-3 py-2 rounded-full',
                        'bg-transparent hover:bg-surface/50',
                        'border border-transparent hover:border-border/30',
                        'text-text-tertiary hover:text-text-secondary',
                        'text-caption1',
                        'transition-all duration-normal'
                      )}
                    >
                      {invitation}
                    </button>
                  )
                )}
              </motion.div>
            )}

            {/* Thought input */}
            <div
              className={cn(
                'relative rounded-2xl',
                'bg-surface/30 backdrop-blur-sm',
                'border border-border/30',
                'transition-all duration-normal',
                'focus-within:bg-surface/50 focus-within:border-border/50'
              )}
            >
              <textarea
                ref={inputRef}
                value={currentThought}
                onChange={(e) => setCurrentThought(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What's on your mind..."
                disabled={isResponding}
                rows={1}
                className={cn(
                  'w-full px-5 py-4',
                  'bg-transparent',
                  'text-body text-text-primary placeholder:text-text-tertiary/50',
                  'focus:outline-none',
                  'resize-none',
                  'max-h-32'
                )}
              />

              {/* Subtle send affordance */}
              <AnimatePresence>
                {currentThought.trim() && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => handleShare(currentThought)}
                    className={cn(
                      'absolute right-3 bottom-3',
                      'w-8 h-8 rounded-full',
                      'bg-accent/20 hover:bg-accent/30',
                      'flex items-center justify-center',
                      'text-accent',
                      'transition-colors duration-fast'
                    )}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Presence indicator - subtle, breathing animation
 * Not aggressive bouncing dots, but gentle awareness
 */
function PresenceIndicator() {
  return (
    <motion.div
      className="flex justify-center items-center gap-1.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-text-tertiary/50"
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  )
}

/**
 * Response generator following Tend voice principles:
 * - Validate before solving
 * - Admit uncertainty
 * - 1-2 sentences max
 * - Never use "I understand" (robotic)
 * - Warm, honest, actionable
 */
function getTendResponse(thought: string): string {
  const lower = thought.toLowerCase()

  // Pain/hurt responses - validate first
  if (lower.includes('pain') || lower.includes('hurt') || lower.includes('pushed through')) {
    const responses = [
      "That takes courage to admit. Where is it? Let's make sure tomorrow is gentler.",
      "Bodies remember what we put them through. Worth noting where, so we can adapt.",
      "Pain is information, not failure. Can you show me where?",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Feeling off - validate the feeling
  if (lower.includes('off') || lower.includes('not right') || lower.includes('weird')) {
    const responses = [
      "That's real. Some days are like that. Want to talk about what feels off?",
      "Trusting that instinct matters. What's your body telling you?",
      "I might be wrong, but maybe today isn't a pushing day. What do you think?",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Stuck/uncertain - meet them where they are
  if (lower.includes('stuck') || lower.includes('not sure') || lower.includes('uncertain')) {
    const responses = [
      "Stuck is okay. Sometimes the path forward isn't clear yet.",
      "That's honest. What would feel right, even if it's small?",
      "I don't always know either. What does your gut say?",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Need to talk - create space
  if (lower.includes('talk') || lower.includes('vent') || lower.includes('need to')) {
    const responses = [
      "I'm here. Take your time.",
      "No rush. What's weighing on you?",
      "Space for whatever you need to say.",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Workout/training questions - practical but warm
  if (lower.includes('workout') || lower.includes('train') || lower.includes('exercise')) {
    const responses = [
      "What kind of movement sounds good? Not what you should do, what you want.",
      "I could suggest something, but what does your body actually feel like doing?",
      "Before we plan anything: how are you actually feeling today?",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Tired/exhausted - validate rest
  if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('drained')) {
    const responses = [
      "Then rest. That's not giving up, that's listening.",
      "Exhaustion is real. What would help right now?",
      "Your body is asking for something. Maybe it's permission to stop.",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Default - warm, open
  const defaults = [
    "Tell me more about that.",
    "I'm listening. What else?",
    "That's worth exploring. Go on.",
  ]
  return defaults[Math.floor(Math.random() * defaults.length)]
}

/**
 * Contextual follow-up invitations based on previous response
 */
function getFollowUpInvitations(lastResponse: string): string[] {
  const lower = lastResponse.toLowerCase()

  if (lower.includes('where') || lower.includes('show me')) {
    return ["It's my shoulder", 'Lower back', 'Hard to pinpoint']
  }

  if (lower.includes('rest') || lower.includes('stop')) {
    return ["That's hard for me", "You're right", 'What about tomorrow?']
  }

  if (lower.includes('feel like doing') || lower.includes('want')) {
    return ['Something light', 'Not sure honestly', 'I should push']
  }

  if (lower.includes('tell me more') || lower.includes('go on')) {
    return ["It's complicated", "I'm not sure where to start", "Actually, I'm okay"]
  }

  // Default follow-ups
  return ['That helps', "There's more", 'What do you think?']
}
