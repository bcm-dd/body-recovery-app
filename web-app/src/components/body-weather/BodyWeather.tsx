/**
 * Body Weather - Atmospheric Readiness Experience
 *
 * Full-screen, immersive environment that mirrors how your body feels.
 * The feeling tells you your state before numbers do.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'

interface BodyWeatherProps {
  score: number // 0-100
  recommendation: 'rest' | 'light' | 'moderate' | 'full'
  factors?: {
    sleep: number
    recovery: number
    load: number
    body: number
  }
  onTap?: () => void
}

export function BodyWeather({
  score,
  recommendation,
  factors,
  onTap,
}: BodyWeatherProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Derive atmosphere from recommendation
  const atmosphere = getAtmosphere(recommendation, score)

  const handleTap = () => {
    setShowDetails(!showDetails)
    onTap?.()
  }

  return (
    <motion.div
      className="relative w-full h-full min-h-[400px] overflow-hidden cursor-pointer select-none"
      onClick={handleTap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    >
      {/* Atmospheric Background */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-[2000ms] ease-out',
          atmosphere.gradient
        )}
      />

      {/* Animated Particles/Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {atmosphere.orbs.map((orb, i) => (
          <motion.div
            key={i}
            className={cn(
              'absolute rounded-full blur-3xl opacity-30',
              orb.color
            )}
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
            }}
            animate={{
              x: [0, orb.driftX, 0],
              y: [0, orb.driftY, 0],
              scale: [1, orb.scale, 1],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Breathing Animation Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-transparent to-black/20"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <AnimatePresence mode="wait">
          {!showDetails ? (
            <motion.div
              key="feeling"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Primary Message */}
              <h1 className={cn(
                'text-3xl sm:text-4xl font-semibold leading-tight',
                atmosphere.textColor
              )}>
                {atmosphere.message}
              </h1>

              {/* Body's Voice */}
              <p className={cn(
                'text-lg sm:text-xl opacity-80 max-w-sm mx-auto',
                atmosphere.textColor
              )}>
                {atmosphere.subMessage}
              </p>

              {/* Subtle Hint */}
              <motion.p
                className="text-sm opacity-50 mt-8"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                tap for details
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="space-y-8 w-full max-w-sm"
            >
              {/* Score */}
              <div className="text-center">
                <span className={cn(
                  'text-6xl font-light',
                  atmosphere.textColor
                )}>
                  {score}
                </span>
                <p className="text-sm opacity-60 mt-2">readiness</p>
              </div>

              {/* Factors */}
              {factors && (
                <div className="space-y-4">
                  <FactorBar label="Sleep" value={factors.sleep} atmosphere={atmosphere} />
                  <FactorBar label="Recovery" value={factors.recovery} atmosphere={atmosphere} />
                  <FactorBar label="Load" value={factors.load} atmosphere={atmosphere} />
                  <FactorBar label="Body" value={factors.body} atmosphere={atmosphere} />
                </div>
              )}

              {/* Gentle Guidance */}
              <p className={cn(
                'text-base opacity-70 text-center',
                atmosphere.textColor
              )}>
                {atmosphere.guidance}
              </p>

              <motion.p
                className="text-sm opacity-50"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                tap to return
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function FactorBar({
  label,
  value,
  atmosphere,
}: {
  label: string
  value: number
  atmosphere: Atmosphere
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm opacity-70">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', atmosphere.barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  )
}

interface Atmosphere {
  gradient: string
  textColor: string
  barColor: string
  message: string
  subMessage: string
  guidance: string
  orbs: Orb[]
}

interface Orb {
  color: string
  size: number
  x: string
  y: string
  driftX: number
  driftY: number
  scale: number
  duration: number
}

function getAtmosphere(recommendation: string, _score: number): Atmosphere {
  switch (recommendation) {
    case 'full':
      return {
        gradient: 'bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-950',
        textColor: 'text-emerald-50',
        barColor: 'bg-emerald-400',
        message: "Your body feels ready.",
        subMessage: "Strong recovery, good sleep. You have capacity today.",
        guidance: "Full training is available to you. Listen as you go.",
        orbs: [
          { color: 'bg-emerald-400', size: 300, x: '10%', y: '20%', driftX: 30, driftY: 20, scale: 1.2, duration: 8 },
          { color: 'bg-teal-400', size: 200, x: '70%', y: '60%', driftX: -20, driftY: 30, scale: 1.1, duration: 10 },
          { color: 'bg-cyan-400', size: 150, x: '30%', y: '80%', driftX: 25, driftY: -15, scale: 1.15, duration: 12 },
        ],
      }

    case 'moderate':
      return {
        gradient: 'bg-gradient-to-br from-blue-950 via-indigo-900 to-violet-950',
        textColor: 'text-blue-50',
        barColor: 'bg-blue-400',
        message: "A steady day ahead.",
        subMessage: "Your body is in a balanced place. Not depleted, not fully charged.",
        guidance: "Moderate intensity feels right. Save something for tomorrow.",
        orbs: [
          { color: 'bg-blue-400', size: 250, x: '20%', y: '30%', driftX: 20, driftY: 25, scale: 1.1, duration: 9 },
          { color: 'bg-indigo-400', size: 180, x: '65%', y: '50%', driftX: -25, driftY: 20, scale: 1.15, duration: 11 },
          { color: 'bg-violet-400', size: 120, x: '40%', y: '75%', driftX: 15, driftY: -20, scale: 1.1, duration: 13 },
        ],
      }

    case 'light':
      return {
        gradient: 'bg-gradient-to-br from-amber-950 via-orange-900 to-rose-950',
        textColor: 'text-amber-50',
        barColor: 'bg-amber-400',
        message: "Your body is asking for less.",
        subMessage: "Something's a bit off—maybe sleep, maybe accumulated load. That's okay.",
        guidance: "Light movement only. Mobility, walking, gentle flow.",
        orbs: [
          { color: 'bg-amber-400', size: 220, x: '15%', y: '25%', driftX: 15, driftY: 20, scale: 1.1, duration: 10 },
          { color: 'bg-orange-400', size: 160, x: '60%', y: '55%', driftX: -20, driftY: 15, scale: 1.1, duration: 12 },
          { color: 'bg-rose-400', size: 100, x: '35%', y: '70%', driftX: 18, driftY: -12, scale: 1.05, duration: 14 },
        ],
      }

    case 'rest':
    default:
      return {
        gradient: 'bg-gradient-to-br from-slate-950 via-gray-900 to-zinc-950',
        textColor: 'text-slate-100',
        barColor: 'bg-slate-400',
        message: "Rest is the work today.",
        subMessage: "Your body is depleted. Pushing now would cost more than it gains.",
        guidance: "No training. Sleep, hydrate, let recovery happen.",
        orbs: [
          { color: 'bg-slate-500', size: 200, x: '25%', y: '35%', driftX: 10, driftY: 15, scale: 1.05, duration: 12 },
          { color: 'bg-gray-500', size: 150, x: '55%', y: '45%', driftX: -15, driftY: 10, scale: 1.08, duration: 14 },
          { color: 'bg-zinc-500', size: 100, x: '45%', y: '65%', driftX: 12, driftY: -10, scale: 1.03, duration: 16 },
        ],
      }
  }
}
