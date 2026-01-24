import { Component, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Button, Text } from '@/components/ui'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary Component
 *
 * Catches React errors and displays a friendly recovery UI.
 * Matches Tend's warm, supportive voice.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static displayName = 'ErrorBoundary'

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service in production
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <ErrorFallback onRetry={this.handleRetry} onGoHome={this.handleGoHome} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  onRetry: () => void
  onGoHome: () => void
}

function ErrorFallback({ onRetry, onGoHome }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-void">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        {/* Animated illustration */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Outer glow */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(196, 164, 132, 0.12) 0%, transparent 70%)',
              width: 140,
              height: 140,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Healing/recovery icon */}
          <motion.svg
            width="140"
            height="140"
            viewBox="0 0 140 140"
            fill="none"
            className="relative z-10"
          >
            {/* Broken circle being mended */}
            <motion.circle
              cx="70"
              cy="70"
              r="45"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="200 80"
              className="text-border"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ transformOrigin: 'center' }}
            />

            {/* Healing light */}
            <motion.circle
              cx="70"
              cy="70"
              r="20"
              className="fill-accent/10"
              animate={{
                r: [18, 22, 18],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Heart in center */}
            <motion.path
              d="M70 58 C66 54 60 54 58 58 C54 64 58 70 70 80 C82 70 86 64 82 58 C80 54 74 54 70 58"
              fill="currentColor"
              className="text-accent"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ transformOrigin: 'center' }}
            />

            {/* Small healing particles */}
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <motion.circle
                key={i}
                cx={70 + 35 * Math.cos((angle * Math.PI) / 180)}
                cy={70 + 35 * Math.sin((angle * Math.PI) / 180)}
                r="3"
                className="fill-accent/40"
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.svg>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8"
        >
          <Text variant="title2" className="mb-3">
            Something went wrong
          </Text>
          <Text variant="body" color="secondary" className="leading-relaxed">
            We're on it. Let's try that again.
          </Text>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full"
        >
          <Button
            onClick={onRetry}
            fullWidth
            className="mb-3"
          >
            Try again
          </Button>
          <Button
            variant="ghost"
            onClick={onGoHome}
            fullWidth
          >
            Go home
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
