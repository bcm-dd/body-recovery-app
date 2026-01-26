/**
 * Common strings used throughout the app
 *
 * These strings follow the safety and compliance guidelines:
 * - No medical terminology (diagnose, treat, cure, prescribe, therapy)
 * - No absolute safety claims (safe, guaranteed, proven)
 * - Warm, supportive tone without over-familiarity
 */

export const common = {
  // App identity
  appName: 'Movement Companion',
  tagline: 'Your body recovery companion',

  // Navigation
  nav: {
    today: 'Today',
    plan: 'Plan',
    body: 'Body',
    progress: 'Progress',
    profile: 'Profile',
  },

  // Actions
  actions: {
    continue: 'Continue',
    cancel: 'Cancel',
    save: 'Save',
    done: 'Done',
    skip: 'Skip',
    next: 'Next',
    back: 'Back',
    close: 'Close',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    retry: 'Try again',
    undo: 'Undo',
    dismiss: 'Dismiss',
    learnMore: 'Learn more',
    getStarted: 'Get started',
    start: 'Start',
    pause: 'Pause',
    resume: 'Resume',
    end: 'End',
  },

  // Time-related
  time: {
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This week',
    lastWeek: 'Last week',
    thisMonth: 'This month',
    seconds: 'seconds',
    minutes: 'minutes',
    hours: 'hours',
    days: 'days',
    weeks: 'weeks',
    months: 'months',
  },

  // Status
  status: {
    loading: 'Loading...',
    saving: 'Saving...',
    syncing: 'Syncing...',
    offline: 'You\'re offline',
    online: 'Back online',
    error: 'Something went wrong',
    success: 'Done',
    noData: 'No data yet',
  },

  // Readiness levels
  readiness: {
    good: 'Good',
    moderate: 'Moderate',
    rest: 'Rest',
    goodDescription: 'Your body seems ready for movement',
    moderateDescription: 'Consider a lighter session today',
    restDescription: 'Rest might be the best option today',
  },

  // Pain levels (using neutral language)
  painLevels: {
    none: 'None',
    mild: 'Mild',
    moderate: 'Moderate',
    severe: 'Significant',
    noneDescription: 'Feeling good',
    mildDescription: 'Minor discomfort',
    moderateDescription: 'Noticeable discomfort',
    severeDescription: 'Considerable discomfort',
  },

  // Body awareness (avoiding clinical terms)
  bodyAwareness: {
    howFeeling: 'How are you feeling?',
    sameAsYesterday: 'Same as yesterday',
    updateBodyMap: 'Update body map',
    tapToUpdate: 'Tap to update',
    anythingChanged: 'Anything changed?',
    bodyCheck: 'Quick body check',
  },

  // Encouragement (warm but not over-enthusiastic)
  encouragement: {
    sessionComplete: 'Session complete',
    goodWork: 'Solid session',
    seeYouTomorrow: 'See you tomorrow',
    readyWhenYouAre: 'Ready when you are',
    keepItUp: 'Keep it up',
    takingCareOfYourself: 'Taking care of yourself',
    oneStepAtATime: 'One step at a time',
    progressTakesTime: 'Progress takes time',
    listeningToYourBody: 'Listening to your body',
  },

  // Empty states
  emptyStates: {
    noSessions: 'No sessions yet',
    noHistory: 'No history yet',
    noExercises: 'No exercises',
    startFirst: 'Start your first session',
    checkBackLater: 'Check back later',
  },

  // Errors
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Check your connection and try again.',
    loadFailed: 'Couldn\'t load that. Try again?',
    saveFailed: 'Couldn\'t save. Try again?',
    sessionFailed: 'Session couldn\'t be loaded.',
  },
} as const;

export type CommonStrings = typeof common;
