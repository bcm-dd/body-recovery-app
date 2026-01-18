/**
 * API Configuration - Movement & Recovery Companion
 */

// Your Vercel backend URL
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3000'  // Local development
  : 'https://body-recovery-prmy4ng6o-bcm-group.vercel.app'; // Production

export const API_ENDPOINTS = {
  healthSync: `${API_BASE_URL}/api/health/sync`,
  workoutGenerate: `${API_BASE_URL}/api/workouts/generate`,
  aiChat: `${API_BASE_URL}/api/ai/chat`,
} as const;
