/**
 * API Client - Tend Web App
 *
 * Handles all communication with the backend API.
 */

const API_BASE = '/api'

interface ApiError {
  code: string
  message: string
  details?: unknown[]
}

interface ApiResponse<T> {
  data?: T
  error?: ApiError
  meta?: Record<string, unknown>
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include session cookies
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          error: errorData.error || {
            code: 'REQUEST_FAILED',
            message: `Request failed with status ${response.status}`,
          },
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  /**
   * Stream AI chat responses via Server-Sent Events
   */
  async streamChat(
    messages: { role: 'user' | 'assistant'; content: string }[],
    context?: Record<string, unknown>,
    onChunk: (chunk: string) => void = () => {},
    onComplete: () => void = () => {}
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ messages, context }),
    })

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      onChunk(chunk)
    }

    onComplete()
  }
}

export const api = new ApiClient(API_BASE)

// Type-safe API methods
export const authApi = {
  getSession: () => api.get<{ user: { id: string; email: string; name?: string } }>('/auth/session'),
  signIn: (email: string, password: string) =>
    api.post('/auth/signin', { email, password }),
  signOut: () => api.post('/auth/signout'),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
}

export const readinessApi = {
  get: (date?: string) =>
    api.get<{
      score: number
      factors: { sleep: number; recovery: number; load: number; body: number }
      recommendation: 'rest' | 'light' | 'moderate' | 'full'
    }>(`/readiness${date ? `?date=${date}` : ''}`),
  submit: (data: Partial<{
    sleepDuration: number
    sleepQuality: number
    hrv: number
    restingHr: number
    bodyScore: number
  }>) => api.post('/readiness', data),
}

export const injuriesApi = {
  list: (status?: 'all' | 'active' | 'recovering' | 'resolved' | 'chronic') =>
    api.get(`/injuries${status ? `?status=${status}` : ''}`),
  create: (injury: {
    bodyRegion: string
    description?: string
    severity: 'mild' | 'moderate' | 'severe'
    constraints?: { type: string; value: string; description?: string }[]
  }) => api.post('/injuries', injury),
  update: (id: string, data: Partial<{ status: string; severity: string }>) =>
    api.patch('/injuries', { id, ...data }),
  delete: (id: string) => api.delete(`/injuries?id=${id}`),
}

export const workoutsApi = {
  list: (limit = 20, offset = 0) =>
    api.get(`/workouts/generate?limit=${limit}&offset=${offset}`),
  generate: (preferences?: { duration?: number; focus?: string; equipment?: string[] }) =>
    api.post('/workouts/generate', { date: new Date().toISOString(), preferences }),
}

export const healthApi = {
  sync: (snapshots: {
    date: string
    sleepDuration?: number
    sleepQuality?: number
    hrv?: number
    restingHr?: number
    steps?: number
    activeCalories?: number
  }[]) => api.post('/health/sync', { snapshots }),
  get: (date: string) => api.get(`/health/sync?date=${date}`),
}

export const statsApi = {
  get: () => api.get('/stats'),
}
