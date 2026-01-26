/**
 * Safety disclaimers and warnings
 *
 * Based on /ops/05_safety_compliance.md
 * These strings MUST follow the approved terminology guidelines.
 *
 * NEVER USE: diagnose, treat, cure, prescribe, therapy, therapeutic,
 * rehabilitate, patient, clinical, medical advice, safe (absolute),
 * guaranteed, proven, fix, prevent injury, expert
 */

export const safety = {
  // Primary disclaimer (full version)
  disclaimers: {
    full: `This app provides general wellness and movement guidance. It is not a medical device and does not diagnose, treat, or cure any medical condition. The suggestions here are educational and for general fitness purposes only.

Always consult a qualified healthcare professional before starting any exercise program, especially if you have injuries, chronic conditions, or health concerns. If you experience pain, dizziness, or discomfort during exercise, stop immediately and seek medical attention if needed.

Your health data helps personalize your experience but is not used for medical diagnosis. The app's suggestions are based on general fitness principles and your stated preferences, not clinical assessment.`,

    short:
      'This is general wellness guidance, not medical advice. Listen to your body and consult a healthcare professional for medical concerns.',

    minimal: 'Not medical advice. When in doubt, check with your doctor.',

    documentUpload: `I'll extract information from your documents to help customize your experience. I'm not a healthcare provider and may misinterpret medical terminology. Always verify extracted information and follow your healthcare provider's actual recommendations.`,
  },

  // Escalation messages
  escalation: {
    // Category 1 - Emergency (blocking)
    emergency: {
      title: 'This needs immediate attention',
      message:
        'What you\'re describing sounds like it may need urgent medical care. Please contact emergency services or go to your nearest emergency room.',
      emergencyNumbers: {
        us: 'Emergency: Call 911 (US)',
        uk: 'Emergency: Call 999 (UK)',
        eu: 'Emergency: Call 112 (EU)',
        au: 'Emergency: Call 000 (AU)',
      },
      appLimitation: 'This app cannot help with medical emergencies.',
      dismissOption: 'Tap here if you\'re safe and this was a misunderstanding',
    },

    // Mental health crisis resources
    mentalHealthCrisis: {
      title: 'Mental health support is available',
      message:
        'If you\'re experiencing a mental health crisis, please reach out to one of these resources for immediate support.',
      crisisResources: {
        suicidePreventionLifeline: {
          name: 'National Suicide Prevention Lifeline',
          contact: '988',
          region: 'US',
          description: 'Call or text 988 for 24/7 support',
        },
        crisisTextLine: {
          name: 'Crisis Text Line',
          contact: 'Text HOME to 741741',
          region: 'US',
          description: 'Free 24/7 text-based crisis support',
        },
        internationalResources: {
          name: 'International Association for Suicide Prevention',
          contact: 'https://www.iasp.info/resources/Crisis_Centres/',
          region: 'International',
          description: 'Find crisis centers worldwide',
        },
      },
      supportMessage:
        'You are not alone. These services are free, confidential, and available 24/7.',
    },

    // Category 2 - Professional consultation
    professional: {
      inline:
        'That\'s outside what I can help with safely. {symptom} can have various causes that need professional assessment. I\'d recommend checking in with a doctor or physio who can examine you properly.',

      pauseNotice:
        'In the meantime, I\'ve paused suggestions for {bodyPart}. Let me know when you have guidance from your healthcare provider and we can adjust your plan.',

      persistent:
        'I\'ve noticed this keeps coming up. It might be worth having a professional take a look at your {bodyPart}.',
    },

    // Pain during exercise
    painResponse: {
      firstOccurrence:
        'Let\'s stop that exercise. How about trying something different?',

      secondOccurrence:
        'That area is talking to you. Let\'s skip anything that involves {bodyPart} today.',

      recurringPattern:
        'This keeps coming up. It might be worth having someone take a look at your {bodyPart}. I\'ll avoid loading it until you say it\'s better.',
    },
  },

  // Limitation acknowledgments
  limitations: {
    cannotDiagnose:
      'I can\'t say what\'s causing that - only a healthcare professional can properly assess it.',

    cannotRecommendTreatment:
      'What I can do is adjust your movement to avoid aggravating it.',

    offerAlternative: 'Want me to modify your plan while you get it checked out?',

    uncertainResponse:
      'I\'m not certain about that - what does your physio or doctor recommend?',

    outsideScope: 'That\'s outside what I can help with safely.',
  },

  // User override acknowledgment
  userOverride: {
    acknowledgeAutonomy: 'Ultimately, you know your body.',

    stateLimit:
      'I\'ll note that you want to continue, but I can\'t guide you through exercises that might aggravate what you\'ve described.',

    offerAlternative: 'I can suggest gentler alternatives for today if you\'d like.',
  },

  // Document parsing
  documentParsing: {
    setExpectation: 'I\'ve pulled out the key details from this document.',

    showUncertainty:
      'Please check that this matches what your healthcare provider explained - I may have misread some terms.',

    offerCorrection: 'Tap anything that needs correcting.',
  },

  // Warm framing for safety messages
  warmFraming: {
    yourSafetyMatters: 'Your safety matters to us',
    youKnowYourBodyBest: 'You know your body best',
    heresWhenToSeekHelp: 'Here\'s when to seek help',
    notADoctor: 'I can help you move well, but I\'m not a doctor.',
    forConcerns:
      'For anything that concerns you, a healthcare professional is your best resource.',
  },

  // Age verification
  ageVerification: {
    title: 'Quick check: Are you 18 or older?',
    description:
      'This app is designed for adults. If you\'re under 18, please use this app with a parent or guardian\'s involvement.',
    confirmOver18: 'I\'m 18 or older',
    confirmUnder18: 'I\'m under 18',
    underageMessage:
      'Thanks for your interest! This app is currently designed for adults. Please check with a parent or guardian about appropriate fitness apps for you.',
  },

  // Consent language
  consent: {
    healthDataTitle: 'Health data access',
    healthDataDescription:
      'To give you the best guidance, I\'d like to access some of your health data. Here\'s what I\'ll use and why:',

    healthDataItems: [
      { type: 'sleep', description: 'To know when you\'re rested or need recovery' },
      { type: 'heartRate', description: 'To understand your baseline fitness' },
      { type: 'activity', description: 'To see your movement patterns' },
    ],

    privacyPromise: 'I\'ll never share this data with third parties.',
    changeAnytime: 'You can change these permissions anytime in Settings.',
  },
} as const;

export type SafetyStrings = typeof safety;
