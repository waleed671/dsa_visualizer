/**
 * Validation utilities for API request handling
 * Provides type guards and validators for profile and gallery operations
 */

import type { 
  CreateProfileRequest, 
  CreateGalleryItemRequest, 
  Difficulty 
} from '../types/api';

/**
 * Re-export types for convenience
 */
export type { CreateProfileRequest, CreateGalleryItemRequest, Difficulty };

/**
 * Valid difficulty levels for gallery items
 */
export const VALID_DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

/**
 * Validates a profile creation request
 * Type guard that ensures the request contains required name and pin fields
 * 
 * @param body - Request body to validate
 * @returns True if body is a valid CreateProfileRequest
 * 
 * **Validates: Requirements 10.1, 10.2**
 */
export function validateProfileRequest(body: unknown): body is CreateProfileRequest {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const candidate = body as Record<string, unknown>;

  // Check that name exists and is a non-empty string
  if (typeof candidate.name !== "string" || candidate.name.trim() === "") {
    return false;
  }

  // Check that pin exists and is a non-empty string
  if (typeof candidate.pin !== "string" || candidate.pin.trim() === "") {
    return false;
  }

  return true;
}

/**
 * Validates a gallery item creation request
 * Type guard that ensures the request contains all required fields
 * 
 * @param body - Request body to validate
 * @returns True if body is a valid CreateGalleryItemRequest
 * 
 * **Validates: Requirements 10.3**
 */
export function validateGalleryRequest(body: unknown): body is CreateGalleryItemRequest {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const candidate = body as Record<string, unknown>;

  // Check required fields exist and are non-empty strings
  if (typeof candidate.profileId !== "string" || candidate.profileId.trim() === "") {
    return false;
  }

  if (typeof candidate.data !== "string" || candidate.data.trim() === "") {
    return false;
  }

  if (typeof candidate.caption !== "string" || candidate.caption.trim() === "") {
    return false;
  }

  // Validate difficulty enum
  if (!validateDifficulty(candidate.difficulty)) {
    return false;
  }

  // topicSlug is optional, but if present must be a string
  if (candidate.topicSlug !== undefined && typeof candidate.topicSlug !== "string") {
    return false;
  }

  return true;
}

/**
 * Validates a difficulty level value
 * Ensures the value is one of the valid difficulty enum values
 * 
 * @param value - Value to validate
 * @returns True if value is a valid difficulty level
 * 
 * **Validates: Requirements 10.4**
 */
export function validateDifficulty(value: unknown): value is Difficulty {
  return typeof value === "string" && VALID_DIFFICULTIES.includes(value as Difficulty);
}
