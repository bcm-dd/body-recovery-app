import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { Button, Text } from '@/components/ui'

/**
 * NotFound Page
 *
 * A warm, friendly 404 page that guides users back home.
 * Matches Tend's compassionate, supportive voice.
 */
export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
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
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(196, 164, 132, 0.12) 0%, transparent 70%)',
              width: 160,
              height: 160,
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

          {/* Path icon */}
          <motion.svg
            width="160"
            height="160"
            viewBox="0 0 160 160"
            fill="none"
            className="relative z-10"
          >
            {/* Wandering path */}
            <motion.path
              d="M40 120 Q60 100 80 100 Q100 100 100 80 Q100 60 80 60 Q60 60 60 40"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="8 8"
              className="text-border"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />

            {/* Start point */}
            <motion.circle
              cx="40"
              cy="120"
              r="6"
              className="fill-text-tertiary"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            />

            {/* Question mark at end */}
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              <circle
                cx="60"
                cy="40"
                r="20"
                className="fill-accent/10"
              />
              <text
                x="60"
                y="48"
                textAnchor="middle"
                className="fill-accent text-title2 font-semibold"
                style={{ fontSize: '24px' }}
              >
                ?
              </text>
            </motion.g>

            {/* Compass rose hint */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <circle
                cx="120"
                cy="80"
                r="16"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                className="text-border"
              />
              <motion.line
                x1="120"
                y1="68"
                x2="120"
                y2="72"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-accent"
                animate={{
                  y1: [68, 66, 68],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <line
                x1="120"
                y1="88"
                x2="120"
                y2="92"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-text-tertiary"
              />
            </motion.g>
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
            This path doesn't exist
          </Text>
          <Text variant="body" color="secondary" className="leading-relaxed">
            Let's get you back on track.
          </Text>
        </motion.div>

        {/* Action */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full"
        >
          <Button
            onClick={() => navigate('/')}
            fullWidth
            className="mb-3"
          >
            Go home
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            fullWidth
          >
            Go back
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

NotFoundPage.displayName = 'NotFoundPage'
