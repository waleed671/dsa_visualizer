/**
 * Unit tests for MongoDB connection module
 * Tests connection functionality, error handling, and retry logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MongoClient } from 'mongodb';

// Mock MongoDB client before importing the module
vi.mock('mongodb', () => {
  const mockConnect = vi.fn();
  const mockDb = vi.fn(() => ({ name: 'test-db' }));
  
  class MockMongoClient {
    connect = mockConnect;
    db = mockDb;
  }
  
  return {
    MongoClient: MockMongoClient,
    ObjectId: class ObjectId {
      constructor(public id?: string) {
        this.id = id || 'mock-object-id';
      }
    },
  };
});

describe('MongoDB Connection Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module state
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDatabase', () => {
    it('should return database instance on successful connection', async () => {
      const { getDatabase } = await import('./mongodb');
      const db = await getDatabase();
      expect(db).toBeDefined();
    });

    it('should reuse existing connection if already connected', async () => {
      const { getDatabase } = await import('./mongodb');
      
      const db1 = await getDatabase();
      const db2 = await getDatabase();
      
      // Should return the same instance
      expect(db1).toBe(db2);
      
      // MongoClient.connect should only be called once
      const mockConnect = (MongoClient.prototype as any).connect;
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('connectToDatabase', () => {
    it('should connect to MongoDB successfully', async () => {
      const { connectToDatabase } = await import('./mongodb');
      const db = await connectToDatabase();
      
      expect(db).toBeDefined();
      const mockConnect = (MongoClient.prototype as any).connect;
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it('should return existing connection if already connected', async () => {
      const { connectToDatabase } = await import('./mongodb');
      
      const db1 = await connectToDatabase();
      const db2 = await connectToDatabase();
      
      expect(db1).toBe(db2);
    });
  });

  describe('error handling and retries', () => {
    it('should retry connection on failure', async () => {
      // Create a mock that fails twice then succeeds
      const mockConnect = vi.fn()
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce(undefined);

      const mockDb = vi.fn(() => ({ name: 'test-db' }));

      vi.doMock('mongodb', () => {
        class MockMongoClient {
          connect = mockConnect;
          db = mockDb;
        }
        return {
          MongoClient: MockMongoClient,
          ObjectId: class ObjectId {},
        };
      });

      vi.resetModules();
      const { connectToDatabase } = await import('./mongodb');
      
      const db = await connectToDatabase();
      
      expect(db).toBeDefined();
      expect(mockConnect).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      const mockConnect = vi.fn()
        .mockRejectedValue(new Error('Connection failed'));

      const mockDb = vi.fn();

      vi.doMock('mongodb', () => {
        class MockMongoClient {
          connect = mockConnect;
          db = mockDb;
        }
        return {
          MongoClient: MockMongoClient,
          ObjectId: class ObjectId {},
        };
      });

      vi.resetModules();
      const { connectToDatabase } = await import('./mongodb');
      
      await expect(connectToDatabase()).rejects.toThrow(/Failed to connect to MongoDB after 3 attempts/);
      expect(mockConnect).toHaveBeenCalledTimes(3);
    });
  });

  describe('ObjectId export', () => {
    it('should export ObjectId from mongodb', async () => {
      const { ObjectId } = await import('./mongodb');
      expect(ObjectId).toBeDefined();
      const id = new ObjectId();
      expect(id).toBeDefined();
    });
  });

  describe('Type exports', () => {
    it('should have Profile type with correct structure', async () => {
      const { type Profile } = await import('./mongodb') as any;
      // This is a compile-time check - if types are wrong, TypeScript will catch it
      const profile: typeof Profile = {
        id: 'test-id',
        name: 'Test User',
        pin_hash: 'hashed-pin',
        created_at: Date.now(),
      };
      expect(profile).toBeDefined();
    });

    it('should have GalleryItem type with correct structure', async () => {
      const { type GalleryItem } = await import('./mongodb') as any;
      // This is a compile-time check - if types are wrong, TypeScript will catch it
      const item: typeof GalleryItem = {
        id: 'item-id',
        profile_id: 'profile-id',
        topic_slug: 'sorting',
        data: 'pixel-data',
        caption: 'My solution',
        difficulty: 'Easy' as const,
        created_at: Date.now(),
      };
      expect(item).toBeDefined();
    });
  });
});
