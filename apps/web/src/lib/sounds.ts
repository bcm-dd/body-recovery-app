/**
 * Sound Design System
 * Subtle UI sounds using Web Audio API
 * Muted by default - can be enabled in settings
 */

// ============================================
// AUDIO CONTEXT MANAGEMENT
// ============================================

let audioContext: AudioContext | null = null;
let isEnabled = false;
let volume = 0.3; // Default volume (0-1)

/**
 * Get or create the AudioContext
 * Must be called after user interaction to comply with autoplay policies
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    } catch {
      console.warn('Web Audio API not supported');
      return null;
    }
  }

  // Resume if suspended (required after user interaction)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  return audioContext;
}

/**
 * Enable/disable sounds
 */
export function setSoundsEnabled(enabled: boolean): void {
  isEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('sounds-enabled', String(enabled));
  }
}

/**
 * Check if sounds are enabled
 */
export function isSoundsEnabled(): boolean {
  if (typeof window === 'undefined') return false;

  const stored = localStorage.getItem('sounds-enabled');
  if (stored !== null) {
    isEnabled = stored === 'true';
  }
  return isEnabled;
}

/**
 * Set master volume (0-1)
 */
export function setVolume(v: number): void {
  volume = Math.max(0, Math.min(1, v));
  if (typeof window !== 'undefined') {
    localStorage.setItem('sounds-volume', String(volume));
  }
}

/**
 * Get current volume
 */
export function getVolume(): number {
  if (typeof window === 'undefined') return volume;

  const stored = localStorage.getItem('sounds-volume');
  if (stored !== null) {
    volume = parseFloat(stored);
  }
  return volume;
}

// ============================================
// SOUND GENERATORS
// ============================================

interface ToneOptions {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
}

/**
 * Play a simple tone with ADSR envelope
 */
function playTone(options: ToneOptions): void {
  if (!isEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const {
    frequency,
    duration,
    type = 'sine',
    attack = 0.01,
    decay = 0.1,
    sustain = 0.3,
    release = 0.1,
  } = options;

  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);

  // ADSR envelope
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume, now + attack);
  gainNode.gain.linearRampToValueAtTime(volume * sustain, now + attack + decay);
  gainNode.gain.setValueAtTime(volume * sustain, now + duration - release);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + duration);
}

/**
 * Play multiple tones in sequence (chord or melody)
 */
function playSequence(
  tones: Array<{ frequency: number; delay: number; duration: number }>,
  type: OscillatorType = 'sine'
): void {
  if (!isEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  tones.forEach(({ frequency, delay, duration }) => {
    setTimeout(() => {
      playTone({ frequency, duration, type });
    }, delay * 1000);
  });
}

/**
 * Play white noise burst (for clicks)
 */
function playNoiseBurst(duration: number, intensity: number = 0.1): void {
  if (!isEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Generate white noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * intensity;
  }

  const source = ctx.createBufferSource();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = 'highpass';
  filter.frequency.setValueAtTime(2000, ctx.currentTime);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  source.start();
}

// ============================================
// UI SOUND PRESETS
// ============================================

/**
 * Soft click sound - for buttons, selections
 */
export function playClick(): void {
  playTone({
    frequency: 1200,
    duration: 0.08,
    type: 'sine',
    attack: 0.001,
    decay: 0.03,
    sustain: 0.2,
    release: 0.04,
  });
}

/**
 * Toggle/switch sound
 */
export function playToggle(on: boolean): void {
  playTone({
    frequency: on ? 880 : 660,
    duration: 0.1,
    type: 'sine',
    attack: 0.005,
    decay: 0.05,
    sustain: 0.3,
    release: 0.04,
  });
}

/**
 * Success chime - for completed actions
 */
export function playSuccess(): void {
  playSequence([
    { frequency: 523.25, delay: 0, duration: 0.15 },     // C5
    { frequency: 659.25, delay: 0.1, duration: 0.15 },   // E5
    { frequency: 783.99, delay: 0.2, duration: 0.2 },    // G5
  ], 'sine');
}

/**
 * Completion sound - for finishing a task
 */
export function playComplete(): void {
  playSequence([
    { frequency: 440, delay: 0, duration: 0.1 },         // A4
    { frequency: 554.37, delay: 0.08, duration: 0.1 },   // C#5
    { frequency: 659.25, delay: 0.16, duration: 0.15 },  // E5
    { frequency: 880, delay: 0.24, duration: 0.25 },     // A5
  ], 'sine');
}

/**
 * Gentle alert - for notifications
 */
export function playAlert(): void {
  playTone({
    frequency: 587.33,  // D5
    duration: 0.3,
    type: 'sine',
    attack: 0.02,
    decay: 0.1,
    sustain: 0.4,
    release: 0.15,
  });
}

/**
 * Warning sound - for errors or important alerts
 */
export function playWarning(): void {
  playSequence([
    { frequency: 440, delay: 0, duration: 0.15 },
    { frequency: 349.23, delay: 0.15, duration: 0.2 },
  ], 'triangle');
}

/**
 * Error sound - for failures
 */
export function playError(): void {
  playTone({
    frequency: 200,
    duration: 0.2,
    type: 'sawtooth',
    attack: 0.01,
    decay: 0.05,
    sustain: 0.5,
    release: 0.1,
  });
}

/**
 * Pop sound - for items appearing
 */
export function playPop(): void {
  playTone({
    frequency: 1400,
    duration: 0.06,
    type: 'sine',
    attack: 0.001,
    decay: 0.04,
    sustain: 0.1,
    release: 0.02,
  });
}

/**
 * Whoosh sound - for transitions
 */
export function playWhoosh(): void {
  if (!isEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 0.15;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(400, now);
  oscillator.frequency.exponentialRampToValueAtTime(100, now + duration);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, now);
  filter.frequency.exponentialRampToValueAtTime(200, now + duration);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume * 0.3, now + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + duration);
}

/**
 * Tap sound - soft tactile feedback
 */
export function playTap(): void {
  playNoiseBurst(0.03, 0.05);
}

/**
 * Swipe sound
 */
export function playSwipe(): void {
  if (!isEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 0.1;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(800, now);
  oscillator.frequency.linearRampToValueAtTime(400, now + duration);

  gainNode.gain.setValueAtTime(volume * 0.2, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + duration);
}

/**
 * Hover sound - very subtle
 */
export function playHover(): void {
  playTone({
    frequency: 1800,
    duration: 0.03,
    type: 'sine',
    attack: 0.001,
    decay: 0.015,
    sustain: 0.1,
    release: 0.01,
  });
}

/**
 * Focus sound
 */
export function playFocus(): void {
  playTone({
    frequency: 1000,
    duration: 0.05,
    type: 'sine',
    attack: 0.002,
    decay: 0.02,
    sustain: 0.2,
    release: 0.02,
  });
}

/**
 * Slide sound - for sliders and range inputs
 */
export function playSlide(value: number): void {
  // Map value (0-1) to frequency range
  const frequency = 300 + value * 700;
  playTone({
    frequency,
    duration: 0.04,
    type: 'sine',
    attack: 0.001,
    decay: 0.02,
    sustain: 0.2,
    release: 0.01,
  });
}

/**
 * Level up sound - for achievements
 */
export function playLevelUp(): void {
  playSequence([
    { frequency: 523.25, delay: 0, duration: 0.1 },      // C5
    { frequency: 659.25, delay: 0.08, duration: 0.1 },   // E5
    { frequency: 783.99, delay: 0.16, duration: 0.1 },   // G5
    { frequency: 1046.5, delay: 0.24, duration: 0.3 },   // C6
  ], 'sine');
}

// ============================================
// SOUND MANAGER CLASS
// ============================================

export class SoundManager {
  private static instance: SoundManager;

  private constructor() {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const storedEnabled = localStorage.getItem('sounds-enabled');
      if (storedEnabled !== null) {
        isEnabled = storedEnabled === 'true';
      }

      const storedVolume = localStorage.getItem('sounds-volume');
      if (storedVolume !== null) {
        volume = parseFloat(storedVolume);
      }
    }
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  enable(): void {
    setSoundsEnabled(true);
  }

  disable(): void {
    setSoundsEnabled(false);
  }

  toggle(): boolean {
    const newState = !isEnabled;
    setSoundsEnabled(newState);
    return newState;
  }

  isEnabled(): boolean {
    return isSoundsEnabled();
  }

  setVolume(v: number): void {
    setVolume(v);
  }

  getVolume(): number {
    return getVolume();
  }

  // Play methods
  click = playClick;
  toggleSound = playToggle;
  success = playSuccess;
  complete = playComplete;
  alert = playAlert;
  warning = playWarning;
  error = playError;
  pop = playPop;
  whoosh = playWhoosh;
  tap = playTap;
  swipe = playSwipe;
  hover = playHover;
  focus = playFocus;
  slide = playSlide;
  levelUp = playLevelUp;
}

// Export singleton instance
export const sounds = SoundManager.getInstance();
