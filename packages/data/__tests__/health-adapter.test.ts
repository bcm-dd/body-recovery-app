/**
 * Health Adapter Tests
 *
 * Tests for health data adapters (Mock adapter)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockHealthAdapter } from '../src/adapters/health/mock';
import type { DateRange } from '../src/adapters/health/types';

describe('MockHealthAdapter', () => {
  let adapter: MockHealthAdapter;

  beforeEach(() => {
    adapter = new MockHealthAdapter(12345); // Use fixed seed for reproducibility
  });

  describe('Availability', () => {
    it('should report as available', async () => {
      const availability = await adapter.isAvailable();
      expect(availability).toBe('available');
    });
  });

  describe('Permissions', () => {
    it('should request permissions successfully', async () => {
      const result = await adapter.requestPermissions(['sleep', 'hrv'], []);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should return permission status', async () => {
      const status = await adapter.getPermissionStatus();

      expect(status).toBeDefined();
    });

    it('should check minimum permissions', async () => {
      // Before granting
      expect(await adapter.hasMinimumPermissions()).toBe(false);

      // Grant permissions
      await adapter.requestPermissions(['sleep'], []);

      // After granting
      expect(await adapter.hasMinimumPermissions()).toBe(true);
    });
  });

  describe('Sleep Data', () => {
    it('should return sleep sessions', async () => {
      const range: DateRange = {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      };

      const result = await adapter.getSleep(range);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return last night sleep', async () => {
      const result = await adapter.getLastNightSleep();

      expect(result.success).toBe(true);
      // May or may not have data depending on seed
    });
  });

  describe('HRV Data', () => {
    it('should return HRV samples', async () => {
      const range: DateRange = {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      };

      const result = await adapter.getHRV(range);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return latest HRV', async () => {
      const result = await adapter.getLatestHRV();

      expect(result.success).toBe(true);
    });
  });

  describe('Heart Rate Data', () => {
    it('should return resting heart rate', async () => {
      const range: DateRange = {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      };

      const result = await adapter.getRestingHeartRate(range);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return today resting heart rate', async () => {
      const result = await adapter.getTodayRestingHeartRate();

      expect(result.success).toBe(true);
      if (result.data !== null) {
        expect(result.data).toBeGreaterThan(0);
        expect(result.data).toBeLessThan(200);
      }
    });
  });

  describe('Steps Data', () => {
    it('should return step counts', async () => {
      const range: DateRange = {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      };

      const result = await adapter.getSteps(range);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return today steps', async () => {
      const result = await adapter.getTodaySteps();

      expect(result.success).toBe(true);
      if (result.data !== null) {
        expect(result.data).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Workouts Data', () => {
    it('should return workouts', async () => {
      const range: DateRange = {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      };

      const result = await adapter.getWorkouts(range);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('Daily Snapshot', () => {
    it('should return daily snapshot', async () => {
      const result = await adapter.getDailySnapshot(new Date());

      expect(result.success).toBe(true);
      if (result.success) {
        const snapshot = result.data;

        expect(snapshot).toBeDefined();
        expect(snapshot.date).toBeDefined();
      }
    });
  });

  describe('Seeded Random', () => {
    it('should produce consistent results with same seed', async () => {
      const adapter1 = new MockHealthAdapter(99999);
      const adapter2 = new MockHealthAdapter(99999);

      const range: DateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-07'),
      };

      const result1 = await adapter1.getSleep(range);
      const result2 = await adapter2.getSleep(range);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      // With same seed, should produce same number of sessions
      expect(result1.data.length).toBe(result2.data.length);
    });
  });
});

describe('MockHealthAdapter Interface', () => {
  it('implements required methods', () => {
    const adapter = new MockHealthAdapter();

    expect(typeof adapter.isAvailable).toBe('function');
    expect(typeof adapter.requestPermissions).toBe('function');
    expect(typeof adapter.getPermissionStatus).toBe('function');
    expect(typeof adapter.hasMinimumPermissions).toBe('function');
    expect(typeof adapter.getSleep).toBe('function');
    expect(typeof adapter.getHRV).toBe('function');
    expect(typeof adapter.getRestingHeartRate).toBe('function');
    expect(typeof adapter.getSteps).toBe('function');
    expect(typeof adapter.getWorkouts).toBe('function');
    expect(typeof adapter.getDailySnapshot).toBe('function');
  });
});
