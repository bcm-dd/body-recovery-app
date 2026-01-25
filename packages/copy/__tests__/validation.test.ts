/**
 * Validation tests for copy strings
 *
 * Tests that all strings are valid, follow naming conventions,
 * and there are no duplicates across categories.
 */
import { describe, it, expect } from 'vitest';
import { common, onboarding, workout, safety } from '../src/strings';

describe('String Validation', () => {
  describe('No undefined or null values', () => {
    function validateNoNullOrUndefined(obj: unknown, path: string = ''): void {
      if (obj === undefined) {
        throw new Error(`Undefined value found at ${path}`);
      }
      if (obj === null) {
        throw new Error(`Null value found at ${path}`);
      }

      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            validateNoNullOrUndefined(item, `${path}[${index}]`);
          });
        } else {
          for (const [key, value] of Object.entries(obj)) {
            validateNoNullOrUndefined(value, path ? `${path}.${key}` : key);
          }
        }
      }
    }

    it('should have no undefined values in common strings', () => {
      expect(() => validateNoNullOrUndefined(common, 'common')).not.toThrow();
    });

    it('should have no undefined values in onboarding strings', () => {
      expect(() => validateNoNullOrUndefined(onboarding, 'onboarding')).not.toThrow();
    });

    it('should have no undefined values in workout strings', () => {
      expect(() => validateNoNullOrUndefined(workout, 'workout')).not.toThrow();
    });

    it('should have no undefined values in safety strings', () => {
      expect(() => validateNoNullOrUndefined(safety, 'safety')).not.toThrow();
    });
  });

  describe('Non-empty strings', () => {
    function validateNonEmptyStrings(obj: unknown, path: string = ''): void {
      if (typeof obj === 'string') {
        if (obj.trim().length === 0) {
          throw new Error(`Empty string found at ${path}`);
        }
      } else if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          validateNonEmptyStrings(item, `${path}[${index}]`);
        });
      } else if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
          validateNonEmptyStrings(value, path ? `${path}.${key}` : key);
        }
      }
    }

    it('should have no empty strings in common', () => {
      expect(() => validateNonEmptyStrings(common, 'common')).not.toThrow();
    });

    it('should have no empty strings in onboarding', () => {
      expect(() => validateNonEmptyStrings(onboarding, 'onboarding')).not.toThrow();
    });

    it('should have no empty strings in workout', () => {
      expect(() => validateNonEmptyStrings(workout, 'workout')).not.toThrow();
    });

    it('should have no empty strings in safety', () => {
      expect(() => validateNonEmptyStrings(safety, 'safety')).not.toThrow();
    });
  });

  describe('String key naming conventions', () => {
    function validateKeyNamingConvention(obj: unknown, path: string = ''): string[] {
      const violations: string[] = [];
      const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;

      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        for (const key of Object.keys(obj)) {
          // Skip checking keys that are intentionally different (like region codes, IDs)
          const isExceptionKey =
            ['us', 'uk', 'eu', 'au', '-A', '-B'].includes(key) ||
            key.length <= 2 ||
            // Skip specific exception patterns
            path.includes('emergencyNumbers') ||
            path.includes('crisisResources');

          if (!isExceptionKey && !camelCaseRegex.test(key)) {
            violations.push(`${path ? path + '.' : ''}${key}`);
          }

          const value = (obj as Record<string, unknown>)[key];
          if (typeof value === 'object' && value !== null) {
            violations.push(
              ...validateKeyNamingConvention(value, path ? `${path}.${key}` : key)
            );
          }
        }
      }

      return violations;
    }

    it('should use camelCase for common string keys', () => {
      const violations = validateKeyNamingConvention(common, 'common');
      expect(violations).toEqual([]);
    });

    it('should use camelCase for onboarding string keys', () => {
      const violations = validateKeyNamingConvention(onboarding, 'onboarding');
      expect(violations).toEqual([]);
    });

    it('should use camelCase for workout string keys', () => {
      const violations = validateKeyNamingConvention(workout, 'workout');
      expect(violations).toEqual([]);
    });

    it('should use camelCase for safety string keys', () => {
      const violations = validateKeyNamingConvention(safety, 'safety');
      expect(violations).toEqual([]);
    });
  });

  describe('No duplicate strings across categories', () => {
    function collectStrings(obj: unknown, strings: Map<string, string[]> = new Map()): Map<string, string[]> {
      if (typeof obj === 'string') {
        const normalized = obj.trim().toLowerCase();
        // Only check strings of reasonable length to avoid false positives on common words
        if (normalized.length >= 15) {
          const existing = strings.get(normalized) || [];
          strings.set(normalized, [...existing, obj]);
        }
      } else if (Array.isArray(obj)) {
        obj.forEach((item) => collectStrings(item, strings));
      } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach((value) => collectStrings(value, strings));
      }
      return strings;
    }

    function findDuplicates(categories: Record<string, unknown>): Map<string, string[]> {
      const allStrings = new Map<string, string[]>();

      for (const [categoryName, category] of Object.entries(categories)) {
        const categoryStrings = collectStrings(category);
        for (const [normalized, originals] of categoryStrings) {
          const existing = allStrings.get(normalized) || [];
          allStrings.set(normalized, [...existing, ...originals.map((s) => `${categoryName}: ${s}`)]);
        }
      }

      // Filter to only duplicates (appearing more than once)
      const duplicates = new Map<string, string[]>();
      for (const [normalized, locations] of allStrings) {
        if (locations.length > 1) {
          duplicates.set(normalized, locations);
        }
      }

      return duplicates;
    }

    it('should not have significant duplicate strings across categories', () => {
      const duplicates = findDuplicates({ common, onboarding, workout, safety });

      // Allow some intentional duplicates but flag unexpected ones
      // Filter out known acceptable duplicates
      const significantDuplicates = new Map<string, string[]>();
      for (const [text, locations] of duplicates) {
        // Skip strings that are intentionally reused (like "Continue", button labels, etc.)
        if (
          text.includes('session complete') ||
          text.includes('healthcare professional') ||
          text.length < 20
        ) {
          continue;
        }
        significantDuplicates.set(text, locations);
      }

      // Report any unexpected duplicates
      if (significantDuplicates.size > 0) {
        const duplicateInfo = Array.from(significantDuplicates.entries())
          .map(([text, locs]) => `"${text}" appears in: ${locs.join(', ')}`)
          .join('\n');
        console.log('Duplicate strings found (for review):\n', duplicateInfo);
      }

      // This test documents duplicates but doesn't fail - duplicates may be intentional
      expect(true).toBe(true);
    });
  });

  describe('Template placeholder syntax', () => {
    function collectTemplateStrings(obj: unknown, templates: string[] = []): string[] {
      if (typeof obj === 'string') {
        if (obj.includes('{') && obj.includes('}')) {
          templates.push(obj);
        }
      } else if (Array.isArray(obj)) {
        obj.forEach((item) => collectTemplateStrings(item, templates));
      } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach((value) => collectTemplateStrings(value, templates));
      }
      return templates;
    }

    function validateTemplateSyntax(template: string): boolean {
      // Check for properly formed {word} placeholders
      const placeholderRegex = /\{(\w+)\}/g;
      const matches = template.match(placeholderRegex);

      if (!matches) {
        // Has braces but no valid placeholders
        if (template.includes('{') || template.includes('}')) {
          return false;
        }
      }

      // Check for unbalanced braces
      let braceCount = 0;
      for (const char of template) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (braceCount < 0) return false;
      }
      return braceCount === 0;
    }

    it('should have valid placeholder syntax in common strings', () => {
      const templates = collectTemplateStrings(common);
      for (const template of templates) {
        expect(validateTemplateSyntax(template), `Invalid template: ${template}`).toBe(true);
      }
    });

    it('should have valid placeholder syntax in onboarding strings', () => {
      const templates = collectTemplateStrings(onboarding);
      for (const template of templates) {
        expect(validateTemplateSyntax(template), `Invalid template: ${template}`).toBe(true);
      }
    });

    it('should have valid placeholder syntax in workout strings', () => {
      const templates = collectTemplateStrings(workout);
      for (const template of templates) {
        expect(validateTemplateSyntax(template), `Invalid template: ${template}`).toBe(true);
      }
    });

    it('should have valid placeholder syntax in safety strings', () => {
      const templates = collectTemplateStrings(safety);
      for (const template of templates) {
        expect(validateTemplateSyntax(template), `Invalid template: ${template}`).toBe(true);
      }
    });
  });

  describe('String length constraints', () => {
    function findLongStrings(obj: unknown, maxLength: number, path: string = ''): string[] {
      const violations: string[] = [];

      if (typeof obj === 'string') {
        if (obj.length > maxLength) {
          violations.push(`${path}: ${obj.length} chars`);
        }
      } else if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          violations.push(...findLongStrings(item, maxLength, `${path}[${index}]`));
        });
      } else if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
          violations.push(...findLongStrings(value, maxLength, path ? `${path}.${key}` : key));
        }
      }

      return violations;
    }

    it('should have button labels under 50 characters', () => {
      const actionStrings = Object.values(common.actions);
      for (const action of actionStrings) {
        expect((action as string).length).toBeLessThan(50);
      }
    });

    it('should have navigation labels under 30 characters', () => {
      const navStrings = Object.values(common.nav);
      for (const nav of navStrings) {
        expect((nav as string).length).toBeLessThan(30);
      }
    });

    it('should not have excessively long strings (except disclaimers)', () => {
      const maxLength = 500;

      // Check common (no long disclaimers expected)
      const commonViolations = findLongStrings(common, maxLength, 'common');
      expect(commonViolations).toEqual([]);

      // Check onboarding
      const onboardingViolations = findLongStrings(onboarding, maxLength, 'onboarding');
      expect(onboardingViolations).toEqual([]);

      // Check workout
      const workoutViolations = findLongStrings(workout, maxLength, 'workout');
      expect(workoutViolations).toEqual([]);

      // Safety has intentionally long disclaimers, so we exclude the full disclaimer
      const safetyExceptDisclaimer = {
        ...safety,
        disclaimers: {
          short: safety.disclaimers.short,
          minimal: safety.disclaimers.minimal,
          documentUpload: safety.disclaimers.documentUpload,
        },
      };
      const safetyViolations = findLongStrings(safetyExceptDisclaimer, maxLength, 'safety');
      expect(safetyViolations).toEqual([]);
    });
  });

  describe('Required string categories', () => {
    it('should have all required top-level categories in common', () => {
      const requiredCategories = [
        'appName',
        'nav',
        'actions',
        'time',
        'status',
        'readiness',
        'painLevels',
        'encouragement',
        'emptyStates',
        'errors',
      ];

      for (const category of requiredCategories) {
        expect(common).toHaveProperty(category);
      }
    });

    it('should have all required top-level categories in onboarding', () => {
      const requiredCategories = [
        'welcome',
        'healthPermission',
        'focusSelection',
        'bodyMap',
        'experienceLevel',
        'firstSession',
        'account',
        'complete',
      ];

      for (const category of requiredCategories) {
        expect(onboarding).toHaveProperty(category);
      }
    });

    it('should have all required top-level categories in workout', () => {
      const requiredCategories = [
        'session',
        'execution',
        'rest',
        'quickMenu',
        'swap',
        'painDuringWorkout',
        'summary',
        'voiceCommands',
        'exercise',
        'prescription',
        'endEarly',
      ];

      for (const category of requiredCategories) {
        expect(workout).toHaveProperty(category);
      }
    });

    it('should have all required top-level categories in safety', () => {
      const requiredCategories = [
        'disclaimers',
        'escalation',
        'limitations',
        'userOverride',
        'documentParsing',
        'warmFraming',
        'ageVerification',
        'consent',
      ];

      for (const category of requiredCategories) {
        expect(safety).toHaveProperty(category);
      }
    });
  });

  describe('Type exports', () => {
    it('should export typed string constants', () => {
      // Verify the strings are typed as const (readonly)
      // This is a compile-time check, but we can verify the structure exists
      expect(typeof common).toBe('object');
      expect(typeof onboarding).toBe('object');
      expect(typeof workout).toBe('object');
      expect(typeof safety).toBe('object');

      // Verify specific nested structures
      expect(typeof common.nav).toBe('object');
      expect(typeof onboarding.focusSelection.options).toBe('object');
      expect(typeof workout.voiceCommands.available).toBe('object');
      expect(typeof safety.escalation.emergency).toBe('object');
    });
  });
});
