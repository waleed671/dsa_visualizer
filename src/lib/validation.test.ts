/**
 * Unit tests for validation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  validateProfileRequest,
  validateGalleryRequest,
  validateDifficulty,
  VALID_DIFFICULTIES,
  type CreateProfileRequest,
  type CreateGalleryItemRequest,
} from './validation';

describe('validateProfileRequest', () => {
  it('should return true for valid profile request', () => {
    const validRequest = {
      name: 'Test User',
      pin: '1234',
    };
    expect(validateProfileRequest(validRequest)).toBe(true);
  });

  it('should return false when name is missing', () => {
    const invalidRequest = {
      pin: '1234',
    };
    expect(validateProfileRequest(invalidRequest)).toBe(false);
  });

  it('should return false when pin is missing', () => {
    const invalidRequest = {
      name: 'Test User',
    };
    expect(validateProfileRequest(invalidRequest)).toBe(false);
  });

  it('should return false when name is empty string', () => {
    const invalidRequest = {
      name: '',
      pin: '1234',
    };
    expect(validateProfileRequest(invalidRequest)).toBe(false);
  });

  it('should return false when name is only whitespace', () => {
    const invalidRequest = {
      name: '   ',
      pin: '1234',
    };
    expect(validateProfileRequest(invalidRequest)).toBe(false);
  });

  it('should return false when pin is empty string', () => {
    const invalidRequest = {
      name: 'Test User',
      pin: '',
    };
    expect(validateProfileRequest(invalidRequest)).toBe(false);
  });

  it('should return false when pin is only whitespace', () => {
    const invalidRequest = {
      name: 'Test User',
      pin: '   ',
    };
    expect(validateProfileRequest(invalidRequest)).toBe(false);
  });

  it('should return false when body is null', () => {
    expect(validateProfileRequest(null)).toBe(false);
  });

  it('should return false when body is not an object', () => {
    expect(validateProfileRequest('string')).toBe(false);
    expect(validateProfileRequest(123)).toBe(false);
    expect(validateProfileRequest(true)).toBe(false);
  });

  it('should return false when name is not a string', () => {
    const invalidRequest = {
      name: 123,
      pin: '1234',
    };
    expect(validateProfileRequest(invalidRequest)).toBe(false);
  });

  it('should return false when pin is not a string', () => {
    const invalidRequest = {
      name: 'Test User',
      pin: 1234,
    };
    expect(validateProfileRequest(invalidRequest)).toBe(false);
  });
});

describe('validateGalleryRequest', () => {
  it('should return true for valid gallery request with all fields', () => {
    const validRequest = {
      profileId: 'profile-123',
      topicSlug: 'sorting',
      data: 'pixel-data',
      caption: 'My solution',
      difficulty: 'Easy',
    };
    expect(validateGalleryRequest(validRequest)).toBe(true);
  });

  it('should return true for valid gallery request without optional topicSlug', () => {
    const validRequest = {
      profileId: 'profile-123',
      data: 'pixel-data',
      caption: 'My solution',
      difficulty: 'Medium',
    };
    expect(validateGalleryRequest(validRequest)).toBe(true);
  });

  it('should return false when profileId is missing', () => {
    const invalidRequest = {
      data: 'pixel-data',
      caption: 'My solution',
      difficulty: 'Easy',
    };
    expect(validateGalleryRequest(invalidRequest)).toBe(false);
  });

  it('should return false when data is missing', () => {
    const invalidRequest = {
      profileId: 'profile-123',
      caption: 'My solution',
      difficulty: 'Easy',
    };
    expect(validateGalleryRequest(invalidRequest)).toBe(false);
  });

  it('should return false when caption is missing', () => {
    const invalidRequest = {
      profileId: 'profile-123',
      data: 'pixel-data',
      difficulty: 'Easy',
    };
    expect(validateGalleryRequest(invalidRequest)).toBe(false);
  });

  it('should return false when difficulty is missing', () => {
    const invalidRequest = {
      profileId: 'profile-123',
      data: 'pixel-data',
      caption: 'My solution',
    };
    expect(validateGalleryRequest(invalidRequest)).toBe(false);
  });

  it('should return false when profileId is empty string', () => {
    const invalidRequest = {
      profileId: '',
      data: 'pixel-data',
      caption: 'My solution',
      difficulty: 'Easy',
    };
    expect(validateGalleryRequest(invalidRequest)).toBe(false);
  });

  it('should return false when data is empty string', () => {
    const invalidRequest = {
      profileId: 'profile-123',
      data: '',
      caption: 'My solution',
      difficulty: 'Easy',
    };
    expect(validateGalleryRequest(invalidRequest)).toBe(false);
  });

  it('should return false when caption is empty string', () => {
    const invalidRequest = {
      profileId: 'profile-123',
      data: 'pixel-data',
      caption: '',
      difficulty: 'Easy',
    };
    expect(validateGalleryRequest(invalidRequest)).toBe(false);
  });

  it('should return false when difficulty is invalid', () => {
    const invalidRequest = {
      profileId: 'profile-123',
      data: 'pixel-data',
      caption: 'My solution',
      difficulty: 'Invalid',
    };
    expect(validateGalleryRequest(invalidRequest)).toBe(false);
  });

  it('should return false when topicSlug is not a string', () => {
    const invalidRequest = {
      profileId: 'profile-123',
      topicSlug: 123,
      data: 'pixel-data',
      caption: 'My solution',
      difficulty: 'Easy',
    };
    expect(validateGalleryRequest(invalidRequest)).toBe(false);
  });

  it('should return false when body is null', () => {
    expect(validateGalleryRequest(null)).toBe(false);
  });

  it('should return false when body is not an object', () => {
    expect(validateGalleryRequest('string')).toBe(false);
    expect(validateGalleryRequest(123)).toBe(false);
    expect(validateGalleryRequest(true)).toBe(false);
  });

  it('should accept all valid difficulty levels', () => {
    const difficulties = ['Easy', 'Medium', 'Hard'];
    difficulties.forEach(difficulty => {
      const request = {
        profileId: 'profile-123',
        data: 'pixel-data',
        caption: 'My solution',
        difficulty,
      };
      expect(validateGalleryRequest(request)).toBe(true);
    });
  });
});

describe('validateDifficulty', () => {
  it('should return true for "Easy"', () => {
    expect(validateDifficulty('Easy')).toBe(true);
  });

  it('should return true for "Medium"', () => {
    expect(validateDifficulty('Medium')).toBe(true);
  });

  it('should return true for "Hard"', () => {
    expect(validateDifficulty('Hard')).toBe(true);
  });

  it('should return false for invalid difficulty strings', () => {
    expect(validateDifficulty('easy')).toBe(false);
    expect(validateDifficulty('EASY')).toBe(false);
    expect(validateDifficulty('Invalid')).toBe(false);
    expect(validateDifficulty('VeryHard')).toBe(false);
    expect(validateDifficulty('')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(validateDifficulty(123)).toBe(false);
    expect(validateDifficulty(null)).toBe(false);
    expect(validateDifficulty(undefined)).toBe(false);
    expect(validateDifficulty(true)).toBe(false);
    expect(validateDifficulty({})).toBe(false);
    expect(validateDifficulty([])).toBe(false);
  });

  it('should validate all difficulties in VALID_DIFFICULTIES constant', () => {
    VALID_DIFFICULTIES.forEach(difficulty => {
      expect(validateDifficulty(difficulty)).toBe(true);
    });
  });
});

describe('Type narrowing', () => {
  it('should narrow type for validateProfileRequest', () => {
    const body: unknown = {
      name: 'Test User',
      pin: '1234',
    };

    if (validateProfileRequest(body)) {
      // TypeScript should narrow the type here
      const profile: CreateProfileRequest = body;
      expect(profile.name).toBe('Test User');
      expect(profile.pin).toBe('1234');
    }
  });

  it('should narrow type for validateGalleryRequest', () => {
    const body: unknown = {
      profileId: 'profile-123',
      data: 'pixel-data',
      caption: 'My solution',
      difficulty: 'Easy',
    };

    if (validateGalleryRequest(body)) {
      // TypeScript should narrow the type here
      const gallery: CreateGalleryItemRequest = body;
      expect(gallery.profileId).toBe('profile-123');
      expect(gallery.data).toBe('pixel-data');
      expect(gallery.caption).toBe('My solution');
      expect(gallery.difficulty).toBe('Easy');
    }
  });
});
