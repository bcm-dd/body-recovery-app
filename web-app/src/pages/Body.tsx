/**
 * Body Page - Living Anatomy Experience
 *
 * An interactive, breathing body map that responds to touch.
 * Pain logging feels like self-compassion, not documentation.
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Text } from '@/components/ui'

// ============================================================================
// Types
// ============================================================================

type BodyRegion =
  | 'head'
  | 'neck'
  | 'shoulder_left'
  | 'shoulder_right'
  | 'upper_back'
  | 'lower_back'
  | 'chest'
  | 'core'
  | 'hip_left'
  | 'hip_right'
  | 'upper_arm_left'
  | 'upper_arm_right'
  | 'elbow_left'
  | 'elbow_right'
  | 'forearm_left'
  | 'forearm_right'
  | 'thigh_left'
  | 'thigh_right'
  | 'knee_left'
  | 'knee_right'
  | 'calf_left'
  | 'calf_right'
  | 'ankle_left'
  | 'ankle_right'
  | 'glute_left'
  | 'glute_right'

type RegionStatus = 'good' | 'trained' | 'healing' | 'attention'

type SensationLevel = 'good' | 'tight' | 'something' | 'pain'

interface RegionData {
  id: BodyRegion
  label: string
  path: string
  center: { x: number; y: number }
}

interface RegionState {
  status: RegionStatus
  lastTrained?: Date
  lastNote?: string
  sensations: Array<{
    level: SensationLevel
    date: Date
    note?: string
  }>
  constraints?: string[]
}

// ============================================================================
// Constants
// ============================================================================

const SENSATION_OPTIONS: Array<{
  level: SensationLevel
  label: string
  color: string
  bgColor: string
}> = [
  { level: 'good', label: 'Feeling good', color: '#30D158', bgColor: 'rgba(48, 209, 88, 0.15)' },
  { level: 'tight', label: 'A little tight', color: '#FFD60A', bgColor: 'rgba(255, 214, 10, 0.15)' },
  { level: 'something', label: "Something's there", color: '#FF9F0A', bgColor: 'rgba(255, 159, 10, 0.15)' },
  { level: 'pain', label: 'Definitely pain', color: '#FF453A', bgColor: 'rgba(255, 69, 58, 0.15)' },
]

const STATUS_COLORS: Record<RegionStatus, { fill: string; glow: string }> = {
  good: { fill: 'rgba(48, 209, 88, 0.3)', glow: 'rgba(48, 209, 88, 0.4)' },
  trained: { fill: 'rgba(255, 159, 10, 0.35)', glow: 'rgba(255, 159, 10, 0.5)' },
  healing: { fill: 'rgba(255, 214, 10, 0.3)', glow: 'rgba(255, 214, 10, 0.4)' },
  attention: { fill: 'rgba(255, 69, 58, 0.35)', glow: 'rgba(255, 69, 58, 0.5)' },
}

const FRONT_REGIONS: RegionData[] = [
  { id: 'head', label: 'Head', path: 'M50,8 C58,8 65,16 65,28 C65,40 58,50 50,50 C42,50 35,40 35,28 C35,16 42,8 50,8', center: { x: 50, y: 28 } },
  { id: 'neck', label: 'Neck', path: 'M44,50 L56,50 L56,62 L44,62 Z', center: { x: 50, y: 56 } },
  { id: 'shoulder_left', label: 'Left Shoulder', path: 'M28,62 Q32,58 44,62 L44,76 Q36,78 28,72 Z', center: { x: 36, y: 68 } },
  { id: 'shoulder_right', label: 'Right Shoulder', path: 'M56,62 Q68,58 72,62 L72,72 Q64,78 56,76 Z', center: { x: 64, y: 68 } },
  { id: 'chest', label: 'Chest', path: 'M36,76 L64,76 Q66,85 64,98 L36,98 Q34,85 36,76', center: { x: 50, y: 87 } },
  { id: 'core', label: 'Core', path: 'M38,98 L62,98 L60,132 L40,132 Z', center: { x: 50, y: 115 } },
  { id: 'upper_arm_left', label: 'Left Upper Arm', path: 'M20,72 L28,72 L30,102 L22,102 Z', center: { x: 25, y: 87 } },
  { id: 'upper_arm_right', label: 'Right Upper Arm', path: 'M72,72 L80,72 L78,102 L70,102 Z', center: { x: 75, y: 87 } },
  { id: 'elbow_left', label: 'Left Elbow', path: 'M20,102 L30,102 L29,114 L19,114 Z', center: { x: 24, y: 108 } },
  { id: 'elbow_right', label: 'Right Elbow', path: 'M70,102 L80,102 L81,114 L71,114 Z', center: { x: 76, y: 108 } },
  { id: 'forearm_left', label: 'Left Forearm', path: 'M17,114 L29,114 L26,148 L14,148 Z', center: { x: 21, y: 131 } },
  { id: 'forearm_right', label: 'Right Forearm', path: 'M71,114 L83,114 L86,148 L74,148 Z', center: { x: 79, y: 131 } },
  { id: 'hip_left', label: 'Left Hip', path: 'M38,132 L50,132 L50,148 Q42,150 36,148 Z', center: { x: 43, y: 140 } },
  { id: 'hip_right', label: 'Right Hip', path: 'M50,132 L62,132 Q64,148 58,148 L50,148 Z', center: { x: 57, y: 140 } },
  { id: 'thigh_left', label: 'Left Thigh', path: 'M34,148 L50,148 L48,200 L30,200 Z', center: { x: 40, y: 174 } },
  { id: 'thigh_right', label: 'Right Thigh', path: 'M50,148 L66,148 L70,200 L52,200 Z', center: { x: 60, y: 174 } },
  { id: 'knee_left', label: 'Left Knee', path: 'M30,200 L48,200 L47,218 L31,218 Z', center: { x: 39, y: 209 } },
  { id: 'knee_right', label: 'Right Knee', path: 'M52,200 L70,200 L69,218 L53,218 Z', center: { x: 61, y: 209 } },
  { id: 'calf_left', label: 'Left Calf', path: 'M31,218 L47,218 L44,268 L34,268 Z', center: { x: 39, y: 243 } },
  { id: 'calf_right', label: 'Right Calf', path: 'M53,218 L69,218 L66,268 L56,268 Z', center: { x: 61, y: 243 } },
  { id: 'ankle_left', label: 'Left Ankle', path: 'M34,268 L44,268 L43,280 L35,280 Z', center: { x: 39, y: 274 } },
  { id: 'ankle_right', label: 'Right Ankle', path: 'M56,268 L66,268 L65,280 L57,280 Z', center: { x: 61, y: 274 } },
]

const BACK_REGIONS: RegionData[] = [
  { id: 'upper_back', label: 'Upper Back', path: 'M36,76 L64,76 L64,98 L36,98 Z', center: { x: 50, y: 87 } },
  { id: 'lower_back', label: 'Lower Back', path: 'M38,98 L62,98 L60,128 L40,128 Z', center: { x: 50, y: 113 } },
  { id: 'glute_left', label: 'Left Glute', path: 'M38,128 L50,128 L50,152 Q42,154 36,150 Z', center: { x: 43, y: 140 } },
  { id: 'glute_right', label: 'Right Glute', path: 'M50,128 L62,128 Q64,150 58,150 L50,152 Z', center: { x: 57, y: 140 } },
]

// Demo state for regions
const DEMO_REGION_STATES: Partial<Record<BodyRegion, RegionState>> = {
  shoulder_right: {
    status: 'healing',
    lastNote: 'Rotator cuff strain - getting better',
    sensations: [
      { level: 'tight', date: new Date(Date.now() - 86400000), note: 'Morning stiffness' },
      { level: 'something', date: new Date(Date.now() - 172800000) },
    ],
    constraints: ['Avoid overhead pressing', 'Keep load under 60%'],
  },
  chest: {
    status: 'trained',
    lastTrained: new Date(Date.now() - 86400000),
    sensations: [{ level: 'good', date: new Date() }],
  },
  thigh_left: {
    status: 'trained',
    lastTrained: new Date(Date.now() - 172800000),
    sensations: [{ level: 'tight', date: new Date(), note: 'DOMS from squats' }],
  },
  knee_left: {
    status: 'attention',
    lastNote: 'Sharp pain during deep squat',
    sensations: [
      { level: 'pain', date: new Date(), note: 'Gets worse with stairs' },
    ],
    constraints: ['Limit squat depth', 'No jumping'],
  },
  lower_back: {
    status: 'good',
    sensations: [{ level: 'good', date: new Date() }],
  },
}

// ============================================================================
// Breathing Body Silhouette
// ============================================================================

interface BreathingBodyProps {
  view: 'front' | 'back'
  regionStates: Partial<Record<BodyRegion, RegionState>>
  selectedRegion: BodyRegion | null
  onRegionSelect: (region: BodyRegion) => void
}

function BreathingBody({ view, regionStates, selectedRegion, onRegionSelect }: BreathingBodyProps) {
  const regions = view === 'front' ? FRONT_REGIONS : [...FRONT_REGIONS.filter(r => !['chest', 'core', 'hip_left', 'hip_right'].includes(r.id)), ...BACK_REGIONS]

  return (
    <div className="relative flex items-center justify-center">
      {/* Ambient glow behind the body */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(100, 210, 255, 0.15) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.svg
        viewBox="0 0 100 290"
        className="w-full max-w-[280px] h-auto"
        animate={{
          scale: [1, 1.008, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <defs>
          {/* Glow filters for different states */}
          <filter id="glow-trained" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-healing" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-attention" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-selected" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Render each body region */}
        {regions.map((region) => {
          const state = regionStates[region.id]
          const isSelected = selectedRegion === region.id
          const status = state?.status || 'good'
          const colors = STATUS_COLORS[status]

          return (
            <BodyRegionPath
              key={region.id}
              region={region}
              status={status}
              colors={colors}
              isSelected={isSelected}
              onClick={() => onRegionSelect(region.id)}
            />
          )
        })}
      </motion.svg>
    </div>
  )
}

// ============================================================================
// Individual Body Region with Animations
// ============================================================================

interface BodyRegionPathProps {
  region: RegionData
  status: RegionStatus
  colors: { fill: string; glow: string }
  isSelected: boolean
  onClick: () => void
}

function BodyRegionPath({ region, status, colors, isSelected, onClick }: BodyRegionPathProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getFilter = () => {
    if (isSelected) return 'url(#glow-selected)'
    if (status === 'trained') return 'url(#glow-trained)'
    if (status === 'healing') return 'url(#glow-healing)'
    if (status === 'attention') return 'url(#glow-attention)'
    return undefined
  }

  const getFillColor = () => {
    if (isSelected) return 'rgba(10, 132, 255, 0.5)'
    return colors.fill
  }

  const getStrokeColor = () => {
    if (isSelected) return '#0A84FF'
    if (isHovered) return 'rgba(255, 255, 255, 0.4)'
    return 'rgba(255, 255, 255, 0.08)'
  }

  // Pulse animation for attention status
  const shouldPulse = status === 'attention' || status === 'trained'

  return (
    <motion.g
      style={{ cursor: 'pointer' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
    >
      {/* Glow layer (behind the main path) */}
      {(status !== 'good' || isSelected) && (
        <motion.path
          d={region.path}
          fill={isSelected ? 'rgba(10, 132, 255, 0.3)' : colors.glow}
          filter={getFilter()}
          animate={shouldPulse && !isSelected ? {
            opacity: [0.4, 0.7, 0.4],
          } : undefined}
          transition={{
            duration: status === 'attention' ? 2 : 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Main region path */}
      <motion.path
        d={region.path}
        fill={getFillColor()}
        stroke={getStrokeColor()}
        strokeWidth={isSelected ? 1.5 : 0.5}
        initial={false}
        animate={{
          fill: getFillColor(),
          stroke: getStrokeColor(),
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Hover/tap expansion effect */}
      <AnimatePresence>
        {(isHovered || isSelected) && (
          <motion.path
            d={region.path}
            fill="transparent"
            stroke={isSelected ? '#0A84FF' : 'rgba(255, 255, 255, 0.2)'}
            strokeWidth={2}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1.02 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{ transformOrigin: `${region.center.x}px ${region.center.y}px` }}
          />
        )}
      </AnimatePresence>
    </motion.g>
  )
}

// ============================================================================
// Region Detail Panel
// ============================================================================

interface RegionDetailProps {
  region: RegionData
  state: RegionState | undefined
  onClose: () => void
  onLogSensation: (level: SensationLevel, note?: string) => void
}

function RegionDetail({ region, state, onClose, onLogSensation }: RegionDetailProps) {
  const [selectedSensation, setSelectedSensation] = useState<SensationLevel | null>(null)
  const [note, setNote] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)

  const handleSensationSelect = (level: SensationLevel) => {
    setSelectedSensation(level)
    if (level === 'pain' || level === 'something') {
      setShowNoteInput(true)
    } else {
      onLogSensation(level)
      setSelectedSensation(null)
    }
  }

  const handleSubmitNote = () => {
    if (selectedSensation) {
      onLogSensation(selectedSensation, note || undefined)
      setNote('')
      setShowNoteInput(false)
      setSelectedSensation(null)
    }
  }

  // Build pain trend visualization (simple dots)
  const recentSensations = state?.sensations.slice(0, 5) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <Card variant="elevated" padding="lg" className="relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-surface transition-colors"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Region header */}
        <div className="mb-6">
          <Text variant="title3" className="mb-1">{region.label}</Text>
          {state?.status && state.status !== 'good' && (
            <div className="flex items-center gap-2 mt-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[state.status].glow }}
              />
              <Text variant="subhead" color="secondary">
                {state.status === 'trained' && 'Recently trained'}
                {state.status === 'healing' && 'Healing'}
                {state.status === 'attention' && 'Needs attention'}
              </Text>
            </div>
          )}
        </div>

        {/* Pain trend - simple visual */}
        {recentSensations.length > 0 && (
          <div className="mb-6">
            <Text variant="footnote" color="tertiary" className="mb-3">Recent history</Text>
            <div className="flex items-center gap-2">
              {recentSensations.map((sensation, i) => {
                const option = SENSATION_OPTIONS.find(o => o.level === sensation.level)
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: option?.color }}
                      title={sensation.note}
                    />
                    <Text variant="caption2" color="tertiary">
                      {i === 0 ? 'Now' : `${i}d`}
                    </Text>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent note */}
        {state?.lastNote && (
          <div className="mb-6 p-3 rounded-lg bg-surface">
            <Text variant="footnote" color="tertiary" className="mb-1">Latest note</Text>
            <Text variant="subhead">{state.lastNote}</Text>
          </div>
        )}

        {/* Active constraints */}
        {state?.constraints && state.constraints.length > 0 && (
          <div className="mb-6">
            <Text variant="footnote" color="tertiary" className="mb-2">Active constraints</Text>
            <div className="flex flex-wrap gap-2">
              {state.constraints.map((constraint, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-footnote bg-warning/10 text-warning"
                >
                  {constraint}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sensation logging prompt */}
        <div className="pt-4 border-t border-border">
          <Text variant="headline" className="mb-4">
            Anything asking for attention?
          </Text>

          {!showNoteInput ? (
            <div className="grid grid-cols-2 gap-2">
              {SENSATION_OPTIONS.map((option) => (
                <motion.button
                  key={option.level}
                  onClick={() => handleSensationSelect(option.level)}
                  className="p-3 rounded-lg text-left transition-colors"
                  style={{
                    backgroundColor: selectedSensation === option.level ? option.bgColor : 'transparent',
                    border: `1px solid ${selectedSensation === option.level ? option.color : 'var(--color-border, #2A2A2E)'}`,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                    <Text variant="subhead" style={{ color: option.color }}>
                      {option.label}
                    </Text>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: SENSATION_OPTIONS.find(o => o.level === selectedSensation)?.color }}
                />
                <Text variant="subhead">
                  {SENSATION_OPTIONS.find(o => o.level === selectedSensation)?.label}
                </Text>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tell me more... (optional)"
                className="w-full p-3 rounded-lg bg-surface border border-border text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowNoteInput(false)
                    setSelectedSensation(null)
                    setNote('')
                  }}
                  className="flex-1 py-2.5 rounded-lg border border-border text-text-secondary hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitNote}
                  className="flex-1 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-colors"
                >
                  Log it
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================================================
// View Toggle
// ============================================================================

interface ViewToggleProps {
  view: 'front' | 'back'
  onViewChange: (view: 'front' | 'back') => void
}

function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center justify-center gap-1 p-1 rounded-lg bg-surface">
      {(['front', 'back'] as const).map((v) => (
        <button
          key={v}
          onClick={() => onViewChange(v)}
          className={`px-4 py-2 rounded-md text-subhead font-medium transition-all ${
            view === v
              ? 'bg-elevated text-text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </button>
      ))}
    </div>
  )
}

// ============================================================================
// Status Legend
// ============================================================================

function StatusLegend() {
  const statuses: Array<{ status: RegionStatus; label: string }> = [
    { status: 'trained', label: 'Recent training' },
    { status: 'healing', label: 'Healing' },
    { status: 'attention', label: 'Needs attention' },
  ]

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 px-4">
      {statuses.map(({ status, label }) => (
        <div key={status} className="flex items-center gap-2">
          <motion.span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: STATUS_COLORS[status].glow }}
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: status === 'attention' ? 2 : 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <Text variant="caption1" color="tertiary">{label}</Text>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// Main Page Component
// ============================================================================

export function BodyPage() {
  const [view, setView] = useState<'front' | 'back'>('front')
  const [selectedRegion, setSelectedRegion] = useState<BodyRegion | null>(null)
  const [regionStates, setRegionStates] = useState(DEMO_REGION_STATES)

  const selectedRegionData = useMemo(() => {
    if (!selectedRegion) return null
    return [...FRONT_REGIONS, ...BACK_REGIONS].find(r => r.id === selectedRegion)
  }, [selectedRegion])

  const handleLogSensation = (level: SensationLevel, note?: string) => {
    if (!selectedRegion) return

    setRegionStates(prev => {
      const current = prev[selectedRegion] || { status: 'good', sensations: [] }
      const newSensation = { level, date: new Date(), note }

      // Update status based on sensation
      let newStatus: RegionStatus = 'good'
      if (level === 'pain') newStatus = 'attention'
      else if (level === 'something') newStatus = 'attention'
      else if (level === 'tight') newStatus = 'healing'

      return {
        ...prev,
        [selectedRegion]: {
          ...current,
          status: newStatus,
          sensations: [newSensation, ...current.sensations].slice(0, 10),
          lastNote: note || current.lastNote,
        },
      }
    })

    // Keep the panel open for a moment to show feedback
    setTimeout(() => setSelectedRegion(null), 800)
  }

  return (
    <div className="min-h-full pb-24">
      {/* Header */}
      <header className="px-4 pt-8 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <Text variant="title1" className="mb-1">Your Body</Text>
          <Text variant="subhead" color="secondary">
            Tap anywhere to check in
          </Text>
        </motion.div>
      </header>

      {/* View Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center mb-6"
      >
        <ViewToggle view={view} onViewChange={setView} />
      </motion.div>

      {/* Body Map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="px-8 mb-6"
      >
        <BreathingBody
          view={view}
          regionStates={regionStates}
          selectedRegion={selectedRegion}
          onRegionSelect={setSelectedRegion}
        />
      </motion.div>

      {/* Status Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mb-6"
      >
        <StatusLegend />
      </motion.div>

      {/* Region Detail Panel */}
      <AnimatePresence>
        {selectedRegion && selectedRegionData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-void/80 backdrop-blur-sm px-4 pb-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedRegion(null)
            }}
          >
            <div className="w-full max-w-lg">
              <RegionDetail
                region={selectedRegionData}
                state={regionStates[selectedRegion]}
                onClose={() => setSelectedRegion(null)}
                onLogSensation={handleLogSensation}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick prompt when nothing selected */}
      <AnimatePresence>
        {!selectedRegion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.3 }}
            className="px-4"
          >
            <Card variant="glass" padding="md" className="text-center">
              <Text variant="subhead" color="secondary">
                Touch the body to explore or log how you feel
              </Text>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
