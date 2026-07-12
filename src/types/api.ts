/**
 * API Request and Response Types
 * 
 * This file contains all TypeScript interfaces for API endpoints
 * including profile management, authentication, and gallery operations.
 */

// ============================================================================
// Shared Types
// ============================================================================

/**
 * Valid difficulty levels for gallery items
 */
export type Difficulty = "Easy" | "Medium" | "Hard";

/**
 * Gallery item used throughout the app (store + components)
 */
export type GalleryItem = {
  id: string;
  topicSlug: string;
  data: string; // base64 dataURL
  caption: string;
  difficulty: Difficulty;
  createdAt: number;
};

// ============================================================================
// Profile Types
// ============================================================================

/**
 * User profile stored in localStorage and MongoDB
 */
export type Profile = {
  id: string;
  name: string;
  pinHash?: string;
  createdAt: number;
};

/**
 * Request body for creating a new profile
 */
export interface CreateProfileRequest {
  name: string;
  pin: string;
}

/**
 * Response data for a created profile
 */
export interface CreateProfileResponse {
  id: string;
  name: string;
  pin_hash: string;
  created_at: number;
}

// ============================================================================
// Authentication Types
// ============================================================================

/**
 * Request body for profile authentication
 */
export interface AuthRequest {
  id: string;
  pin: string;
}

/**
 * Response data for authentication attempt
 */
export interface AuthResponse {
  success: boolean;
  profile?: {
    id: string;
    name: string;
    pin_hash: string;
    created_at: number;
  };
}

// ============================================================================
// Gallery Types
// ============================================================================

/**
 * Valid difficulty levels for gallery items
 */
export type Difficulty = "Easy" | "Medium" | "Hard";

/**
 * Request body for creating a new gallery item
 */
export interface CreateGalleryItemRequest {
  profileId: string;
  topicSlug?: string;
  data: string;
  caption: string;
  difficulty: Difficulty;
}

/**
 * Response data for a gallery item
 */
export interface GalleryItemResponse {
  id: string;
  profile_id: string;
  topic_slug: string;
  data: string;
  caption: string;
  difficulty: Difficulty;
  created_at: number;
}

/**
 * Request body for importing multiple gallery items
 */
export interface ImportGalleryRequest {
  profileId: string;
  items: Array<Omit<GalleryItemResponse, "id" | "created_at" | "profile_id">>;
}

// ============================================================================
// API Handler Types (TanStack Start)
// ============================================================================

/**
 * Context object passed to TanStack Start API handlers
 */
export interface APIContext {
  request: Request;
}

/**
 * Type for TanStack Start API handler functions
 */
export type APIHandler = (context: APIContext) => Promise<Response>;

// ============================================================================
// Error Response Types
// ============================================================================

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  error: string;
}

/**
 * Success response structure for operations that don't return data
 */
export interface SuccessResponse {
  success: boolean;
}
