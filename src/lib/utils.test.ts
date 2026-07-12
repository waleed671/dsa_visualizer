import { describe, it, expect } from 'vitest';
import { generateId, hashPin, verifyPin } from './utils';

describe('Utility Functions', () => {
  describe('generateId', () => {
    it('should generate a valid UUID', () => {
      const id = generateId();
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('hashPin', () => {
    it('should hash a PIN', async () => {
      const pin = '1234';
      const hash = await hashPin(pin);
      
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(pin);
      expect(hash.startsWith('$2b$10$')).toBe(true); // bcrypt hash format
    });

    it('should produce different hashes for the same PIN', async () => {
      const pin = '1234';
      const hash1 = await hashPin(pin);
      const hash2 = await hashPin(pin);
      
      // bcrypt uses random salts, so hashes should be different
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPin', () => {
    it('should verify a correct PIN', async () => {
      const pin = '1234';
      const hash = await hashPin(pin);
      const isValid = await verifyPin(pin, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect PIN', async () => {
      const pin = '1234';
      const wrongPin = '5678';
      const hash = await hashPin(pin);
      const isValid = await verifyPin(wrongPin, hash);
      
      expect(isValid).toBe(false);
    });

    it('should handle empty PIN correctly', async () => {
      const pin = '';
      const hash = await hashPin(pin);
      const isValid = await verifyPin(pin, hash);
      
      expect(isValid).toBe(true);
    });
  });

  describe('PIN security round-trip', () => {
    it('should maintain PIN verification after hashing', async () => {
      const testPins = ['1234', 'abcd', '!@#$', '12345678'];
      
      for (const pin of testPins) {
        const hash = await hashPin(pin);
        const isValid = await verifyPin(pin, hash);
        expect(isValid).toBe(true);
      }
    });
  });
});
