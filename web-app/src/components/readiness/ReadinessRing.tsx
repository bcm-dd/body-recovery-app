import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface ReadinessFactors {
  sleep: number    // 0-100
  recovery: number // 0-100
  load: number     // 0-100
  body: number     // 0-100
}

interface ReadinessRingProps {
  score: number
  factors?: ReadinessFactors
  recommendation?: 'rest' | 'light' | 'moderate' | 'full'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { ring: 120, stroke: 8, score: 32, label: 12 },
  md: { ring: 200, stroke: 12, score: 48, label: 14 },
  lg: { ring: 240, stroke: 12, score: 56, label: 16 },
}

const factorColors = {
  sleep: '#9BB5C9',    // Calm blue (healing)
  recovery: '#7CB98B', // Soft green (good)
  load: '#D4A84B',     // Warm amber (caution)
  body: '#C4A484',     // Warm sand (accent)
}

const recommendationColors = {
  rest: '#C97B7B',     // Soft red (concern)
  light: '#D4A84B',    // Warm amber (caution)
  moderate: '#C4A484', // Warm sand (accent)
  full: '#7CB98B',     // Soft green (good)
}

export function ReadinessRing({
  score,
  factors,
  recommendation = 'moderate',
  size = 'md',
  className,
}: ReadinessRingProps) {
  const config = sizes[size]
  const center = config.ring / 2
  const radius = (config.ring - config.stroke) / 2
  const circumference = 2 * Math.PI * radius
  const segmentGap = 4 // degrees

  // Calculate segment arcs
  const factorEntries = factors
    ? Object.entries(factors) as [keyof ReadinessFactors, number][]
    : []

  const totalGap = segmentGap * 4 // 4 segments
  const availableArc = 360 - totalGap
  const segmentArc = availableArc / 4

  const getScoreColor = () => {
    return recommendationColors[recommendation]
  }

  const getRecommendationLabel = () => {
    switch (recommendation) {
      case 'rest':
        return 'Rest Day'
      case 'light':
        return 'Take it Easy'
      case 'moderate':
        return 'Moderate'
      case 'full':
        return 'Full Session'
    }
  }

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <svg
        width={config.ring}
        height={config.ring}
        viewBox={`0 0 ${config.ring} ${config.ring}`}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#2A2A2E"
          strokeWidth={config.stroke}
          strokeLinecap="round"
        />

        {/* Factor segments */}
        {factorEntries.map(([key, value], index) => {
          const startAngle = index * (segmentArc + segmentGap)
          const segmentLength = (segmentArc * value) / 100
          const dashArray = `${(segmentLength / 360) * circumference} ${circumference}`
          const offset = (startAngle / 360) * circumference

          return (
            <motion.circle
              key={key}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={factorColors[key]}
              strokeWidth={config.stroke}
              strokeLinecap="round"
              strokeDasharray={dashArray}
              strokeDashoffset={-offset}
              initial={{ strokeDashoffset: circumference - offset }}
              animate={{ strokeDashoffset: -offset }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
            />
          )
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-bold"
          style={{
            fontSize: config.score,
            color: getScoreColor(),
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {score}
        </motion.span>
        <motion.span
          className="text-text-secondary"
          style={{ fontSize: config.label }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          {getRecommendationLabel()}
        </motion.span>
      </div>
    </div>
  )
}

// Factor legend component
export function ReadinessFactorLegend({
  factors,
  className,
}: {
  factors: ReadinessFactors
  className?: string
}) {
  const factorLabels: Record<keyof ReadinessFactors, string> = {
    sleep: 'Sleep',
    recovery: 'Recovery',
    load: 'Training Load',
    body: 'Body Status',
  }

  return (
    <div className={cn('space-y-3', className)}>
      {(Object.entries(factors) as [keyof ReadinessFactors, number][]).map(
        ([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: factorColors[key] }}
              />
              <span className="text-subhead text-text-primary">
                {factorLabels[key]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: factorColors[key] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <span className="text-subhead text-text-secondary w-10 text-right">
                {value}%
              </span>
            </div>
          </div>
        )
      )}
    </div>
  )
}
