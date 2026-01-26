/**
 * Storage Adapter Tests
 *
 * Tests for localStorage and InMemory storage adapters
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  LocalStorageAdapter,
  InMemoryStorageAdapter,
  createLocalStorage,
  createInMemoryStorage,
} from '../src/storage/localStorage';

describe('InMemoryStorageAdapter', () => {
  let storage: InMemoryStorageAdapter;

  beforeEach(() => {
    storage = new InMemoryStorageAdapter();
  });

  describe('String Operations', () => {
    it('should store and retrieve strings', () => {
      storage.set('key', 'value');
      expect(storage.getString('key')).toBe('value');
    });

    it('should return undefined for missing keys', () => {
      expect(storage.getString('missing')).toBeUndefined();
    });

    it('should not return string for non-string values', () => {
      storage.set('number', 42);
      expect(storage.getString('number')).toBeUndefined();
    });
  });

  describe('Number Operations', () => {
    it('should store and retrieve numbers', () => {
      storage.set('count', 42);
      expect(storage.getNumber('count')).toBe(42);
    });

    it('should handle floating point numbers', () => {
      storage.set('float', 3.14159);
      expect(storage.getNumber('float')).toBeCloseTo(3.14159);
    });

    it('should return undefined for non-number values', () => {
      storage.set('string', 'hello');
      expect(storage.getNumber('string')).toBeUndefined();
    });
  });

  describe('Boolean Operations', () => {
    it('should store and retrieve booleans', () => {
      storage.set('enabled', true);
      expect(storage.getBoolean('enabled')).toBe(true);

      storage.set('disabled', false);
      expect(storage.getBoolean('disabled')).toBe(false);
    });

    it('should return undefined for non-boolean values', () => {
      storage.set('string', 'true');
      expect(storage.getBoolean('string')).toBeUndefined();
    });
  });

  describe('Object Operations', () => {
    it('should store and retrieve objects', () => {
      const obj = { name: 'Test', value: 42, nested: { a: 1 } };
      storage.setObject('obj', obj);
      expect(storage.getObject('obj')).toEqual(obj);
    });

    it('should store and retrieve arrays', () => {
      const arr = [1, 2, 3, 'four'];
      storage.setObject('arr', arr);
      expect(storage.getObject('arr')).toEqual(arr);
    });
  });

  describe('Key Operations', () => {
    it('should check if key exists', () => {
      storage.set('exists', 'value');
      expect(storage.contains('exists')).toBe(true);
      expect(storage.contains('missing')).toBe(false);
    });

    it('should get all keys', () => {
      storage.set('key1', 'value1');
      storage.set('key2', 'value2');
      storage.set('key3', 'value3');

      const keys = storage.getAllKeys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should delete keys', () => {
      storage.set('key', 'value');
      expect(storage.contains('key')).toBe(true);

      storage.delete('key');
      expect(storage.contains('key')).toBe(false);
    });

    it('should clear all keys', () => {
      storage.set('key1', 'value1');
      storage.set('key2', 'value2');

      storage.clearAll();

      expect(storage.getAllKeys()).toHaveLength(0);
    });
  });

  describe('Batch Operations', () => {
    it('should get multiple values', () => {
      storage.set('a', 'valueA');
      storage.set('b', 42);
      storage.set('c', true);

      const result = storage.getMultiple(['a', 'b', 'c', 'd']);

      expect(result.a).toBe('valueA');
      expect(result.b).toBe(42);
      expect(result.c).toBe(true);
      expect(result.d).toBeUndefined();
    });

    it('should set multiple values', () => {
      storage.setMultiple({
        key1: 'value1',
        key2: 42,
        key3: true,
      });

      expect(storage.getString('key1')).toBe('value1');
      expect(storage.getNumber('key2')).toBe(42);
      expect(storage.getBoolean('key3')).toBe(true);
    });

    it('should delete multiple keys', () => {
      storage.set('a', 1);
      storage.set('b', 2);
      storage.set('c', 3);

      storage.deleteMultiple(['a', 'c']);

      expect(storage.contains('a')).toBe(false);
      expect(storage.contains('b')).toBe(true);
      expect(storage.contains('c')).toBe(false);
    });
  });

  describe('Listeners', () => {
    it('should notify listeners on set', () => {
      const listener = vi.fn();
      storage.addListener(listener);

      storage.set('key', 'value');

      expect(listener).toHaveBeenCalledWith('key', 'value');
    });

    it('should notify listeners on delete', () => {
      const listener = vi.fn();
      storage.set('key', 'value');
      storage.addListener(listener);

      storage.delete('key');

      expect(listener).toHaveBeenCalledWith('key', null);
    });

    it('should allow removing listeners', () => {
      const listener = vi.fn();
      const unsubscribe = storage.addListener(listener);

      storage.set('key1', 'value1');
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      storage.set('key2', 'value2');
      expect(listener).toHaveBeenCalledTimes(1); // Still 1
    });
  });

  describe('Utility Methods', () => {
    it('should calculate storage size', () => {
      storage.set('key', 'value');
      const size = storage.getSize();
      expect(size).toBeGreaterThan(0);
    });

    it('should report not encrypted', () => {
      expect(storage.isEncrypted()).toBe(false);
    });
  });
});

describe('LocalStorageAdapter', () => {
  let storage: LocalStorageAdapter;

  beforeEach(() => {
    storage = new LocalStorageAdapter({ id: 'test' });
    localStorage.clear();
  });

  describe('Namespacing', () => {
    it('should use prefix for keys', () => {
      storage.set('key', 'value');
      // The key in localStorage should be prefixed
      const rawValue = localStorage.getItem('test:key');
      expect(rawValue).toBeTruthy();
    });

    it('should only return keys with correct prefix', () => {
      storage.set('mykey', 'value');
      localStorage.setItem('other:key', 'other');

      const keys = storage.getAllKeys();
      expect(keys).toContain('mykey');
      expect(keys).not.toContain('other:key');
    });
  });

  describe('Type Safety', () => {
    it('should preserve string type', () => {
      storage.set('str', 'hello');
      expect(storage.getString('str')).toBe('hello');
      expect(storage.getNumber('str')).toBeUndefined();
    });

    it('should preserve number type', () => {
      storage.set('num', 123);
      expect(storage.getNumber('num')).toBe(123);
      expect(storage.getString('num')).toBeUndefined();
    });

    it('should preserve boolean type', () => {
      storage.set('bool', true);
      expect(storage.getBoolean('bool')).toBe(true);
      expect(storage.getString('bool')).toBeUndefined();
    });

    it('should preserve object type', () => {
      const obj = { a: 1, b: 'two' };
      storage.setObject('obj', obj);
      expect(storage.getObject('obj')).toEqual(obj);
    });
  });
});

describe('Storage Factory Functions', () => {
  it('createInMemoryStorage returns InMemoryStorageAdapter', () => {
    const storage = createInMemoryStorage();
    expect(storage).toBeInstanceOf(InMemoryStorageAdapter);
  });

  it('createLocalStorage returns LocalStorageAdapter', () => {
    const storage = createLocalStorage({ id: 'factory-test' });
    expect(storage).toBeInstanceOf(LocalStorageAdapter);
  });
});
