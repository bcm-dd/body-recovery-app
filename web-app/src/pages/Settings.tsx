import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Text, Button } from '@/components/ui'
import { cn } from '@/lib/cn'

// ============================================================================
// Types
// ============================================================================

interface ToastState {
  visible: boolean
  message: string
  type: 'info' | 'success' | 'error'
}

// ============================================================================
// Toast Component
// ============================================================================

function Toast({ message, type, onDismiss }: { message: string; type: 'info' | 'success' | 'error'; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const bgColor = {
    info: 'bg-elevated border-accent/30',
    success: 'bg-elevated border-good/30',
    error: 'bg-elevated border-concern/30',
  }[type]

  const iconColor = {
    info: 'text-accent',
    success: 'text-good',
    error: 'text-concern',
  }[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={cn(
        'fixed bottom-24 left-4 right-4 max-w-[398px] mx-auto z-50',
        'px-4 py-3 rounded-lg border backdrop-blur-lg',
        bgColor
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('w-6 h-6 rounded-full flex items-center justify-center', iconColor)}>
          {type === 'success' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : type === 'error' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          )}
        </div>
        <Text variant="subhead" className="flex-1">{message}</Text>
      </div>
    </motion.div>
  )
}

// ============================================================================
// Modal Component
// ============================================================================

function Modal({
  open,
  title,
  message,
  confirmLabel,
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  confirmVariant?: 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-sm bg-surface border border-border rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-4">
          <Text variant="headline" className="mb-2">{title}</Text>
          <Text variant="body" color="secondary" className="leading-relaxed">
            {message}
          </Text>
        </div>
        <div className="flex gap-3 p-4 border-t border-border bg-elevated/50">
          <Button
            variant="secondary"
            fullWidth
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            fullWidth
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============================================================================
// Select Sheet Component
// ============================================================================

function SelectSheet({
  open,
  title,
  options,
  currentValue,
  onSelect,
  onClose,
}: {
  open: boolean
  title: string
  options: string[]
  currentValue: string
  onSelect: (value: string) => void
  onClose: () => void
}) {
  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-void/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-[430px] bg-surface border-t border-border rounded-t-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border">
          <Text variant="headline" className="text-center">{title}</Text>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onSelect(option)
                onClose()
              }}
              className={cn(
                'w-full px-4 py-3 flex items-center justify-between',
                'transition-colors duration-fast',
                'hover:bg-elevated active:bg-elevated',
                option === currentValue && 'bg-accent/10'
              )}
            >
              <Text variant="body">{option}</Text>
              {option === currentValue && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-border safe-bottom">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Done
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============================================================================
// Settings Row Component
// ============================================================================

function SettingsRow({
  label,
  value,
  isFirst = false,
  onClick,
  showChevron = true,
}: {
  label: string
  value?: string
  isFirst?: boolean
  onClick: () => void
  showChevron?: boolean
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between px-4 py-3',
        'cursor-pointer hover:bg-elevated active:bg-elevated/80 transition-colors duration-fast',
        'text-left',
        !isFirst && 'border-t border-border'
      )}
    >
      <Text variant="body">{label}</Text>
      <div className="flex items-center gap-2">
        {value && (
          <Text variant="body" color="secondary">
            {value}
          </Text>
        )}
        {showChevron && (
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
        )}
      </div>
    </motion.button>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function SettingsPage() {
  // User state (would come from auth context in real app)
  const [userEmail] = useState(() => {
    // Check localStorage for saved email, fallback to placeholder
    return localStorage.getItem('tend_user_email') || 'your.email@example.com'
  })

  // Settings state
  const [units, setUnits] = useState(() => localStorage.getItem('tend_units') || 'Metric')
  const [weekStart, setWeekStart] = useState(() => localStorage.getItem('tend_week_start') || 'Monday')
  const [reminders, setReminders] = useState(() => localStorage.getItem('tend_reminders') !== 'Off')
  const [healthConnected, setHealthConnected] = useState(() => localStorage.getItem('tend_health_connected') === 'true')

  // UI state
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'info' })
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [selectSheet, setSelectSheet] = useState<{ open: boolean; title: string; options: string[]; currentValue: string; onSelect: (v: string) => void } | null>(null)

  // Toast helper
  const showToast = useCallback((message: string, type: ToastState['type'] = 'info') => {
    setToast({ visible: true, message, type })
  }, [])

  const dismissToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }))
  }, [])

  // Action handlers
  const handleEditProfile = useCallback(() => {
    showToast('Profile editing coming soon', 'info')
  }, [showToast])

  const handleEditEmail = useCallback(() => {
    showToast('Email updates coming soon', 'info')
  }, [showToast])

  const handleUpdatePassword = useCallback(() => {
    showToast('Password updates coming soon', 'info')
  }, [showToast])

  const handleUnitsChange = useCallback(() => {
    setSelectSheet({
      open: true,
      title: 'Choose units',
      options: ['Metric', 'Imperial'],
      currentValue: units,
      onSelect: (value) => {
        setUnits(value)
        localStorage.setItem('tend_units', value)
        showToast(`Switched to ${value}`, 'success')
      },
    })
  }, [units, showToast])

  const handleWeekStartChange = useCallback(() => {
    setSelectSheet({
      open: true,
      title: 'Week begins on',
      options: ['Sunday', 'Monday', 'Saturday'],
      currentValue: weekStart,
      onSelect: (value) => {
        setWeekStart(value)
        localStorage.setItem('tend_week_start', value)
        showToast(`Week now starts on ${value}`, 'success')
      },
    })
  }, [weekStart, showToast])

  const handleRemindersToggle = useCallback(() => {
    const newValue = !reminders
    setReminders(newValue)
    localStorage.setItem('tend_reminders', newValue ? 'On' : 'Off')
    showToast(newValue ? 'Gentle reminders enabled' : 'Reminders turned off', 'success')
  }, [reminders, showToast])

  const handleHealthConnect = useCallback(() => {
    if (healthConnected) {
      // Disconnect
      setHealthConnected(false)
      localStorage.setItem('tend_health_connected', 'false')
      showToast('Apple Health disconnected', 'info')
    } else {
      // Simulate connection
      showToast('Connecting to Apple Health...', 'info')
      setTimeout(() => {
        setHealthConnected(true)
        localStorage.setItem('tend_health_connected', 'true')
        showToast('Apple Health connected', 'success')
      }, 1500)
    }
  }, [healthConnected, showToast])

  const handleExportData = useCallback(() => {
    showToast('Preparing your data export...', 'info')
    setTimeout(() => {
      showToast('Data export ready for download', 'success')
    }, 2000)
  }, [showToast])

  const handleSignOut = useCallback(async () => {
    setSigningOut(true)

    // Simulate sign out delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Clear all local state
    localStorage.removeItem('tend_user_email')
    localStorage.removeItem('tend_units')
    localStorage.removeItem('tend_week_start')
    localStorage.removeItem('tend_reminders')
    localStorage.removeItem('tend_health_connected')

    setSigningOut(false)
    setShowSignOutModal(false)

    // In a real app, this would redirect to login
    showToast('Signed out successfully. Take care.', 'success')

    // Reload the page after a brief moment
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }, [showToast])

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
        {/* Your Account */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Text
            variant="footnote"
            color="secondary"
            className="uppercase tracking-wider mb-2 px-1"
          >
            Your account
          </Text>
          <Card variant="default" padding="none">
            <SettingsRow
              label="Your profile"
              value="Edit"
              isFirst
              onClick={handleEditProfile}
            />
            <SettingsRow
              label="Email"
              value={userEmail}
              onClick={handleEditEmail}
            />
            <SettingsRow
              label="Password"
              value="Update"
              onClick={handleUpdatePassword}
            />
          </Card>
        </motion.section>

        {/* Training Preferences */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Text
            variant="footnote"
            color="secondary"
            className="uppercase tracking-wider mb-2 px-1"
          >
            Training preferences
          </Text>
          <Card variant="default" padding="none">
            <SettingsRow
              label="Units"
              value={units}
              isFirst
              onClick={handleUnitsChange}
            />
            <SettingsRow
              label="Week begins"
              value={weekStart}
              onClick={handleWeekStartChange}
            />
            <SettingsRow
              label="Gentle reminders"
              value={reminders ? 'On' : 'Off'}
              onClick={handleRemindersToggle}
            />
          </Card>
        </motion.section>

        {/* How We Connect */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Text
            variant="footnote"
            color="secondary"
            className="uppercase tracking-wider mb-2 px-1"
          >
            Stay connected
          </Text>
          <Card variant="default" padding="none">
            <SettingsRow
              label="Apple Health"
              value={healthConnected ? 'Connected' : 'Not connected'}
              isFirst
              onClick={handleHealthConnect}
            />
            <SettingsRow
              label="Export your data"
              onClick={handleExportData}
            />
          </Card>
        </motion.section>

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
              <div className="w-10 h-1 rounded-full bg-accent" />
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
          <Button
            variant="danger"
            fullWidth
            onClick={() => setShowSignOutModal(true)}
          >
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

      {/* Toast */}
      <AnimatePresence>
        {toast.visible && (
          <Toast
            message={toast.message}
            type={toast.type}
            onDismiss={dismissToast}
          />
        )}
      </AnimatePresence>

      {/* Sign Out Modal */}
      <AnimatePresence>
        {showSignOutModal && (
          <Modal
            open={showSignOutModal}
            title="Leaving so soon?"
            message="Your progress is saved and will be here when you return. Take care of yourself out there."
            confirmLabel="Sign Out"
            confirmVariant="danger"
            onConfirm={handleSignOut}
            onCancel={() => setShowSignOutModal(false)}
            loading={signingOut}
          />
        )}
      </AnimatePresence>

      {/* Select Sheet */}
      <AnimatePresence>
        {selectSheet?.open && (
          <SelectSheet
            open={selectSheet.open}
            title={selectSheet.title}
            options={selectSheet.options}
            currentValue={selectSheet.currentValue}
            onSelect={selectSheet.onSelect}
            onClose={() => setSelectSheet(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
