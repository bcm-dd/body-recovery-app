/**
 * Today Page - Body Weather Experience
 *
 * The morning moment. Full-screen, atmospheric, immersive.
 * Feeling tells you your state before numbers do.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { Card, Text, Button } from '@/components/ui'
import { BodyWeather } from '@/components/body-weather'

// Mock data - will be replaced with API calls
type Recommendation = 'rest' | 'light' | 'moderate' | 'full'

const mockReadiness: {
  score: number
  factors: { sleep: number; recovery: number; load: number; body: number }
  recommendation: Recommendation
} = {
  score: 72,
  factors: {
    sleep: 85,
    recovery: 68,
    load: 55,
    body: 80,
  },
  recommendation: 'moderate',
}

const mockWorkout = {
  name: 'Upper Body Flow',
  duration: 45,
  exercises: 6,
  focus: 'strength & mobility',
}

type ViewState = 'weather' | 'day'

export function TodayPage() {
  const [view, setView] = useState<ViewState>('weather')
  const today = new Date()

  return (
    <div className="min-h-full bg-void">
      <AnimatePresence mode="wait">
        {view === 'weather' ? (
          <motion.div
            key="weather"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen"
          >
            {/* Body Weather - Full Screen Experience */}
            <BodyWeather
              score={mockReadiness.score}
              recommendation={mockReadiness.recommendation}
              factors={mockReadiness.factors}
            />

            {/* Gentle prompt to continue */}
            <motion.div
              className="absolute bottom-8 left-0 right-0 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.8 }}
            >
              <Button
                variant="secondary"
                onClick={() => setView('day')}
                className="backdrop-blur-md bg-white/10 border-white/20"
              >
                See what's ahead
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="day"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="min-h-full pb-24"
          >
            {/* Header */}
            <header className="px-5 pt-8 pb-6">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <button
                  onClick={() => setView('weather')}
                  className="text-text-tertiary text-sm mb-2 hover:text-text-secondary transition-colors"
                >
                  ← Back to body weather
                </button>
                <Text variant="title1" className="mt-2">
                  {format(today, 'EEEE')}
                </Text>
                <Text variant="subhead" color="secondary">
                  {format(today, 'MMMM d')}
                </Text>
              </motion.div>
            </header>

            {/* Body's Message */}
            <section className="px-5 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card variant="elevated" padding="lg" className="relative overflow-hidden">
                  {/* Subtle gradient accent */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />

                  <div className="relative">
                    <Text variant="headline" className="mb-2">
                      Your body today
                    </Text>
                    <Text variant="body" color="secondary" className="leading-relaxed">
                      {getBodyMessage(mockReadiness.recommendation, mockReadiness.factors)}
                    </Text>
                  </div>
                </Card>
              </motion.div>
            </section>

            {/* Today's Movement */}
            {mockReadiness.recommendation !== 'rest' && (
              <section className="px-5 mb-8">
                <Text variant="headline" className="mb-3 px-1">
                  Movement for today
                </Text>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Card variant="default" padding="lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Text variant="title3">{mockWorkout.name}</Text>
                        <Text variant="footnote" color="secondary" className="mt-1">
                          {mockWorkout.focus} · ~{mockWorkout.duration} min
                        </Text>
                      </div>
                      <IntensityBadge recommendation={mockReadiness.recommendation} />
                    </div>

                    <Text variant="footnote" color="secondary" className="mb-5">
                      {mockWorkout.exercises} movements, adapted to how you're feeling
                    </Text>

                    <Button fullWidth size="lg">
                      Begin when ready
                    </Button>
                  </Card>
                </motion.div>
              </section>
            )}

            {/* Rest Day Alternative */}
            {mockReadiness.recommendation === 'rest' && (
              <section className="px-5 mb-8">
                <Text variant="headline" className="mb-3 px-1">
                  Rest is the work
                </Text>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Card variant="default" padding="lg">
                    <Text variant="body" color="secondary" className="mb-4">
                      Your body is asking for recovery. That's not weakness—it's wisdom.
                    </Text>
                    <div className="space-y-3">
                      <RestOption title="5-minute breathing" subtitle="Calm your nervous system" />
                      <RestOption title="Gentle stretching" subtitle="10 minutes of mobility" />
                      <RestOption title="Just rest" subtitle="Do nothing, guilt-free" />
                    </div>
                  </Card>
                </motion.div>
              </section>
            )}

            {/* Something to Note */}
            <section className="px-5 mb-8">
              <Text variant="headline" className="mb-3 px-1">
                Anything to note?
              </Text>
              <div className="grid grid-cols-2 gap-3">
                <NoteCard
                  title="Something hurts"
                  subtitle="Let's track it"
                  delay={0.3}
                />
                <NoteCard
                  title="Feeling good"
                  subtitle="Worth noting too"
                  delay={0.35}
                />
              </div>
            </section>

            {/* Your Journey */}
            <section className="px-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Card variant="default" padding="md">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text variant="body" weight="medium">
                        Session 23
                      </Text>
                      <Text variant="footnote" color="secondary">
                        You've been consistent for 6 weeks
                      </Text>
                    </div>
                    <div className="text-right">
                      <Text variant="caption1" color="secondary">
                        Building something
                      </Text>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function IntensityBadge({
  recommendation,
}: {
  recommendation: 'rest' | 'light' | 'moderate' | 'full'
}) {
  const config = {
    rest: { label: 'Rest', className: 'bg-slate-500/20 text-slate-300' },
    light: { label: 'Light', className: 'bg-amber-500/20 text-amber-300' },
    moderate: { label: 'Moderate', className: 'bg-blue-500/20 text-blue-300' },
    full: { label: 'Full', className: 'bg-emerald-500/20 text-emerald-300' },
  }

  const { label, className } = config[recommendation]

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

function RestOption({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <button className="w-full text-left p-3 rounded-lg bg-surface hover:bg-elevated transition-colors">
      <Text variant="body" weight="medium">
        {title}
      </Text>
      <Text variant="caption1" color="secondary">
        {subtitle}
      </Text>
    </button>
  )
}

function NoteCard({
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
      <Card variant="default" padding="md" interactive className="cursor-pointer">
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

function getBodyMessage(
  recommendation: 'rest' | 'light' | 'moderate' | 'full',
  factors: { sleep: number; recovery: number; load: number; body: number }
): string {
  // Generate a personalized, warm message based on factors
  const sleepNote = factors.sleep >= 80
    ? "You slept well"
    : factors.sleep >= 60
      ? "Sleep was okay"
      : "Sleep was short"

  const recoveryNote = factors.recovery >= 70
    ? "and your body has recovered nicely"
    : factors.recovery >= 50
      ? "and you're partially recovered"
      : "and you're still processing recent training"

  switch (recommendation) {
    case 'rest':
      return `${sleepNote}, ${recoveryNote}. Today, rest is the work. Your body will thank you tomorrow.`
    case 'light':
      return `${sleepNote}, ${recoveryNote}. Something light would feel good—movement without strain.`
    case 'moderate':
      return `${sleepNote}, ${recoveryNote}. You have capacity for meaningful work today, without pushing limits.`
    case 'full':
      return `${sleepNote}, ${recoveryNote}. You're in a good place. Full training is available to you.`
  }
}
