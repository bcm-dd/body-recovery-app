/**
 * Comprehensive tests for string exports
 *
 * Tests that all string exports exist, are non-empty, and follow expected patterns.
 */
import { describe, it, expect } from 'vitest';
import { common, onboarding, workout, safety } from '../src/strings';
import { interpolate } from '../src/types';

describe('String Exports', () => {
  describe('common strings', () => {
    it('should export common strings object', () => {
      expect(common).toBeDefined();
      expect(typeof common).toBe('object');
    });

    it('should have app identity strings', () => {
      expect(common.appName).toBeDefined();
      expect(common.appName.length).toBeGreaterThan(0);
      expect(common.tagline).toBeDefined();
      expect(common.tagline.length).toBeGreaterThan(0);
    });

    it('should have navigation strings', () => {
      expect(common.nav).toBeDefined();
      expect(common.nav.today).toBe('Today');
      expect(common.nav.plan).toBe('Plan');
      expect(common.nav.body).toBe('Body');
      expect(common.nav.progress).toBe('Progress');
      expect(common.nav.profile).toBe('Profile');
    });

    it('should have all action strings', () => {
      const requiredActions = [
        'continue',
        'cancel',
        'save',
        'done',
        'skip',
        'next',
        'back',
        'close',
        'edit',
        'delete',
        'confirm',
        'retry',
        'undo',
        'dismiss',
        'learnMore',
        'getStarted',
        'start',
        'pause',
        'resume',
        'end',
      ];

      for (const action of requiredActions) {
        expect(common.actions[action as keyof typeof common.actions]).toBeDefined();
        expect((common.actions[action as keyof typeof common.actions] as string).length).toBeGreaterThan(0);
      }
    });

    it('should have time-related strings', () => {
      expect(common.time).toBeDefined();
      expect(common.time.today).toBe('Today');
      expect(common.time.yesterday).toBe('Yesterday');
      expect(common.time.tomorrow).toBe('Tomorrow');
    });

    it('should have status strings', () => {
      expect(common.status).toBeDefined();
      expect(common.status.loading).toBeDefined();
      expect(common.status.error).toBeDefined();
      expect(common.status.success).toBeDefined();
    });

    it('should have readiness level strings', () => {
      expect(common.readiness).toBeDefined();
      expect(common.readiness.good).toBe('Good');
      expect(common.readiness.moderate).toBe('Moderate');
      expect(common.readiness.rest).toBe('Rest');
      expect(common.readiness.goodDescription).toBeDefined();
      expect(common.readiness.moderateDescription).toBeDefined();
      expect(common.readiness.restDescription).toBeDefined();
    });

    it('should have pain level strings', () => {
      expect(common.painLevels).toBeDefined();
      expect(common.painLevels.none).toBe('None');
      expect(common.painLevels.mild).toBe('Mild');
      expect(common.painLevels.moderate).toBe('Moderate');
      expect(common.painLevels.severe).toBe('Significant');
    });

    it('should have body awareness strings', () => {
      expect(common.bodyAwareness).toBeDefined();
      expect(common.bodyAwareness.howFeeling).toBeDefined();
      expect(common.bodyAwareness.bodyCheck).toBeDefined();
    });

    it('should have encouragement strings', () => {
      expect(common.encouragement).toBeDefined();
      expect(common.encouragement.sessionComplete).toBeDefined();
      expect(common.encouragement.keepItUp).toBeDefined();
    });

    it('should have empty state strings', () => {
      expect(common.emptyStates).toBeDefined();
      expect(common.emptyStates.noSessions).toBeDefined();
      expect(common.emptyStates.noHistory).toBeDefined();
    });

    it('should have error strings', () => {
      expect(common.errors).toBeDefined();
      expect(common.errors.generic).toBeDefined();
      expect(common.errors.network).toBeDefined();
    });
  });

  describe('onboarding strings', () => {
    it('should export onboarding strings object', () => {
      expect(onboarding).toBeDefined();
      expect(typeof onboarding).toBe('object');
    });

    it('should have welcome screen strings', () => {
      expect(onboarding.welcome).toBeDefined();
      expect(onboarding.welcome.title).toBeDefined();
      expect(onboarding.welcome.subtitle).toBeDefined();
      expect(onboarding.welcome.cta).toBeDefined();
    });

    it('should have health permission strings', () => {
      expect(onboarding.healthPermission).toBeDefined();
      expect(onboarding.healthPermission.title).toBeDefined();
      expect(onboarding.healthPermission.description).toBeDefined();
      expect(onboarding.healthPermission.benefits).toBeInstanceOf(Array);
      expect(onboarding.healthPermission.benefits.length).toBeGreaterThan(0);
    });

    it('should have focus selection options', () => {
      expect(onboarding.focusSelection).toBeDefined();
      expect(onboarding.focusSelection.title).toBeDefined();
      expect(onboarding.focusSelection.options).toBeInstanceOf(Array);
      expect(onboarding.focusSelection.options.length).toBe(3);

      // Verify each option has required fields
      for (const option of onboarding.focusSelection.options) {
        expect(option.id).toBeDefined();
        expect(option.title).toBeDefined();
        expect(option.description).toBeDefined();
      }
    });

    it('should have body map strings', () => {
      expect(onboarding.bodyMap).toBeDefined();
      expect(onboarding.bodyMap.title).toBeDefined();
      expect(onboarding.bodyMap.subtitle).toBeDefined();
      expect(onboarding.bodyMap.instruction).toBeDefined();
    });

    it('should have experience level options', () => {
      expect(onboarding.experienceLevel).toBeDefined();
      expect(onboarding.experienceLevel.options).toBeInstanceOf(Array);
      expect(onboarding.experienceLevel.options.length).toBe(3);

      const expectedIds = ['beginner', 'intermediate', 'advanced'];
      const actualIds = onboarding.experienceLevel.options.map((o) => o.id);
      expect(actualIds).toEqual(expectedIds);
    });

    it('should have first session strings', () => {
      expect(onboarding.firstSession).toBeDefined();
      expect(onboarding.firstSession.title).toBeDefined();
      expect(onboarding.firstSession.startNow).toBeDefined();
      expect(onboarding.firstSession.saveForLater).toBeDefined();
    });

    it('should have account creation strings', () => {
      expect(onboarding.account).toBeDefined();
      expect(onboarding.account.title).toBeDefined();
      expect(onboarding.account.createAccount).toBeDefined();
      expect(onboarding.account.continueWithApple).toBeDefined();
      expect(onboarding.account.continueWithGoogle).toBeDefined();
    });

    it('should have completion screen strings', () => {
      expect(onboarding.complete).toBeDefined();
      expect(onboarding.complete.title).toBeDefined();
      expect(onboarding.complete.cta).toBeDefined();
    });
  });

  describe('workout strings', () => {
    it('should export workout strings object', () => {
      expect(workout).toBeDefined();
      expect(typeof workout).toBe('object');
    });

    it('should have session overview strings', () => {
      expect(workout.session).toBeDefined();
      expect(workout.session.todaysSession).toBeDefined();
      expect(workout.session.startSession).toBeDefined();
      expect(workout.session.restDay).toBeDefined();
    });

    it('should have execution strings', () => {
      expect(workout.execution).toBeDefined();
      expect(workout.execution.exerciseOf).toBeDefined();
      expect(workout.execution.completeSet).toBeDefined();
      expect(workout.execution.nextExercise).toBeDefined();
    });

    it('should have rest timer strings', () => {
      expect(workout.rest).toBeDefined();
      expect(workout.rest.restTime).toBeDefined();
      expect(workout.rest.skipRest).toBeDefined();
    });

    it('should have quick menu strings', () => {
      expect(workout.quickMenu).toBeDefined();
      expect(workout.quickMenu.pauseWorkout).toBeDefined();
      expect(workout.quickMenu.swapExercise).toBeDefined();
    });

    it('should have swap exercise strings', () => {
      expect(workout.swap).toBeDefined();
      expect(workout.swap.similarOption).toBeDefined();
      expect(workout.swap.gentlerOption).toBeDefined();
      expect(workout.swap.confirmSwap).toBeDefined();
    });

    it('should have pain during workout strings', () => {
      expect(workout.painDuringWorkout).toBeDefined();
      expect(workout.painDuringWorkout.somethingFeelOff).toBeDefined();
      expect(workout.painDuringWorkout.logAndContinue).toBeDefined();
    });

    it('should have session summary strings', () => {
      expect(workout.summary).toBeDefined();
      expect(workout.summary.sessionComplete).toBeDefined();
      expect(workout.summary.howDoYouFeel).toBeDefined();
      expect(workout.summary.feelingBetter).toBeDefined();
      expect(workout.summary.feelingSame).toBeDefined();
      expect(workout.summary.feelingWorse).toBeDefined();
    });

    it('should have voice command definitions', () => {
      expect(workout.voiceCommands).toBeDefined();
      expect(workout.voiceCommands.available).toBeInstanceOf(Array);
      expect(workout.voiceCommands.available.length).toBeGreaterThan(0);

      for (const cmd of workout.voiceCommands.available) {
        expect(cmd.command).toBeDefined();
        expect(cmd.description).toBeDefined();
      }
    });

    it('should have exercise detail strings', () => {
      expect(workout.exercise).toBeDefined();
      expect(workout.exercise.targetMuscles).toBeDefined();
      expect(workout.exercise.noEquipment).toBeDefined();
    });

    it('should have prescription format strings', () => {
      expect(workout.prescription).toBeDefined();
      expect(workout.prescription.sets).toBeDefined();
      expect(workout.prescription.reps).toBeDefined();
    });

    it('should have end early dialog strings', () => {
      expect(workout.endEarly).toBeDefined();
      expect(workout.endEarly.title).toBeDefined();
      expect(workout.endEarly.reasons).toBeInstanceOf(Array);
      expect(workout.endEarly.reasons.length).toBeGreaterThan(0);
    });
  });

  describe('safety strings', () => {
    it('should export safety strings object', () => {
      expect(safety).toBeDefined();
      expect(typeof safety).toBe('object');
    });

    it('should have disclaimer strings in multiple lengths', () => {
      expect(safety.disclaimers).toBeDefined();
      expect(safety.disclaimers.full).toBeDefined();
      expect(safety.disclaimers.short).toBeDefined();
      expect(safety.disclaimers.minimal).toBeDefined();
      expect(safety.disclaimers.documentUpload).toBeDefined();

      // Full should be longer than short, short longer than minimal
      expect(safety.disclaimers.full.length).toBeGreaterThan(safety.disclaimers.short.length);
      expect(safety.disclaimers.short.length).toBeGreaterThan(safety.disclaimers.minimal.length);
    });

    it('should have escalation messages', () => {
      expect(safety.escalation).toBeDefined();
      expect(safety.escalation.emergency).toBeDefined();
      expect(safety.escalation.professional).toBeDefined();
      expect(safety.escalation.painResponse).toBeDefined();
    });

    it('should have limitation acknowledgments', () => {
      expect(safety.limitations).toBeDefined();
      expect(safety.limitations.cannotDiagnose).toBeDefined();
      expect(safety.limitations.outsideScope).toBeDefined();
    });
  });
});

describe('String Categories Coverage', () => {
  it('should have strings for all major app areas', () => {
    const categories = { common, onboarding, workout, safety };

    for (const [name, category] of Object.entries(categories)) {
      expect(category).toBeDefined();
      expect(Object.keys(category).length).toBeGreaterThan(0);
    }
  });
});

describe('No Placeholder Text', () => {
  const placeholderPatterns = [/TODO/i, /FIXME/i, /XXX/i, /HACK/i, /PLACEHOLDER/i, /LOREM/i, /IPSUM/i];

  function checkForPlaceholders(obj: unknown, path: string = ''): void {
    if (typeof obj === 'string') {
      for (const pattern of placeholderPatterns) {
        expect(obj, `Placeholder found at ${path}`).not.toMatch(pattern);
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => checkForPlaceholders(item, `${path}[${index}]`));
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        checkForPlaceholders(value, path ? `${path}.${key}` : key);
      }
    }
  }

  it('should not contain placeholder text in common strings', () => {
    checkForPlaceholders(common, 'common');
  });

  it('should not contain placeholder text in onboarding strings', () => {
    checkForPlaceholders(onboarding, 'onboarding');
  });

  it('should not contain placeholder text in workout strings', () => {
    checkForPlaceholders(workout, 'workout');
  });

  it('should not contain placeholder text in safety strings', () => {
    checkForPlaceholders(safety, 'safety');
  });
});

describe('Interpolation Function', () => {
  it('should interpolate single parameter', () => {
    const template = 'Hello {name}!';
    const result = interpolate(template, { name: 'World' });
    expect(result).toBe('Hello World!');
  });

  it('should interpolate multiple parameters', () => {
    const template = '{count} exercises in {duration} min';
    const result = interpolate(template, { count: 5, duration: 20 });
    expect(result).toBe('5 exercises in 20 min');
  });

  it('should handle numeric values', () => {
    const template = workout.session.duration;
    const result = interpolate(template, { duration: 15 });
    expect(result).toBe('15 min');
  });

  it('should preserve unmatched placeholders', () => {
    const template = 'Hello {name}, you have {count} messages';
    const result = interpolate(template, { name: 'User' } as { name: string; count: number });
    expect(result).toBe('Hello User, you have {count} messages');
  });

  it('should work with workout strings', () => {
    expect(interpolate(workout.execution.exerciseOf, { current: 3, total: 10 })).toBe('Exercise 3 of 10');
    expect(interpolate(workout.execution.holdFor, { seconds: 30 })).toBe('Hold for 30s');
    expect(interpolate(workout.prescription.sets, { count: 3 })).toBe('3 sets');
  });

  it('should work with onboarding strings', () => {
    expect(interpolate(onboarding.bodyMap.continueWithAreas, { count: 2 })).toBe(
      'Continue with 2 areas marked'
    );
    expect(interpolate(onboarding.firstSession.duration, { duration: 15 })).toBe('15 min');
    expect(interpolate(onboarding.firstSession.exerciseCount, { count: 5 })).toBe('5 exercises');
  });
});
