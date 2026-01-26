/**
 * Workout and exercise session strings
 *
 * Tone: Supportive, instructional, not pushy
 * Focus on guidance rather than commands
 */

export const workout = {
  // Session overview
  session: {
    todaysSession: 'Today\'s session',
    upcomingSession: 'Upcoming session',
    sessionReady: 'Your session is ready',
    duration: '{duration} min',
    exercises: '{count} exercises',
    focus: 'Focus: {areas}',
    startSession: 'Start session',
    modifySession: 'Modify',
    preview: 'Preview',
    skipToday: 'Skip today',
    sessionInProgress: 'Session in progress',
    resume: 'Resume',
    restDay: 'Rest day',
    restDayMessage: 'Your body could use some rest today',
  },

  // During workout
  execution: {
    exerciseOf: 'Exercise {current} of {total}',
    setsRemaining: '{count} sets remaining',
    repsRemaining: '{count} reps',
    holdFor: 'Hold for {seconds}s',
    restFor: 'Rest: {seconds}s',
    completeSet: 'Complete set',
    skipSet: 'Skip set',
    nextExercise: 'Next exercise',
    previousExercise: 'Previous',
    tapToPlay: 'Tap to play demo',
    showCues: 'Show cues',
    hideCues: 'Hide cues',
  },

  // Rest timer
  rest: {
    restTime: 'Rest time',
    skipRest: 'Skip rest',
    addTime: '+30s',
    almostDone: 'Almost done',
    getReady: 'Get ready',
  },

  // Quick menu
  quickMenu: {
    pauseWorkout: 'Pause workout',
    resumeWorkout: 'Resume workout',
    swapExercise: 'Swap this exercise',
    adjustReps: 'Adjust reps/duration',
    endWorkoutEarly: 'End workout early',
    voiceHelp: 'Voice commands help',
  },

  // Exercise swap
  swap: {
    title: 'Swap: {exercise}',
    subtitle: 'Alternatives for you',
    similarOption: 'Similar approach',
    gentlerOption: 'Gentler option',
    differentApproach: 'Different approach',
    searchAll: 'Search all exercises',
    reasonLabel: '{reason}',
    confirmSwap: 'Swap to this',
    undoSwap: 'Undo',
    swapComplete: 'Exercise swapped',
  },

  // Pain logging during workout
  painDuringWorkout: {
    somethingFeelOff: 'Something feel off?',
    tapAffectedArea: 'Tap the affected area',
    howSevere: 'How does it feel?',
    logAndContinue: 'Log and continue',
    swapExercise: 'Swap exercise',
    noted: 'Noted. I\'ll adjust the plan.',
    stoppingSuggestion: 'That area is talking to you. Let\'s skip anything that involves {bodyPart} today.',
  },

  // Session summary
  summary: {
    sessionComplete: 'Session complete',
    duration: '{duration}',
    exercisesCompleted: '{completed}/{total} exercises',
    setsCompleted: '{completed} sets',
    howDoYouFeel: 'How do you feel now?',
    feelingBetter: 'Better',
    feelingSame: 'Same',
    feelingWorse: 'Worse',
    updateBodyMap: 'Any areas to update?',
    seeYouTomorrow: 'See you tomorrow',
    greatWork: 'Solid session',
    keepItUp: 'Keep it up',
  },

  // Voice commands
  voiceCommands: {
    title: 'Voice commands',
    available: [
      { command: '"Done"', description: 'Complete current set' },
      { command: '"Skip"', description: 'Skip current exercise' },
      { command: '"Next"', description: 'Move to next exercise' },
      { command: '"Harder"', description: 'Log this as challenging' },
      { command: '"Easier"', description: 'Log this as easy' },
    ],
  },

  // Exercise details
  exercise: {
    targetMuscles: 'Target areas',
    equipment: 'Equipment',
    noEquipment: 'No equipment needed',
    cues: 'Movement cues',
    commonMistakes: 'Things to watch for',
    modifications: 'Modifications',
    history: 'Your history',
    firstTime: 'First time doing this exercise',
  },

  // Prescriptions
  prescription: {
    sets: '{count} sets',
    reps: '{count} reps',
    weight: '{weight} kg',
    duration: '{duration}s',
    hold: '{seconds}s hold',
    rest: '{seconds}s rest',
    eachSide: 'each side',
  },

  // Skipping/ending
  endEarly: {
    title: 'End workout early?',
    message: 'You\'ve completed {completed} of {total} exercises. Your progress will be saved.',
    confirm: 'End workout',
    cancel: 'Keep going',
    reason: 'What\'s the reason?',
    reasons: [
      { id: 'time', label: 'Out of time' },
      { id: 'discomfort', label: 'Feeling discomfort' },
      { id: 'fatigue', label: 'Too tired' },
      { id: 'other', label: 'Other' },
    ],
  },
} as const;

export type WorkoutStrings = typeof workout;
