import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useMemo, useRef } from 'react'
import { Text } from '@/components/ui'

// ============================================================================
// Types
// ============================================================================

interface InsightCard {
  type: 'correlation' | 'progress' | 'warning'
  title: string
  body: string
  icon: React.ReactNode
}

interface StrengthPoint {
  week: number
  value: number
}

// ============================================================================
// Constants - Tend Color Palette
// ============================================================================

const COLORS = {
  sand: '#C4A484',
  sandLight: 'rgba(196, 164, 132, 0.15)',
  sandMuted: 'rgba(196, 164, 132, 0.4)',
  green: '#7CB98B',
  greenLight: 'rgba(124, 185, 139, 0.15)',
  greenMuted: 'rgba(124, 185, 139, 0.4)',
  warmWhite: '#F5F0EB',
  amber: '#E8B866',
  amberLight: 'rgba(232, 184, 102, 0.15)',
}

// ============================================================================
// Mock Data
// ============================================================================

const mockStory = {
  sessionNumber: 23,
  sessionsThisMonth: 18,
  sessionsLastMonth: 14,
  bodyAdapting: true,
  squatProgressPercent: 15,
  squatProgressWeeks: 6,
  recoveryDecline: true,
  backPainCorrelation: true,
}

const mockStrengthData: StrengthPoint[] = [
  { week: 1, value: 60 },
  { week: 2, value: 62 },
  { week: 3, value: 61 },
  { week: 4, value: 65 },
  { week: 5, value: 67 },
  { week: 6, value: 69 },
]

// ============================================================================
// Generative Visual Component
// ============================================================================

function GenerativeVisual({ sessionsThisMonth }: { sessionsThisMonth: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Generate deterministic but unique shapes based on session count
  const shapes = useMemo(() => {
    const seed = sessionsThisMonth * 7
    const result = []
    const count = Math.min(sessionsThisMonth, 25)

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + seed * 0.01
      const radius = 80 + Math.sin(seed + i * 0.5) * 30
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      const size = 8 + Math.sin(seed + i) * 4
      const opacity = 0.3 + (i / count) * 0.5

      result.push({ x, y, size, opacity, delay: i * 0.05 })
    }
    return result
  }, [sessionsThisMonth])

  // Draw organic background curves
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const centerX = width / 2
    const centerY = height / 2

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw flowing curves representing the month's rhythm
    const drawCurve = (offset: number, color: string, alpha: number) => {
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.globalAlpha = alpha
      ctx.lineWidth = 1.5

      for (let i = 0; i <= 100; i++) {
        const t = i / 100
        const angle = t * Math.PI * 2 + offset
        const r = 60 + Math.sin(angle * 3 + sessionsThisMonth * 0.1) * 25
        const x = centerX + Math.cos(angle) * r
        const y = centerY + Math.sin(angle) * r

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.closePath()
      ctx.stroke()
    }

    // Multiple overlapping curves create depth
    drawCurve(0, COLORS.sand, 0.3)
    drawCurve(0.5, COLORS.green, 0.25)
    drawCurve(1.0, COLORS.sand, 0.2)
    drawCurve(1.5, COLORS.green, 0.15)

    ctx.globalAlpha = 1
  }, [sessionsThisMonth])

  return (
    <motion.div
      className="relative w-full h-64 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Background canvas for organic curves */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Animated dots representing sessions */}
      <div className="relative w-48 h-48">
        {shapes.map((shape, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: '50%',
              top: '50%',
              width: shape.size,
              height: shape.size,
              backgroundColor: i % 2 === 0 ? COLORS.sand : COLORS.green,
            }}
            initial={{
              x: 0,
              y: 0,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              x: shape.x,
              y: shape.y,
              opacity: shape.opacity,
              scale: 1,
            }}
            transition={{
              duration: 0.8,
              delay: shape.delay,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          />
        ))}

        {/* Center pulse */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
          style={{ backgroundColor: COLORS.warmWhite }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.4) 100%)`,
        }}
      />
    </motion.div>
  )
}

// ============================================================================
// Narrative Sentence Component
// ============================================================================

function NarrativeSentence({
  sessions,
  lastMonth,
  adapting,
}: {
  sessions: number
  lastMonth: number
  adapting: boolean
}) {
  const comparison =
    sessions > lastMonth
      ? 'More than last month.'
      : sessions === lastMonth
        ? 'Same as last month.'
        : 'A little less than last month.'

  return (
    <motion.div
      className="text-center px-6 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <Text
        variant="title2"
        className="leading-relaxed"
        style={{ color: COLORS.warmWhite }}
      >
        You showed up{' '}
        <span style={{ color: COLORS.sand }}>{sessions} times</span>.{' '}
        {comparison}
        {adapting && (
          <>
            {' '}
            <span style={{ color: COLORS.green }}>Your body is adapting.</span>
          </>
        )}
      </Text>
    </motion.div>
  )
}

// ============================================================================
// Insight Discovery Card
// ============================================================================

function InsightDiscoveryCard({
  insight,
  index,
}: {
  insight: InsightCard
  index: number
}) {
  const bgColor =
    insight.type === 'correlation'
      ? COLORS.sandLight
      : insight.type === 'progress'
        ? COLORS.greenLight
        : COLORS.amberLight

  const accentColor =
    insight.type === 'correlation'
      ? COLORS.sand
      : insight.type === 'progress'
        ? COLORS.green
        : COLORS.amber

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl p-5"
      style={{ backgroundColor: bgColor }}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: 1.2 + index * 0.2,
        ease: [0.34, 1.56, 0.64, 1],
      }}
    >
      {/* Decorative corner accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 opacity-20"
        style={{
          background: `radial-gradient(circle at top right, ${accentColor}, transparent 70%)`,
        }}
      />

      <div className="flex gap-4">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <span style={{ color: accentColor }}>{insight.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <Text
            variant="caption1"
            weight="semibold"
            className="uppercase tracking-wider mb-2"
            style={{ color: accentColor }}
          >
            {insight.title}
          </Text>
          <Text
            variant="body"
            className="leading-relaxed"
            style={{ color: COLORS.warmWhite }}
          >
            {insight.body}
          </Text>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// Organic Strength Curve
// ============================================================================

function StrengthCurve({ data }: { data: StrengthPoint[] }) {
  const width = 300
  const height = 120
  const padding = 20

  const maxValue = Math.max(...data.map((d) => d.value))
  const minValue = Math.min(...data.map((d) => d.value))
  const range = maxValue - minValue || 1

  // Create smooth curve path using bezier curves
  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: height - padding - ((d.value - minValue) / range) * (height - padding * 2),
  }))

  // Generate smooth curve using catmull-rom spline converted to bezier
  const pathD = useMemo(() => {
    if (points.length < 2) return ''

    let d = `M ${points[0].x} ${points[0].y}`

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[Math.min(points.length - 1, i + 2)]

      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
    }

    return d
  }, [points])

  const pathLength = useMotionValue(0)
  const drawLength = useTransform(pathLength, [0, 1], [1, 0])

  useEffect(() => {
    const controls = animate(pathLength, 1, {
      duration: 1.5,
      delay: 1.8,
      ease: 'easeOut',
    })
    return controls.stop
  }, [pathLength])

  return (
    <motion.div
      className="px-4 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 1.6 }}
    >
      <Text
        variant="caption1"
        weight="semibold"
        className="uppercase tracking-wider mb-4 text-center"
        style={{ color: COLORS.sandMuted }}
      >
        Strength Over Time
      </Text>

      <div className="flex justify-center">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          {/* Subtle grid lines */}
          {[0, 0.5, 1].map((t) => (
            <line
              key={t}
              x1={padding}
              y1={padding + t * (height - padding * 2)}
              x2={width - padding}
              y2={padding + t * (height - padding * 2)}
              stroke={COLORS.sandMuted}
              strokeWidth={0.5}
              opacity={0.2}
            />
          ))}

          {/* Gradient fill under curve */}
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.3} />
              <stop offset="100%" stopColor={COLORS.green} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Fill area */}
          <motion.path
            d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
            fill="url(#curveGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.2 }}
          />

          {/* Main curve */}
          <motion.path
            d={pathD}
            fill="none"
            stroke={COLORS.green}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              pathLength: drawLength,
              strokeDasharray: 1,
              strokeDashoffset: drawLength,
            }}
          />

          {/* Data points */}
          {points.map((point, i) => (
            <motion.circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={COLORS.green}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: 2.0 + i * 0.1,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            />
          ))}

          {/* Latest point highlight */}
          <motion.circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r={8}
            fill={COLORS.green}
            opacity={0.2}
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 2.5,
            }}
          />
        </svg>
      </div>

      {/* Week labels */}
      <div className="flex justify-between px-5 mt-2">
        <Text variant="caption2" style={{ color: COLORS.sandMuted }}>
          Week 1
        </Text>
        <Text variant="caption2" style={{ color: COLORS.sandMuted }}>
          Week {data.length}
        </Text>
      </div>
    </motion.div>
  )
}

// ============================================================================
// Journey Session Counter
// ============================================================================

function JourneyCounter({ sessionNumber }: { sessionNumber: number }) {
  return (
    <motion.div
      className="text-center py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 2.5 }}
    >
      <motion.div
        className="inline-flex items-center gap-3 px-6 py-3 rounded-full"
        style={{ backgroundColor: COLORS.sandLight }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: COLORS.sand }}
        />
        <Text
          variant="subhead"
          weight="medium"
          style={{ color: COLORS.warmWhite }}
        >
          Session{' '}
          <span style={{ color: COLORS.sand }}>{sessionNumber}</span> of your
          story
        </Text>
      </motion.div>
    </motion.div>
  )
}

// ============================================================================
// Main Progress Page
// ============================================================================

export function ProgressPage() {
  // Build insight cards from data
  const insights: InsightCard[] = useMemo(() => {
    const cards: InsightCard[] = []

    if (mockStory.backPainCorrelation) {
      cards.push({
        type: 'correlation',
        title: 'Correlation Discovery',
        body: 'Your back pain tends to appear after days when you skip morning mobility.',
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        ),
      })
    }

    if (mockStory.squatProgressPercent > 0) {
      cards.push({
        type: 'progress',
        title: 'Progress Recognition',
        body: `Your squat has increased ${mockStory.squatProgressPercent}% in ${mockStory.squatProgressWeeks} weeks. Consistent effort, compounding.`,
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        ),
      })
    }

    if (mockStory.recoveryDecline) {
      cards.push({
        type: 'warning',
        title: 'Gentle Warning',
        body: 'Your recovery scores have been declining. A lighter week could help.',
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        ),
      })
    }

    return cards
  }, [])

  return (
    <div className="min-h-full pb-16">
      {/* Generative Visual Header */}
      <GenerativeVisual sessionsThisMonth={mockStory.sessionsThisMonth} />

      {/* Narrative Sentence */}
      <NarrativeSentence
        sessions={mockStory.sessionsThisMonth}
        lastMonth={mockStory.sessionsLastMonth}
        adapting={mockStory.bodyAdapting}
      />

      {/* Insight Discovery Cards */}
      <section className="px-4 space-y-4 mb-8">
        {insights.map((insight, index) => (
          <InsightDiscoveryCard key={insight.type} insight={insight} index={index} />
        ))}
      </section>

      {/* Organic Strength Curve */}
      <section className="mb-6">
        <StrengthCurve data={mockStrengthData} />
      </section>

      {/* Journey Counter */}
      <JourneyCounter sessionNumber={mockStory.sessionNumber} />
    </div>
  )
}
