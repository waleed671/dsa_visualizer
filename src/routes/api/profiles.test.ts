/**
 * Unit tests for POST /api/profiles endpoint
 * Tests profile creation with validation, PIN hashing, and error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from './profiles';
import * as mongodb from '@/lib/mongodb';
import * as utils from '@/lib/utils';

// Mock dependencies
vi.mock('@/lib/mongodb');
vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual('@/lib/utils');
  return {
    ...actual,
    hashPin: vi.fn(),
    generateId: vi.fn(),
  };
});

describe('POST /api/profiles', () => {
  let mockDb: any;
  let mockCollection: any;

  beforeEach(() => {
    // Setup mock database
    mockCollection = {
      insertOne: vi.fn().mockResolvedValue({ insertedId: 'mongo-id' }),
    };
    mockDb = {
      collection: vi.fn().mockReturnValue(mockCollection),
    };
    vi.mocked(mongodb.getDatabase).mockResolvedValue(mockDb);

    // Setup utility mocks
    vi.mocked(utils.generateId).mockReturnValue('test-profile-id-123');
    vi.mocked(utils.hashPin).mockResolvedValue('$2b$10$hashed_pin_value');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Successful profile creation', () => {
    it('should create a profile with valid name and PIN', async () => {
      const request = new Request('http://localhost/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John Doe', pin: '1234' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({
        id: 'test-profile-id-123',
        name: 'John Doe',
        pin_hash: '$2b$10$hashed_pin_value',
        created_at: expect.any(Number),
      });
      expect(utils.hashPin).toHaveBeenCalledWith('1234');
      expect(mockCollection.insertOne).toHaveBeenCalledWith({
        id: 'test-profile-id-123',
        name: 'John Doe',
        pin_hash: '$2b$10$hashed_pin_value',
        created_at: expect.any(Number),
      });
    });

    it('should accept PIN with exactly 4 characters', async () => {
      const request = new Request('http://localhost/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Jane', pin: '1234' }),
      });

      const response = await POST({ request });
      expect(response.status).toBe(201);
    });

    it('should accept PIN longer than 4 characters', async () => {
      const request = new Request('http://localhost/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Jane', pin: '123456789' }),
      });

      const response = await POST({ request });
      expect(response.status).toBe(201);
    });

    it('should generate unique profile IDs', async () => {
      const ids = ['id-1', 'id-2', 'id-3'];
      let callCount = 0;
      vi.mocked(utils.generateId).mockImplementation(() => ids[callCount++]);

      for (let i = 0; i < 3; i++) {
        const request = new Request('http://localhost/api/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: `User ${i}`, pin: '1234' }),
        });

        const response = await POST({ request });
        const data = await response.json();
        expect(data.id).toBe(ids[i]);
      }
    });
  });

  describe('Validation errors - Missing fields', () => {
    it('should reject request with missing name', async () => {
      const request = new Request('http://localhost/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: '1234' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields: name and pin');
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    it('should reject request with missing PIN', async () => {
      const request = new Request('http://localhost/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John Doe' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields: name and pin');
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    it('should reject request with both fields missing', async () => {
      const request = new Request('http://localhost/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields: name and pin');
    });

    it('should reject request with empty name', async () => {
      const request = new Request('http://localhost/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '', pin: '1234' }),
      });

      const response = await POST({ request });
      expect(response.status).toBe(400);
    });

    it('should reject request with empty PIN', async () => {
      const request = new Request('http://localhost/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John', pin: '' }),
      });

      const response = await POST({ request });
      expect(response.status).toBe(400);
    });
  });

  describe('PIN length validation', () => {
    it('should reject PIN with less than 4 characters', async () => {
      const request = new Request('http://localhost/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John', pin: '123' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('PIN must be at least 4 characters');
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    it('should reject PIN with 1 character', async () => {
      const request = new Request('http://localhost/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John', pin: '1' }),
      });

      const response = await POST({ request });
      expect(response.status).toBe(400);
    });

    it('should reject PIN with 0 characters', async () => {
      const request = new Request('http://localhost/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John', pin: '' }),
      });

      const response = await POST({ request });
      expect(response.status).toBe(400);
    });
  });

  describe('Database error handling', () => {
    it('should return 500 when database insert fails', async () => {
      mockCollection.insertOne.mockRejectedValue(new Error('Database connection failed'));

      const request = new Request('http://localhost/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John', pin: '1234' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database error');
    });

    it('should return 500 when getDatabase fails', async () => {
      vi.mocked(mongodb.getDatabase).mockRejectedValue(new Error('Cannot connect to MongoDB'));

      const request = new Request('http://localhost/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John', pin: '1234' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database error');
    });

    it('should return 500 when hashPin fails', async () => {
      vi.mocked(utils.hashPin).mockRejectedValue(new Error('Bcrypt error'));

      const request = new Request('http://localhost/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John', pin: '1234' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database error');
    });
  });

  describe('Response structure', () => {
    it('should return profile with all required fields', async () => {
      const request = new Request('http://localhost/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John', pin: '1234' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('pin_hash');
      expect(data).toHaveProperty('created_at');
      expect(typeof data.id).toBe('string');
      expect(typeof data.name).toBe('string');
      expect(typeof data.pin_hash).toBe('string');
      expect(typeof data.created_at).toBe('number');
    });

    it('should not include plain text PIN in response', async () => {
      const request = new Request('http://localhost/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John', pin: '1234' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(data).not.toHaveProperty('pin');
      expect(data.pin_hash).not.toBe('1234');
    });

    it('should have Content-Type application/json header', async () => {
      const request = new Request('http://localhost/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John', pin: '1234' }),
      });

      const response = await POST({ request });
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('Timestamp generation', () => {
    it('should generate timestamp using Date.now()', async () => {
      const beforeTime = Date.now();
      
      const request = new Request('http://localhost/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John', pin: '1234' }),
      });

      const response = await POST({ request });
      const data = await response.json();
      
      const afterTime = Date.now();

      expect(data.created_at).toBeGreaterThanOrEqual(beforeTime);
      expect(data.created_at).toBeLessThanOrEqual(afterTime);
    });
  });
});
