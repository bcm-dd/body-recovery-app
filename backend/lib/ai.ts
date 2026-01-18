/**
 * AI Configuration - Movement & Recovery Companion
 *
 * Centralized AI model configuration using Vercel AI Gateway.
 * Supports model switching and fallback strategies.
 */

import { createOpenAI } from '@ai-sdk/openai';

/**
 * Vercel AI Gateway client
 * Routes requests through Vercel's AI Gateway for:
 * - Unified billing
 * - Request caching
 * - Rate limiting
 * - Model fallback
 */
export const gateway = createOpenAI({
  baseURL: 'https://gateway.ai.vercel.app/v1',
  apiKey: process.env.VERCEL_AI_GATEWAY_SECRET,
});

/**
 * Available Claude 4.5 models via Vercel AI Gateway
 */
export const models = {
  // Claude Opus 4.5 - Most capable, best for complex reasoning
  opus: gateway('anthropic/claude-opus-4-5-20250514'),

  // Claude Sonnet 4 - Balanced performance and cost
  sonnet: gateway('anthropic/claude-sonnet-4-20250514'),

  // Claude Haiku - Fast and cost-effective
  haiku: gateway('anthropic/claude-haiku-3-5-20241022'),
} as const;

/**
 * Model selection based on task complexity
 */
export type ModelTier = 'fast' | 'balanced' | 'powerful';

export function getModel(tier: ModelTier = 'balanced') {
  switch (tier) {
    case 'fast':
      return models.haiku;
    case 'powerful':
      return models.opus;
    case 'balanced':
    default:
      return models.sonnet;
  }
}

/**
 * Task-specific model recommendations
 */
export const taskModels = {
  // Quick responses during workout - use fast model
  chat: models.sonnet,

  // Workout generation needs good reasoning
  workoutGeneration: models.sonnet,

  // Document analysis (MRI, clinical notes) - use most capable
  documentAnalysis: models.opus,

  // Simple text extraction
  textExtraction: models.haiku,
} as const;
