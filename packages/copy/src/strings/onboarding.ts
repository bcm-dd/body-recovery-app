/**
 * Onboarding flow strings
 *
 * Goal: Get user to first session in under 4 minutes
 * Tone: Warm, supportive, not clinical
 */

export const onboarding = {
  // Welcome screen
  welcome: {
    title: 'Your body recovery companion',
    subtitle: 'Personalized movement guidance to help you feel better',
    cta: 'Get started',
  },

  // Health permission screen
  healthPermission: {
    title: 'Personalize your experience',
    description:
      'I\'ll use your sleep and heart rate data to know when to suggest lighter or more active sessions.',
    benefits: [
      'Sleep data helps me understand your recovery',
      'Heart rate shows your baseline fitness',
      'Activity data reveals your movement patterns',
    ],
    privacyNote:
      'Your health data stays on your device and is never shared with third parties.',
    primaryCta: 'Connect health data',
    secondaryCta: 'Maybe later',
    skipNote:
      'No problem. I\'ll check in with you more often to understand how you\'re feeling.',
  },

  // Focus selection screen
  focusSelection: {
    title: 'What brings you here?',
    options: [
      {
        id: 'recovery',
        title: 'Recovering from discomfort',
        description: 'Getting back to feeling like yourself',
      },
      {
        id: 'chronic',
        title: 'Managing ongoing issues',
        description: 'Day-to-day support for persistent concerns',
      },
      {
        id: 'prevention',
        title: 'Staying mobile and preventing issues',
        description: 'Maintaining flexibility and movement quality',
      },
    ],
  },

  // Body map screen
  bodyMap: {
    title: 'Tap anywhere that needs attention',
    subtitle: 'This helps me personalize your sessions',
    instruction: 'Tap on the body to mark areas',
    severityPrompt: 'How does this area feel?',
    addMoreAreas: 'Add more areas or continue',
    noAreasNote: 'You can always update this later',
    continueButton: 'Continue',
    continueWithAreas: 'Continue with {count} areas marked',
  },

  // Experience level screen
  experienceLevel: {
    title: 'Your movement experience',
    subtitle: 'This helps me suggest appropriate exercises',
    options: [
      {
        id: 'beginner',
        title: 'Just starting out',
        description: 'New to structured movement or getting back into it',
      },
      {
        id: 'intermediate',
        title: 'Some experience',
        description: 'Familiar with basic exercises and movement',
      },
      {
        id: 'advanced',
        title: 'Experienced mover',
        description: 'Comfortable with various exercises and progressions',
      },
    ],
  },

  // First session preview
  firstSession: {
    title: 'Here\'s your first session',
    duration: '{duration} min',
    exerciseCount: '{count} exercises',
    focusLabel: 'Focus: {focus}',
    intentionallyShort:
      'This first session is intentionally brief to help you get started.',
    startNow: 'Start now',
    saveForLater: 'Save for later',
    whenWorks: 'When works best?',
  },

  // Account creation
  account: {
    title: 'Save your progress',
    subtitle: 'Create an account to keep your data safe',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    createAccount: 'Create account',
    continueWithApple: 'Continue with Apple',
    continueWithGoogle: 'Continue with Google',
    skipNote: 'You can use the app for 3 sessions before creating an account',
    skipButton: 'Skip for now',
    privacyNote: 'By creating an account, you agree to our Terms and Privacy Policy',
  },

  // Completion
  complete: {
    title: 'You\'re all set',
    subtitle: 'Let\'s get started on your first session',
    cta: 'Begin session',
  },
} as const;

export type OnboardingStrings = typeof onboarding;
