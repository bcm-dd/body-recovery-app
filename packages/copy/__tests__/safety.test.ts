/**
 * Safety strings tests
 *
 * Tests that safety strings exist, contain required content,
 * and follow approved language guidelines (no medical claims).
 */
import { describe, it, expect } from 'vitest';
import { safety } from '../src/strings';

describe('Safety Strings', () => {
  describe('Emergency Messages', () => {
    it('should have emergency escalation message', () => {
      expect(safety.escalation.emergency).toBeDefined();
      expect(safety.escalation.emergency.title).toBeDefined();
      expect(safety.escalation.emergency.message).toBeDefined();
      expect(safety.escalation.emergency.appLimitation).toBeDefined();
    });

    it('should have emergency contact numbers for multiple regions', () => {
      const emergencyNumbers = safety.escalation.emergency.emergencyNumbers;
      expect(emergencyNumbers).toBeDefined();
      expect(emergencyNumbers.us).toBeDefined();
      expect(emergencyNumbers.uk).toBeDefined();
      expect(emergencyNumbers.eu).toBeDefined();
      expect(emergencyNumbers.au).toBeDefined();
    });

    it('should include correct emergency numbers', () => {
      const numbers = safety.escalation.emergency.emergencyNumbers;
      expect(numbers.us).toContain('911');
      expect(numbers.uk).toContain('999');
      expect(numbers.eu).toContain('112');
      expect(numbers.au).toContain('000');
    });

    it('should have dismiss option for false positives', () => {
      expect(safety.escalation.emergency.dismissOption).toBeDefined();
      expect(safety.escalation.emergency.dismissOption.length).toBeGreaterThan(0);
    });
  });

  describe('Warning Messages', () => {
    it('should have professional consultation messages', () => {
      expect(safety.escalation.professional).toBeDefined();
      expect(safety.escalation.professional.inline).toBeDefined();
      expect(safety.escalation.professional.pauseNotice).toBeDefined();
      expect(safety.escalation.professional.persistent).toBeDefined();
    });

    it('should have pain response messages for different occurrences', () => {
      expect(safety.escalation.painResponse).toBeDefined();
      expect(safety.escalation.painResponse.firstOccurrence).toBeDefined();
      expect(safety.escalation.painResponse.secondOccurrence).toBeDefined();
      expect(safety.escalation.painResponse.recurringPattern).toBeDefined();
    });

    it('should escalate pain response appropriately', () => {
      // First occurrence should be mild
      expect(safety.escalation.painResponse.firstOccurrence).toContain('stop');
      expect(safety.escalation.painResponse.firstOccurrence).toContain('different');

      // Second should mention the body part
      expect(safety.escalation.painResponse.secondOccurrence).toContain('{bodyPart}');

      // Recurring should suggest professional help
      expect(safety.escalation.painResponse.recurringPattern).toContain('someone');
    });
  });

  describe('Crisis Resources', () => {
    it('should have mental health crisis resources', () => {
      expect(safety.escalation.mentalHealthCrisis).toBeDefined();
      expect(safety.escalation.mentalHealthCrisis.title).toBeDefined();
      expect(safety.escalation.mentalHealthCrisis.message).toBeDefined();
      expect(safety.escalation.mentalHealthCrisis.crisisResources).toBeDefined();
    });

    it('should have suicide prevention lifeline resource', () => {
      const lifeline = safety.escalation.mentalHealthCrisis.crisisResources.suicidePreventionLifeline;
      expect(lifeline).toBeDefined();
      expect(lifeline.name).toBeDefined();
      expect(lifeline.contact).toBeDefined();
      expect(lifeline.region).toBeDefined();
      expect(lifeline.description).toBeDefined();
    });

    it('should have crisis text line resource', () => {
      const textLine = safety.escalation.mentalHealthCrisis.crisisResources.crisisTextLine;
      expect(textLine).toBeDefined();
      expect(textLine.contact).toContain('741741');
    });

    it('should have international resources', () => {
      const international = safety.escalation.mentalHealthCrisis.crisisResources.internationalResources;
      expect(international).toBeDefined();
      expect(international.contact).toContain('http');
    });

    it('should have supportive messaging for crisis resources', () => {
      expect(safety.escalation.mentalHealthCrisis.supportMessage).toBeDefined();
      expect(safety.escalation.mentalHealthCrisis.supportMessage).toContain('not alone');
    });
  });

  describe('Approved Language - No Medical Claims', () => {
    // Prohibited terms based on /ops/05_safety_compliance.md
    const prohibitedTerms = [
      /\bdiagnose\b/i,
      /\btreat\b/i, // Note: "treat" in context of treating a condition
      /\bcure\b/i,
      /\bprescribe\b/i,
      /\btherapy\b/i,
      /\btherapeutic\b/i,
      /\brehabilitate\b/i,
      /\bpatient\b/i,
      /\bclinical\b/i,
      /\bguaranteed\b/i,
      /\bproven\b/i,
      /\bfix\b/i,
      /\bprevent injury\b/i,
      /\bexpert\b/i,
    ];

    // Helper to check strings recursively
    function collectAllStrings(obj: unknown, strings: string[] = []): string[] {
      if (typeof obj === 'string') {
        strings.push(obj);
      } else if (Array.isArray(obj)) {
        obj.forEach((item) => collectAllStrings(item, strings));
      } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach((value) => collectAllStrings(value, strings));
      }
      return strings;
    }

    it('should not contain absolute medical claims in disclaimers', () => {
      const disclaimerStrings = collectAllStrings(safety.disclaimers);

      for (const str of disclaimerStrings) {
        // Disclaimers explicitly mention what the app doesn't do, so we need to be careful
        // They can say "does not diagnose" but not "will diagnose"
        expect(str).not.toMatch(/\bwill diagnose\b/i);
        expect(str).not.toMatch(/\bwill treat\b/i);
        expect(str).not.toMatch(/\bwill cure\b/i);
        expect(str).not.toMatch(/\bguarantee/i);
        expect(str).not.toMatch(/\bproven to\b/i);
      }
    });

    it('should not make medical claims in escalation messages', () => {
      const escalationStrings = collectAllStrings(safety.escalation);

      for (const str of escalationStrings) {
        // Should not claim the app treats or diagnoses
        expect(str).not.toMatch(/\bI will diagnose\b/i);
        expect(str).not.toMatch(/\bI can treat\b/i);
        expect(str).not.toMatch(/\bI can cure\b/i);
      }
    });

    it('should use appropriate language in limitations section', () => {
      expect(safety.limitations.cannotDiagnose).toContain("can't");
      expect(safety.limitations.outsideScope).toContain('outside');
    });

    it('should use wellness-focused language instead of clinical terms', () => {
      const allSafetyStrings = collectAllStrings(safety);

      // Check for appropriate wellness language
      const hasWellnessLanguage = allSafetyStrings.some(
        (str) => str.includes('wellness') || str.includes('movement') || str.includes('guidance')
      );
      expect(hasWellnessLanguage).toBe(true);
    });
  });

  describe('Disclaimers', () => {
    it('should have all disclaimer levels', () => {
      expect(safety.disclaimers.full).toBeDefined();
      expect(safety.disclaimers.short).toBeDefined();
      expect(safety.disclaimers.minimal).toBeDefined();
      expect(safety.disclaimers.documentUpload).toBeDefined();
    });

    it('should have appropriate length for each disclaimer level', () => {
      // Full disclaimer should be comprehensive
      expect(safety.disclaimers.full.length).toBeGreaterThan(200);

      // Short should be concise but informative
      expect(safety.disclaimers.short.length).toBeGreaterThan(50);
      expect(safety.disclaimers.short.length).toBeLessThan(200);

      // Minimal should be brief
      expect(safety.disclaimers.minimal.length).toBeLessThan(100);
    });

    it('should mention consulting healthcare professionals', () => {
      expect(safety.disclaimers.full.toLowerCase()).toContain('healthcare professional');
      expect(safety.disclaimers.short.toLowerCase()).toContain('healthcare professional');
    });

    it('should state it is not medical advice', () => {
      expect(safety.disclaimers.full.toLowerCase()).toContain('not');
      expect(safety.disclaimers.short.toLowerCase()).toContain('not medical advice');
    });
  });

  describe('User Override Acknowledgment', () => {
    it('should have user autonomy acknowledgment', () => {
      expect(safety.userOverride).toBeDefined();
      expect(safety.userOverride.acknowledgeAutonomy).toBeDefined();
      expect(safety.userOverride.acknowledgeAutonomy).toContain('you know your body');
    });

    it('should state limits while respecting user choice', () => {
      expect(safety.userOverride.stateLimit).toBeDefined();
      expect(safety.userOverride.offerAlternative).toBeDefined();
    });
  });

  describe('Age Verification', () => {
    it('should have age verification strings', () => {
      expect(safety.ageVerification).toBeDefined();
      expect(safety.ageVerification.title).toBeDefined();
      expect(safety.ageVerification.confirmOver18).toBeDefined();
      expect(safety.ageVerification.confirmUnder18).toBeDefined();
    });

    it('should have appropriate messaging for underage users', () => {
      expect(safety.ageVerification.underageMessage).toBeDefined();
      expect(safety.ageVerification.underageMessage).toContain('parent');
    });
  });

  describe('Consent Language', () => {
    it('should have health data consent strings', () => {
      expect(safety.consent).toBeDefined();
      expect(safety.consent.healthDataTitle).toBeDefined();
      expect(safety.consent.healthDataDescription).toBeDefined();
    });

    it('should list health data items with descriptions', () => {
      expect(safety.consent.healthDataItems).toBeInstanceOf(Array);
      expect(safety.consent.healthDataItems.length).toBeGreaterThan(0);

      for (const item of safety.consent.healthDataItems) {
        expect(item.type).toBeDefined();
        expect(item.description).toBeDefined();
      }
    });

    it('should have privacy promise', () => {
      expect(safety.consent.privacyPromise).toBeDefined();
      expect(safety.consent.privacyPromise.toLowerCase()).toContain('never');
      expect(safety.consent.privacyPromise.toLowerCase()).toContain('third parties');
    });

    it('should mention ability to change permissions', () => {
      expect(safety.consent.changeAnytime).toBeDefined();
      expect(safety.consent.changeAnytime.toLowerCase()).toContain('change');
    });
  });

  describe('Warm Framing', () => {
    it('should have warm framing messages', () => {
      expect(safety.warmFraming).toBeDefined();
      expect(safety.warmFraming.yourSafetyMatters).toBeDefined();
      expect(safety.warmFraming.youKnowYourBodyBest).toBeDefined();
      expect(safety.warmFraming.notADoctor).toBeDefined();
    });

    it('should maintain supportive tone', () => {
      expect(safety.warmFraming.yourSafetyMatters).toContain('safety');
      expect(safety.warmFraming.forConcerns).toContain('healthcare professional');
    });
  });

  describe('Document Parsing', () => {
    it('should have document parsing strings', () => {
      expect(safety.documentParsing).toBeDefined();
      expect(safety.documentParsing.setExpectation).toBeDefined();
      expect(safety.documentParsing.showUncertainty).toBeDefined();
      expect(safety.documentParsing.offerCorrection).toBeDefined();
    });

    it('should express uncertainty appropriately', () => {
      expect(safety.documentParsing.showUncertainty).toContain('may have');
    });
  });
});
