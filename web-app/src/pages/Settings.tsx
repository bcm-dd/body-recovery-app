import { motion } from 'framer-motion'
import { Card, Text, Button } from '@/components/ui'
import { cn } from '@/lib/cn'

const settingsSections = [
  {
    title: 'Your account',
    items: [
      { label: 'Your profile', value: 'Edit' },
      { label: 'Email', value: 'user@example.com' },
      { label: 'Password', value: 'Update' },
    ],
  },
  {
    title: 'Training preferences',
    items: [
      { label: 'Units', value: 'Metric' },
      { label: 'Week begins', value: 'Monday' },
      { label: 'Gentle reminders', value: 'On' },
    ],
  },
  {
    title: 'How we connect',
    items: [
      { label: 'Apple Health', value: 'Connected' },
      { label: 'Export your data', value: '' },
    ],
  },
]

export function SettingsPage() {
  return (
    <div className="min-h-full pb-8">
      <header className="px-4 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Text variant="title1">Settings</Text>
          <Text variant="footnote" color="tertiary" className="mt-1">
            Move with wisdom
          </Text>
        </motion.div>
      </header>

      <div className="px-4 space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + sectionIndex * 0.1 }}
          >
            <Text
              variant="footnote"
              color="secondary"
              className="uppercase tracking-wider mb-2 px-1"
            >
              {section.title}
            </Text>
            <Card variant="default" padding="none">
              {section.items.map((item, itemIndex) => (
                <div
                  key={item.label}
                  className={cn(
                    'flex items-center justify-between px-4 py-3',
                    'cursor-pointer hover:bg-elevated transition-colors duration-fast',
                    itemIndex > 0 && 'border-t border-border'
                  )}
                >
                  <Text variant="body">{item.label}</Text>
                  <div className="flex items-center gap-2">
                    {item.value && (
                      <Text variant="body" color="secondary">
                        {item.value}
                      </Text>
                    )}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-text-tertiary"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              ))}
            </Card>
          </motion.section>
        ))}

        {/* About Tend */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Text
            variant="footnote"
            color="secondary"
            className="uppercase tracking-wider mb-2 px-1"
          >
            About Tend
          </Text>
          <Card variant="default" padding="md">
            <div className="space-y-3">
              <div
                className="w-10 h-1 rounded-full"
                style={{ backgroundColor: '#C4A484' }}
              />
              <Text variant="body" color="secondary" className="leading-relaxed">
                Tend helps you listen to your body. We don't optimize you — we help you understand yourself.
              </Text>
              <Text variant="caption1" color="tertiary">
                Built with care for those who move through life mindfully.
              </Text>
            </div>
          </Card>
        </motion.section>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Button variant="danger" fullWidth>
            Sign Out
          </Button>
        </motion.div>

        {/* Version */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="text-center pt-4"
        >
          <Text variant="caption2" color="tertiary">
            Tend v1.0.0
          </Text>
        </motion.div>
      </div>
    </div>
  )
}
