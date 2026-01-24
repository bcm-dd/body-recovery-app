import { motion } from 'framer-motion'
import { Card, Text, Button } from '@/components/ui'

// Placeholder body page
export function BodyPage() {
  return (
    <div className="min-h-full pb-8">
      <header className="px-4 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Text variant="title1">Body</Text>
          <Text variant="subhead" color="secondary" className="mt-1">
            Track injuries and constraints
          </Text>
        </motion.div>
      </header>

      <section className="px-4">
        <Card variant="elevated" padding="lg" className="text-center">
          <div className="py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-muted flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-accent"
              >
                <circle cx="12" cy="5" r="3" />
                <path d="M12 10L12 16" />
                <path d="M12 16L8 22" />
                <path d="M12 16L16 22" />
                <path d="M8 12L12 10L16 12" />
              </svg>
            </div>
            <Text variant="headline" className="mb-2">
              Body Map Coming Soon
            </Text>
            <Text variant="body" color="secondary" className="mb-6">
              Interactive body model to track injuries, pain points, and physical constraints.
            </Text>
            <Button variant="secondary">Log Pain Point</Button>
          </div>
        </Card>
      </section>
    </div>
  )
}
