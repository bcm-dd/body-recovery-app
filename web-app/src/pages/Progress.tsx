import { motion } from 'framer-motion'
import { Card, Text } from '@/components/ui'

const mockStats = {
  workoutsThisWeek: 4,
  weeklyStreak: 3,
  totalWorkouts: 47,
  averageReadiness: 68,
}

const mockRecentWorkouts = [
  { date: 'Today', name: 'Upper Body', duration: 42, completed: true },
  { date: 'Yesterday', name: 'Lower Body', duration: 38, completed: true },
  { date: 'Wed', name: 'Push Day', duration: 45, completed: true },
  { date: 'Tue', name: 'Rest Day', duration: 0, completed: false },
]

export function ProgressPage() {
  return (
    <div className="min-h-full pb-8">
      <header className="px-4 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Text variant="title1">Progress</Text>
          <Text variant="subhead" color="secondary" className="mt-1">
            Your training journey
          </Text>
        </motion.div>
      </header>

      {/* Stats Grid */}
      <section className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            value={mockStats.workoutsThisWeek}
            label="This Week"
            delay={0.1}
          />
          <StatCard
            value={`${mockStats.weeklyStreak} wk`}
            label="Streak"
            delay={0.15}
          />
          <StatCard
            value={mockStats.totalWorkouts}
            label="Total Workouts"
            delay={0.2}
          />
          <StatCard
            value={`${mockStats.averageReadiness}%`}
            label="Avg Readiness"
            delay={0.25}
          />
        </div>
      </section>

      {/* Recent Activity */}
      <section className="px-4">
        <Text variant="headline" className="mb-3">
          Recent Activity
        </Text>
        <div className="space-y-2">
          {mockRecentWorkouts.map((workout, index) => (
            <motion.div
              key={workout.date}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
            >
              <Card
                variant="default"
                padding="md"
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      workout.completed
                        ? 'bg-success/10'
                        : 'bg-text-tertiary/10'
                    }`}
                  >
                    {workout.completed ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-success"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-text-tertiary"
                      >
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <Text variant="body" weight="medium">
                      {workout.name}
                    </Text>
                    <Text variant="caption1" color="secondary">
                      {workout.date}
                    </Text>
                  </div>
                </div>
                {workout.duration > 0 && (
                  <Text variant="subhead" color="secondary">
                    {workout.duration}m
                  </Text>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}

function StatCard({
  value,
  label,
  delay,
}: {
  value: string | number
  label: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card variant="elevated" padding="md" className="text-center">
        <Text variant="title2" color="accent">
          {value}
        </Text>
        <Text variant="caption1" color="secondary" className="mt-1">
          {label}
        </Text>
      </Card>
    </motion.div>
  )
}
