import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Card, Text, Button } from '@/components/ui'
import { ReadinessRing, ReadinessFactorLegend } from '@/components/readiness/ReadinessRing'
import type { ReadinessRecommendation } from '@/types'

// Mock data - will be replaced with API calls
const mockReadiness = {
  score: 72,
  factors: {
    sleep: 85,
    recovery: 68,
    load: 55,
    body: 80,
  },
  recommendation: 'moderate' as const,
}

const mockWorkout = {
  name: 'Upper Body Strength',
  duration: 45,
  exercises: 7,
  sets: 24,
}

export function TodayPage() {
  const today = new Date()
  const greeting = getGreeting()

  return (
    <div className="min-h-full pb-8">
      {/* Header */}
      <header className="px-4 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Text variant="title1">{greeting}</Text>
          <Text variant="subhead" color="secondary" className="mt-1">
            {format(today, 'EEEE, MMMM d')}
          </Text>
        </motion.div>
      </header>

      {/* Readiness Section */}
      <section className="px-4 py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center"
        >
          <ReadinessRing
            score={mockReadiness.score}
            factors={mockReadiness.factors}
            recommendation={mockReadiness.recommendation}
            size="md"
          />
          <Text variant="body" color="secondary" className="mt-4 text-center">
            {getReadinessMessage(mockReadiness.recommendation)}
          </Text>
        </motion.div>
      </section>

      {/* Today's Session */}
      <section className="px-4 mb-6">
        <Text variant="headline" className="mb-3">
          Today's Session
        </Text>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <Text variant="title3">{mockWorkout.name}</Text>
              <span className="px-2 py-1 rounded-md bg-accent-muted text-accent text-caption1">
                ~{mockWorkout.duration} min
              </span>
            </div>

            <div className="flex items-center justify-around py-4 border-t border-border">
              <WorkoutStat value={mockWorkout.exercises} label="exercises" />
              <div className="w-px h-10 bg-border" />
              <WorkoutStat value={mockWorkout.sets} label="sets" />
              <div className="w-px h-10 bg-border" />
              <WorkoutStat
                value={getIntensityLabel(mockReadiness.recommendation)}
                label="intensity"
              />
            </div>

            <Button fullWidth size="lg" className="mt-4">
              Start Workout
            </Button>
          </Card>
        </motion.div>
      </section>

      {/* Quick Actions */}
      <section className="px-4 mb-6">
        <Text variant="headline" className="mb-3">
          Quick Actions
        </Text>
        <div className="grid grid-cols-2 gap-3">
          <QuickActionCard
            title="Log Pain"
            subtitle="Track discomfort"
            delay={0.3}
          />
          <QuickActionCard
            title="Adjust Plan"
            subtitle="Modify schedule"
            delay={0.35}
          />
        </div>
      </section>

      {/* Readiness Factors */}
      <section className="px-4">
        <Text variant="headline" className="mb-3">
          Readiness Factors
        </Text>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card variant="default" padding="md">
            <ReadinessFactorLegend factors={mockReadiness.factors} />
          </Card>
        </motion.div>
      </section>
    </div>
  )
}

function WorkoutStat({
  value,
  label,
}: {
  value: string | number
  label: string
}) {
  return (
    <div className="flex flex-col items-center">
      <Text variant="title3" color="accent">
        {value}
      </Text>
      <Text variant="caption1" color="secondary">
        {label}
      </Text>
    </div>
  )
}

function QuickActionCard({
  title,
  subtitle,
  delay,
}: {
  title: string
  subtitle: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card
        variant="default"
        padding="md"
        interactive
        className="cursor-pointer"
      >
        <Text variant="body" weight="medium">
          {title}
        </Text>
        <Text variant="caption1" color="secondary" className="mt-0.5">
          {subtitle}
        </Text>
      </Card>
    </motion.div>
  )
}

function getIntensityLabel(recommendation: ReadinessRecommendation): string {
  switch (recommendation) {
    case 'full':
      return 'Full'
    case 'moderate':
      return 'Mod'
    case 'light':
      return 'Light'
    case 'rest':
      return 'Rest'
  }
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getReadinessMessage(
  recommendation: 'rest' | 'light' | 'moderate' | 'full'
): string {
  switch (recommendation) {
    case 'rest':
      return 'Rest day recommended. Your body needs recovery.'
    case 'light':
      return 'Take it easy today. Light movement is beneficial.'
    case 'moderate':
      return 'A moderate session is recommended.'
    case 'full':
      return "You're ready for a full session!"
  }
}
