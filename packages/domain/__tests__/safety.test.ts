/**
 * Safety Engine Tests
 */

import { SafetyEngine, safetyKeywords } from '../src/engines/safety';
import type { SafetyCheckInput, SafetyCheckResult } from '../src/types/safety';
import type { BodyRegionStatus } from '../src/types/body';

describe('SafetyEngine', () => {
  let engine: SafetyEngine;

  beforeEach(() => {
    engine = new SafetyEngine();
  });

  describe('Category 1 - Emergency Keywords (Critical)', () => {
    test('chest pain triggers emergency action', () => {
      const result = engine.checkInput({
        userMessage: 'I have chest pain during exercise',
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('emergency');
      expect(result.triggers.some(t => t.id === 'chest_pain')).toBe(true);
      expect(result.userMessage).toContain('Chest pain');
    });

    test('chest hurts triggers emergency action', () => {
      const result = engine.checkInput({
        userMessage: 'My chest hurts when I breathe',
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('emergency');
    });

    test("can't breathe triggers emergency action", () => {
      const result = engine.checkInput({
        userMessage: "I can't breathe properly after running",
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('emergency');
      expect(result.triggers.some(t => t.id === 'breathing_difficulty')).toBe(true);
    });

    test('breathing difficulty triggers emergency action', () => {
      const result = engine.checkInput({
        userMessage: 'Having breathing difficulty since yesterday',
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('emergency');
    });

    test('chest pain in body status triggers emergency', () => {
      const result = engine.checkInput({
        bodyStatus: [{
          region: 'chest',
          sensation: 'pain_sharp',
          level: 6,
          timestamp: new Date(),
        }],
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('emergency');
    });
  });

  describe('Category 2 - Professional Referral Keywords (High)', () => {
    test('numbness triggers seek_medical action', () => {
      const result = engine.checkInput({
        userMessage: 'My arm feels numb after sleeping',
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('seek_medical');
      expect(result.triggers.some(t => t.id === 'numbness')).toBe(true);
    });

    test('tingling triggers seek_medical action', () => {
      const result = engine.checkInput({
        userMessage: 'I feel tingling in my fingers',
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('seek_medical');
      expect(result.triggers.some(t => t.id === 'tingling_radiating')).toBe(true);
    });

    test('pins and needles triggers seek_medical action', () => {
      const result = engine.checkInput({
        userMessage: 'Having pins and needles in my leg',
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('seek_medical');
    });

    test('shooting pain triggers seek_medical action', () => {
      const result = engine.checkInput({
        userMessage: 'Pain shooting down my leg from my back',
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('seek_medical');
    });

    test('dizzy triggers seek_medical action', () => {
      const result = engine.checkInput({
        userMessage: 'I feel dizzy during squats',
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('seek_medical');
      expect(result.triggers.some(t => t.id === 'dizziness_fainting')).toBe(true);
    });

    test('extreme pain triggers block_activity action', () => {
      const result = engine.checkInput({
        userMessage: 'I heard a pop and now have extreme pain',
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('block_activity');
      expect(result.triggers.some(t => t.id === 'severe_sudden_pain')).toBe(true);
    });

    test('numbness in body status triggers seek_medical', () => {
      const result = engine.checkInput({
        bodyStatus: [{
          region: 'hand_left',
          sensation: 'numbness',
          level: 4,
          timestamp: new Date(),
        }],
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('seek_medical');
    });

    test('tingling in body status triggers seek_medical', () => {
      const result = engine.checkInput({
        bodyStatus: [{
          region: 'foot_right',
          sensation: 'tingling',
          level: 3,
          timestamp: new Date(),
        }],
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('seek_medical');
    });

    test('severe pain (level 8+) in body status triggers block_activity', () => {
      const result = engine.checkInput({
        bodyStatus: [{
          region: 'lower_back',
          sensation: 'pain_sharp',
          level: 9,
          timestamp: new Date(),
        }],
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('block_activity');
    });
  });

  describe('Medium Severity Keywords', () => {
    test('joint locking triggers require_acknowledgment', () => {
      const result = engine.checkInput({
        userMessage: 'My knee keeps locking up',
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('require_acknowledgment');
      expect(result.triggers.some(t => t.id === 'joint_locking')).toBe(true);
    });

    test('gave way triggers block_activity', () => {
      const result = engine.checkInput({
        userMessage: 'My knee gave way during walking',
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('block_activity');
      expect(result.triggers.some(t => t.id === 'giving_way')).toBe(true);
    });

    test('instability in body status triggers block_activity', () => {
      const result = engine.checkInput({
        bodyStatus: [{
          region: 'knee_left',
          sensation: 'instability',
          level: 5,
          timestamp: new Date(),
        }],
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('block_activity');
    });

    test('significant swelling triggers require_acknowledgment', () => {
      const result = engine.checkInput({
        userMessage: 'My ankle is very swollen',
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('require_acknowledgment');
      expect(result.triggers.some(t => t.id === 'significant_swelling')).toBe(true);
    });
  });

  describe('Low Severity Keywords', () => {
    test('overexertion pressure triggers warn', () => {
      const result = engine.checkInput({
        userMessage: "I feel guilty if I can't skip a workout",
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('warn');
      expect(result.triggers.some(t => t.id === 'overexertion_pressure')).toBe(true);
    });

    test('have to exercise triggers warn', () => {
      const result = engine.checkInput({
        userMessage: 'I feel like I have to exercise even when tired',
      });

      expect(result.safe).toBe(false);
      expect(result.action).toBe('warn');
    });
  });

  describe('Safe Input', () => {
    test('normal message returns safe result', () => {
      const result = engine.checkInput({
        userMessage: 'My workout went well today',
      });

      expect(result.safe).toBe(true);
      expect(result.action).toBe('continue');
      expect(result.triggers.length).toBe(0);
      expect(result.userMessage).toBe('');
    });

    test('empty input returns safe result', () => {
      const result = engine.checkInput({});

      expect(result.safe).toBe(true);
      expect(result.action).toBe('continue');
    });

    test('normal pain levels do not trigger flags', () => {
      const result = engine.checkInput({
        bodyStatus: [{
          region: 'shoulder_left',
          sensation: 'pain_dull',
          level: 4,
          timestamp: new Date(),
        }],
      });

      expect(result.safe).toBe(true);
    });

    test('mild symptoms in body status do not trigger flags', () => {
      const result = engine.checkInput({
        bodyStatus: [{
          region: 'knee_right',
          sensation: 'tightness',
          level: 3,
          timestamp: new Date(),
        }],
      });

      expect(result.safe).toBe(true);
    });
  });

  describe('Priority Handling', () => {
    test('critical overrides high severity', () => {
      const result = engine.checkInput({
        userMessage: "I have chest pain and my arm is numb",
      });

      expect(result.action).toBe('emergency');
      // Both triggers should be present
      expect(result.triggers.length).toBeGreaterThanOrEqual(2);
    });

    test('high severity overrides medium', () => {
      const result = engine.checkInput({
        userMessage: 'My knee is locked and I feel numbness',
      });

      expect(result.action).toBe('seek_medical');
    });
  });

  describe('Escalation UI', () => {
    test('emergency trigger produces emergency UI', () => {
      const result = engine.checkInput({
        userMessage: 'I have chest pain',
      });

      const trigger = result.triggers.find(t => t.id === 'chest_pain');
      expect(trigger).toBeDefined();

      const ui = engine.getEscalationUI(trigger!);
      expect(ui.modalType).toBe('emergency');
      expect(ui.blocksActivity).toBe(true);
      expect(ui.requiresAcknowledgment).toBe(true);
      expect(ui.primaryAction.action).toBe('call_emergency');
    });

    test('seek_medical trigger produces danger UI', () => {
      const result = engine.checkInput({
        userMessage: 'I feel numbness in my arm',
      });

      const trigger = result.triggers.find(t => t.id === 'numbness');
      expect(trigger).toBeDefined();

      const ui = engine.getEscalationUI(trigger!);
      expect(ui.modalType).toBe('danger');
      expect(ui.blocksActivity).toBe(true);
      expect(ui.primaryAction.action).toBe('stop_workout');
    });

    test('block_activity trigger produces warning UI', () => {
      const result = engine.checkInput({
        userMessage: 'My knee gave way',
      });

      const trigger = result.triggers.find(t => t.id === 'giving_way');
      expect(trigger).toBeDefined();

      const ui = engine.getEscalationUI(trigger!);
      expect(ui.modalType).toBe('warning');
      expect(ui.blocksActivity).toBe(true);
    });

    test('warn trigger produces info UI', () => {
      const result = engine.checkInput({
        userMessage: 'I feel guilty about not exercising',
      });

      const trigger = result.triggers.find(t => t.id === 'overexertion_pressure');
      expect(trigger).toBeDefined();

      const ui = engine.getEscalationUI(trigger!);
      expect(ui.modalType).toBe('info');
      expect(ui.blocksActivity).toBe(false);
      expect(ui.canBeDismissed).toBe(true);
    });
  });

  describe('detectRedFlags', () => {
    test('detects multiple red flags in text', () => {
      const flags = engine.detectRedFlags('I have numbness and tingling in my fingers');

      expect(flags.length).toBeGreaterThanOrEqual(2);
      expect(flags.some(f => f.id === 'numbness')).toBe(true);
      expect(flags.some(f => f.id === 'tingling_radiating')).toBe(true);
    });

    test('returns empty array for safe text', () => {
      const flags = engine.detectRedFlags('I did a great workout today');

      expect(flags.length).toBe(0);
    });
  });

  describe('Safety Keywords Export', () => {
    test('exports keyword lists for testing', () => {
      expect(safetyKeywords.CHEST_PAIN_KEYWORDS).toContain('chest pain');
      expect(safetyKeywords.NUMBNESS_KEYWORDS).toContain('numb');
      expect(safetyKeywords.TINGLING_KEYWORDS).toContain('tingling');
      expect(safetyKeywords.BREATHING_KEYWORDS).toContain("can't breathe");
      expect(safetyKeywords.DIZZINESS_KEYWORDS).toContain('dizzy');
    });
  });
});
