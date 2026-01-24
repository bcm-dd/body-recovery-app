/**
 * WelcomeBack - Movement & Recovery Companion
 *
 * A compassionate re-engagement screen for users returning after a gap.
 * Designed to be warm and non-judgmental, avoiding any guilt-inducing
 * messaging about streaks, missed days, or specific time away.
 */

import { motion } from 'framer-motion'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

// ============================================================================
// Types
// ============================================================================

type GapDuration = 'short' | 'long'

export interface WelcomeBackProps {
  /**
   * Days since last activity.
   * 3-29 days = short gap, 30+ days = long gap
   */
  daysSinceLastActivity: number
  /**
   * Called when user is ready to start moving
   */
  onReadyToMove: () => void
  /**
   * Called when user wants to delay or needs more time
   * For short gaps: "Not yet"
   * For long gaps: "Check in first"
   */
  onNotReady: () => void
  /**
   * Optional className for the container
   */
  className?: string
}

// ============================================================================
// Content Configuration
// ============================================================================

interface WelcomeContent {
  headline: string
  lines: string[]
  primaryButton: string
  secondaryButton: string
}

const content: Record<GapDuration, WelcomeContent> = {
  short: {
    headline: 'Welcome back.',
    lines: [
      "You don't owe me an explanation.",
      'Life happens. Bodies need rest. Sometimes both.',
      "I've kept everything. Ready when you are.",
    ],
    primaryButton: "Let's move",
    secondaryButton: 'Not yet',
  },
  long: {
    headline: "It's been a while.",
    lines: [
      "Whatever kept you away - that's your business.",
      "I'm glad you're here now.",
      '',
      'Some things might have changed.',
      'Want to catch me up on your body, or just start moving?',
    ],
    primaryButton: 'Just move',
    secondaryButton: 'Check in first',
  },
}

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

const buttonContainerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.8,
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

// ============================================================================
// Component
// ============================================================================

export function WelcomeBack({
  daysSinceLastActivity,
  onReadyToMove,
  onNotReady,
  className,
}: WelcomeBackProps) {
  // Determine which content to show based on gap duration
  const gapDuration: GapDuration = daysSinceLastActivity >= 30 ? 'long' : 'short'
  const { headline, lines, primaryButton, secondaryButton } = content[gapDuration]

  return (
    <div
      className={cn(
        'fixed inset-0 z-50',
        'flex flex-col items-center justify-center',
        'bg-void',
        className
      )}
    >
      {/* Soft atmospheric background gradient */}
      <div
        className={cn(
          'absolute inset-0',
          'bg-gradient-radial from-accent/5 via-transparent to-transparent',
          'pointer-events-none'
        )}
        aria-hidden="true"
      />

      {/* Subtle ambient glow */}
      <div
        className={cn(
          'absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-[600px] h-[600px]',
          'bg-gradient-radial from-accent/8 via-accent/2 to-transparent',
          'blur-3xl',
          'pointer-events-none'
        )}
        aria-hidden="true"
      />

      {/* Content container */}
      <motion.div
        className="relative z-10 flex flex-col items-center px-8 max-w-md text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Headline */}
        <motion.div variants={itemVariants}>
          <Text
            variant="title1"
            color="primary"
            weight="semibold"
            className="mb-8"
          >
            {headline}
          </Text>
        </motion.div>

        {/* Message lines */}
        <div className="space-y-4 mb-12">
          {lines.map((line, index) => (
            <motion.div key={index} variants={itemVariants}>
              {line ? (
                <Text
                  variant="body"
                  color="secondary"
                  className="leading-relaxed"
                >
                  {line}
                </Text>
              ) : (
                // Empty line for spacing
                <div className="h-4" aria-hidden="true" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col gap-3 w-full max-w-xs"
          variants={buttonContainerVariants}
        >
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onReadyToMove}
            aria-label={primaryButton}
          >
            {primaryButton}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={onNotReady}
            aria-label={secondaryButton}
          >
            {secondaryButton}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
