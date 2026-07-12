/**
 * Unit tests for Gallery Item API Endpoint
 * Tests POST /api/gallery functionality
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { POST } from './gallery';
import { getDatabase } from '@/lib/mongodb';
import { MongoClient } from 'mongodb';

describe('POST /api/gallery', () => {
  let testDb: any;
  let client: MongoClient;

  beforeAll(async () => {
    // Connect to test database
    testDb = await getDatabase();
    client = testDb.client;
  });

  afterAll(async () => {
    // Clean up test data and close connection
    await testDb.collection('gallery').deleteMany({ profile_id: 'test-profile-id' });
    await client?.close();
  });

  beforeEach(async () => {
    // Clear test gallery items before each test
    await testDb.collection('gallery').deleteMany({ profile_id: 'test-profile-id' });
  });

  it('should create a gallery item with all required fields', async () => {
    const requestBody = {
      profileId: 'test-profile-id',
      topicSlug: 'arrays',
      data: '{"type":"array","values":[1,2,3]}',
      caption: 'Test array visualization',
      difficulty: 'Easy' as const,
    };

    const request = new Request('http://localhost:3000/api/gallery', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST({ request });
    expect(response.status).toBe(201);

    const result = await response.json();
    expect(result).toHaveProperty('id');
    expect(result.profile_id).toBe('test-profile-id');
    expect(result.topic_slug).toBe('arrays');
    expect(result.data).toBe('{"type":"array","values":[1,2,3]}');
    expect(result.caption).toBe('Test array visualization');
    expect(result.difficulty).toBe('Easy');
    expect(result).toHaveProperty('created_at');
    expect(typeof result.created_at).toBe('number');
  });

  it('should create a gallery item without topicSlug (defaults to empty string)', async () => {
    const requestBody = {
      profileId: 'test-profile-id',
      data: '{"type":"tree","nodes":[]}',
      caption: 'Test tree visualization',
      difficulty: 'Medium' as const,
    };

    const request = new Request('http://localhost:3000/api/gallery', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST({ request });
    expect(response.status).toBe(201);

    const result = await response.json();
    expect(result.topic_slug).toBe('');
  });

  it('should accept "Hard" difficulty level', async () => {
    const requestBody = {
      profileId: 'test-profile-id',
      data: '{"type":"graph","nodes":[]}',
      caption: 'Complex graph',
      difficulty: 'Hard' as const,
    };

    const request = new Request('http://localhost:3000/api/gallery', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST({ request });
    expect(response.status).toBe(201);

    const result = await response.json();
    expect(result.difficulty).toBe('Hard');
  });

  it('should reject request with missing profileId', async () => {
    const requestBody = {
      data: '{"type":"array","values":[]}',
      caption: 'Test',
      difficulty: 'Easy' as const,
    };

    const request = new Request('http://localhost:3000/api/gallery', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST({ request });
    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result).toHaveProperty('error');
    expect(result.error).toContain('required fields');
  });

  it('should reject request with missing data', async () => {
    const requestBody = {
      profileId: 'test-profile-id',
      caption: 'Test',
      difficulty: 'Easy' as const,
    };

    const request = new Request('http://localhost:3000/api/gallery', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST({ request });
    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result).toHaveProperty('error');
  });

  it('should reject request with missing caption', async () => {
    const requestBody = {
      profileId: 'test-profile-id',
      data: '{"type":"array","values":[]}',
      difficulty: 'Easy' as const,
    };

    const request = new Request('http://localhost:3000/api/gallery', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST({ request });
    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result).toHaveProperty('error');
  });

  it('should reject request with missing difficulty', async () => {
    const requestBody = {
      profileId: 'test-profile-id',
      data: '{"type":"array","values":[]}',
      caption: 'Test',
    };

    const request = new Request('http://localhost:3000/api/gallery', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST({ request });
    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result).toHaveProperty('error');
  });

  it('should reject request with invalid difficulty value', async () => {
    const requestBody = {
      profileId: 'test-profile-id',
      data: '{"type":"array","values":[]}',
      caption: 'Test',
      difficulty: 'VeryHard', // Invalid value
    };

    const request = new Request('http://localhost:3000/api/gallery', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST({ request });
    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result).toHaveProperty('error');
    expect(result.error).toContain('difficulty');
  });

  it('should generate unique IDs for different gallery items', async () => {
    const requestBody1 = {
      profileId: 'test-profile-id',
      data: '{"type":"array","values":[1]}',
      caption: 'Item 1',
      difficulty: 'Easy' as const,
    };

    const requestBody2 = {
      profileId: 'test-profile-id',
      data: '{"type":"array","values":[2]}',
      caption: 'Item 2',
      difficulty: 'Medium' as const,
    };

    const request1 = new Request('http://localhost:3000/api/gallery', {
      method: 'POST',
      body: JSON.stringify(requestBody1),
      headers: { 'Content-Type': 'application/json' },
    });

    const request2 = new Request('http://localhost:3000/api/gallery', {
      method: 'POST',
      body: JSON.stringify(requestBody2),
      headers: { 'Content-Type': 'application/json' },
    });

    const response1 = await POST({ request: request1 });
    const response2 = await POST({ request: request2 });

    const result1 = await response1.json();
    const result2 = await response2.json();

    expect(result1.id).not.toBe(result2.id);
  });

  it('should persist gallery item in database', async () => {
    const requestBody = {
      profileId: 'test-profile-id',
      data: '{"type":"array","values":[1,2,3]}',
      caption: 'Persisted item',
      difficulty: 'Easy' as const,
    };

    const request = new Request('http://localhost:3000/api/gallery', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST({ request });
    const result = await response.json();

    // Query database to verify item was persisted
    const savedItem = await testDb.collection('gallery').findOne({ id: result.id });
    expect(savedItem).not.toBeNull();
    expect(savedItem?.profile_id).toBe('test-profile-id');
    expect(savedItem?.caption).toBe('Persisted item');
  });
});
