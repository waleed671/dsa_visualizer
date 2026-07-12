/**
 * Unit tests for POST /api/auth endpoint
 * Tests profile authentication with ID and PIN verification
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from './auth';
import * as mongodb from '@/lib/mongodb';
import * as utils from '@/lib/utils';

// Mock dependencies
vi.mock('@/lib/mongodb');
vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual('@/lib/utils');
  return {
    ...actual,
    verifyPin: vi.fn(),
  };
});

describe('POST /api/auth', () => {
  let mockDb: any;
  let mockCollection: any;

  const mockProfile = {
    id: 'test-profile-123',
    name: 'John Doe',
    pin_hash: '$2b$10$hashed_pin_value',
    created_at: 1234567890,
  };

  beforeEach(() => {
    // Setup mock database
    mockCollection = {
      findOne: vi.fn(),
    };
    mockDb = {
      collection: vi.fn().mockReturnValue(mockCollection),
    };
    vi.mocked(mongodb.getDatabase).mockResolvedValue(mockDb);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Successful authentication', () => {
    it('should authenticate with valid ID and PIN', async () => {
      mockCollection.findOne.mockResolvedValue(mockProfile);
      vi.mocked(utils.verifyPin).mockResolvedValue(true);

      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test-profile-123', pin: '1234' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.profile).toEqual(mockProfile);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ id: 'test-profile-123' });
      expect(utils.verifyPin).toHaveBeenCalledWith('1234', mockProfile.pin_hash);
    });

    it('should return profile data with all required fields on success', async () => {
      mockCollection.findOne.mockResolvedValue(mockProfile);
      vi.mocked(utils.verifyPin).mockResolvedValue(true);

      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test-profile-123', pin: '1234' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(data.profile).toHaveProperty('id');
      expect(data.profile).toHaveProperty('name');
      expect(data.profile).toHaveProperty('pin_hash');
      expect(data.profile).toHaveProperty('created_at');
      expect(data.profile.id).toBe('test-profile-123');
      expect(data.profile.name).toBe('John Doe');
    });
  });

  describe('Authentication failure - Invalid PIN', () => {
    it('should return 401 when PIN is incorrect', async () => {
      mockCollection.findOne.mockResolvedValue(mockProfile);
      vi.mocked(utils.verifyPin).mockResolvedValue(false);

      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test-profile-123', pin: 'wrong-pin' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.profile).toBeUndefined();
      expect(utils.verifyPin).toHaveBeenCalledWith('wrong-pin', mockProfile.pin_hash);
    });

    it('should not leak information about PIN validity', async () => {
      mockCollection.findOne.mockResolvedValue(mockProfile);
      vi.mocked(utils.verifyPin).mockResolvedValue(false);

      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test-profile-123', pin: '0000' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).not.toHaveProperty('error');
      expect(data.success).toBe(false);
    });
  });

  describe('Authentication failure - Profile not found', () => {
    it('should return 401 when profile does not exist', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'non-existent-id', pin: '1234' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.profile).toBeUndefined();
      expect(utils.verifyPin).not.toHaveBeenCalled();
    });

    it('should not leak information about profile existence', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'fake-id', pin: '1234' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).not.toHaveProperty('error');
      expect(data.success).toBe(false);
    });
  });

  describe('Missing fields validation', () => {
    it('should return 401 when id is missing', async () => {
      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: '1234' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.profile).toBeUndefined();
      expect(mockCollection.findOne).not.toHaveBeenCalled();
    });

    it('should return 401 when pin is missing', async () => {
      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test-profile-123' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.profile).toBeUndefined();
      expect(mockCollection.findOne).not.toHaveBeenCalled();
    });

    it('should return 401 when both fields are missing', async () => {
      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(mockCollection.findOne).not.toHaveBeenCalled();
    });

    it('should return 401 when id is empty string', async () => {
      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: '', pin: '1234' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should return 401 when pin is empty string', async () => {
      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test-profile-123', pin: '' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('Database error handling', () => {
    it('should return 500 when database query fails', async () => {
      mockCollection.findOne.mockRejectedValue(new Error('Database connection failed'));

      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test-profile-123', pin: '1234' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('should return 500 when getDatabase fails', async () => {
      vi.mocked(mongodb.getDatabase).mockRejectedValue(new Error('Cannot connect to MongoDB'));

      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test-profile-123', pin: '1234' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('should return 500 when verifyPin throws error', async () => {
      mockCollection.findOne.mockResolvedValue(mockProfile);
      vi.mocked(utils.verifyPin).mockRejectedValue(new Error('Bcrypt error'));

      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test-profile-123', pin: '1234' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  describe('Response structure', () => {
    it('should always have success field in response', async () => {
      mockCollection.findOne.mockResolvedValue(mockProfile);
      vi.mocked(utils.verifyPin).mockResolvedValue(true);

      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test-profile-123', pin: '1234' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(typeof data.success).toBe('boolean');
    });

    it('should have Content-Type application/json header', async () => {
      mockCollection.findOne.mockResolvedValue(mockProfile);
      vi.mocked(utils.verifyPin).mockResolvedValue(true);

      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test-profile-123', pin: '1234' }),
      });

      const response = await POST({ request });
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should not include profile in failed authentication response', async () => {
      mockCollection.findOne.mockResolvedValue(mockProfile);
      vi.mocked(utils.verifyPin).mockResolvedValue(false);

      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test-profile-123', pin: 'wrong' }),
      });

      const response = await POST({ request });
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.profile).toBeUndefined();
    });
  });

  describe('Security considerations', () => {
    it('should query database by id field not _id', async () => {
      mockCollection.findOne.mockResolvedValue(mockProfile);
      vi.mocked(utils.verifyPin).mockResolvedValue(true);

      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test-profile-123', pin: '1234' }),
      });

      await POST({ request });

      expect(mockCollection.findOne).toHaveBeenCalledWith({ id: 'test-profile-123' });
    });

    it('should use verifyPin utility for PIN comparison', async () => {
      mockCollection.findOne.mockResolvedValue(mockProfile);
      vi.mocked(utils.verifyPin).mockResolvedValue(true);

      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test-profile-123', pin: '1234' }),
      });

      await POST({ request });

      expect(utils.verifyPin).toHaveBeenCalledWith('1234', '$2b$10$hashed_pin_value');
    });
  });
});
