import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Readiness, ReadinessFactors, ReadinessRecommendation } from '@/types'

interface ReadinessState {
  currentReadiness: Readiness | null
  isLoading: boolean
  error: string | null

  // Actions
  setReadiness: (readiness: Readiness) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  calculateReadiness: (factors: Partial<ReadinessFactors>, activeInjuries?: number) => void
  reset: () => void
}

const getRecommendation = (score: number): ReadinessRecommendation => {
  if (score >= 75) return 'full'
  if (score >= 50) return 'moderate'
  if (score >= 25) return 'light'
  return 'rest'
}

const getReasoning = (factors: ReadinessFactors, recommendation: ReadinessRecommendation): string => {
  const lowFactors: string[] = []

  if (factors.sleep < 50) lowFactors.push('sleep quality')
  if (factors.recovery < 50) lowFactors.push('recovery')
  if (factors.load > 70) lowFactors.push('training load is high')
  if (factors.body < 50) lowFactors.push('body status')

  if (lowFactors.length === 0) {
    return recommendation === 'full'
      ? "All systems are go. You're well-recovered and ready for a full session."
      : 'Overall looking good with minor areas to watch.'
  }

  return `Consider taking it easier today: ${lowFactors.join(', ')}.`
}

export const useReadinessStore = create<ReadinessState>()(
  persist(
    (set) => ({
      currentReadiness: null,
      isLoading: false,
      error: null,

      setReadiness: (readiness) => set({ currentReadiness: readiness }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      calculateReadiness: (partialFactors, activeInjuries = 0) => {
        // Fill in defaults for missing factors
        const factors: ReadinessFactors = {
          sleep: partialFactors.sleep ?? 70,
          recovery: partialFactors.recovery ?? 70,
          load: partialFactors.load ?? 50,
          body: partialFactors.body ?? (100 - activeInjuries * 15),
        }

        // Calculate weighted score
        const weights = { sleep: 0.3, recovery: 0.3, load: 0.25, body: 0.15 }
        const score = Math.round(
          factors.sleep * weights.sleep +
            factors.recovery * weights.recovery +
            (100 - factors.load) * weights.load + // Invert load (high load = lower score)
            factors.body * weights.body
        )

        const recommendation = getRecommendation(score)
        const reasoning = getReasoning(factors, recommendation)

        set({
          currentReadiness: {
            score,
            factors,
            recommendation,
            reasoning,
            updatedAt: new Date().toISOString(),
          },
        })
      },

      reset: () =>
        set({
          currentReadiness: null,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'readiness-store',
      partialize: (state) => ({ currentReadiness: state.currentReadiness }),
    }
  )
)
