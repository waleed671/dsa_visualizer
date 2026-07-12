# Implementation Plan: API Endpoints Implementation

## Overview

Implement backend API endpoints for TanStack Start application with MongoDB persistence, secure PIN hashing using bcrypt, and proper validation. The implementation will follow file-based routing conventions and include comprehensive error handling and data validation.

## Tasks

- [x] 1. Set up core infrastructure and utilities
  - [x] 1.1 Create database connection module
    - Implement MongoDB connection utility in `src/lib/mongodb.ts`
    - Export `getDatabase()` function that returns database instance
    - Handle connection errors and retries
    - _Requirements: 11.5_

  - [x] 1.2 Create shared validation utilities
    - Create `src/lib/validation.ts` with validation functions
    - Implement `validateProfileRequest()` type guard
    - Implement `validateGalleryRequest()` type guard
    - Implement `validateDifficulty()` enum validator
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 1.3 Create shared utility functions
    - Create `src/lib/utils.ts` for common utilities
    - Implement `generateId()` using crypto.randomUUID()
    - Implement `hashPin()` wrapper for bcrypt.hash with salt rounds 10
    - Implement `verifyPin()` wrapper for bcrypt.compare
    - _Requirements: 8.3, 2.2, 2.3_

  - [x] 1.4 Define TypeScript types and interfaces
    - Create `src/types/api.ts` with all request/response interfaces
    - Define CreateProfileRequest, CreateProfileResponse types
    - Define AuthRequest, AuthResponse types
    - Define CreateGalleryItemRequest, GalleryItemResponse types
    - Define ImportGalleryRequest type
    - _Requirements: All requirements_

- [x] 2. Implement profile creation endpoint
  - [x] 2.1 Create POST /api/profiles route handler
    - Create file `src/routes/api/profiles.ts`
    - Parse and validate request body using validateProfileRequest
    - Validate PIN length (minimum 4 characters)
    - Hash PIN using hashPin utility
    - Generate unique profile ID
    - Create profile document with id, name, pin_hash, created_at
    - Insert profile into MongoDB profiles collection
    - Return 201 status with profile data
    - Handle validation errors with 400 status
    - Handle database errors with 500 status
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 8.1, 9.1, 9.3, 9.4, 10.1, 10.2, 11.1, 12.1, 12.2, 12.5_

  - [ ]* 2.2 Write property test for unique identifier generation
    - **Property 1: Unique Identifier Generation**
    - **Validates: Requirements 1.1, 8.1**
    - Test that multiple profile creations generate unique IDs
    - Use property-based testing library to create multiple profiles
    - Verify no duplicate IDs in generated set

  - [ ]* 2.3 Write property test for PIN hashing security
    - **Property 2: PIN Hashing Security**
    - **Validates: Requirements 2.1, 2.2, 2.4**
    - Test that PIN hash differs from plain text PIN
    - Verify no plain text PINs in response or database
    - Test with various PIN values

  - [ ]* 2.4 Write property test for PIN verification round-trip
    - **Property 3: PIN Verification Round-trip**
    - **Validates: Requirements 2.3**
    - Test that hashPin and verifyPin work correctly together
    - For any PIN, verify that verifyPin(pin, hashPin(pin)) returns true
    - Test with various PIN values

  - [ ]* 2.5 Write property test for profile field completeness
    - **Property 4: Profile Field Completeness**
    - **Validates: Requirements 1.3, 12.1, 12.2**
    - Test that created profiles have all required fields
    - Verify name and pin_hash are non-empty strings
    - Verify id and created_at fields exist

  - [ ]* 2.6 Write property test for profile required field validation
    - **Property 6: Profile Required Field Validation**
    - **Validates: Requirements 1.5, 10.2**
    - Test that requests missing name or pin are rejected with 400
    - Test various combinations of missing fields

  - [ ]* 2.7 Write property test for PIN length validation
    - **Property 9: PIN Length Validation**
    - **Validates: Requirements 1.4**
    - Test that PINs shorter than 4 characters are rejected with 400
    - Test boundary cases (length 3, 4, 5)

- [x] 3. Checkpoint - Verify profile creation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement authentication endpoint
  - [-] 4.1 Create POST /api/auth route handler
    - Create file `src/routes/api/auth.ts`
    - Parse request body and extract id and pin
    - Validate that id and pin fields are present
    - Query MongoDB for profile by id
    - If profile not found, return 401 with success false
    - Verify PIN using verifyPin utility against pin_hash
    - If PIN valid, return 200 with success true and profile data
    - If PIN invalid, return 401 with success false
    - Handle missing fields with 401 status
    - Handle database errors with 500 status
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 9.2, 9.3, 9.4_

  - [ ]* 4.2 Write property test for authentication success response
    - **Property 10: Authentication Success Response**
    - **Validates: Requirements 3.3**
    - Create profile, then test authentication with correct credentials
    - Verify 200 status, success true, and profile data returned

  - [ ]* 4.3 Write property test for authentication failure response
    - **Property 11: Authentication Failure Response**
    - **Validates: Requirements 3.4, 3.5, 3.6, 9.2**
    - Test wrong PIN returns 401 with success false
    - Test non-existent profile ID returns 401 with success false
    - Test missing id field returns 401 with success false
    - Test missing pin field returns 401 with success false

- [ ] 5. Implement gallery item creation endpoint
  - [ ] 5.1 Create POST /api/gallery route handler
    - Create file `src/routes/api/gallery.ts` with POST handler
    - Parse and validate request body using validateGalleryRequest
    - Validate required fields: profileId, data, caption, difficulty
    - Validate difficulty is one of "Easy", "Medium", or "Hard"
    - Generate unique item ID
    - Create gallery item document with all fields
    - Set created_at timestamp using Date.now()
    - Insert item into MongoDB gallery collection
    - Return 201 status with item data
    - Handle validation errors with 400 status
    - Handle database errors with 500 status
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 8.2, 9.1, 9.3, 9.4, 10.1, 10.3, 10.4, 11.2, 12.3, 12.5_

  - [ ]* 5.2 Write property test for gallery item field completeness
    - **Property 5: Gallery Item Field Completeness**
    - **Validates: Requirements 4.2, 12.3**
    - Test that created gallery items have all required fields
    - Verify difficulty is one of the valid enum values
    - Verify all fields are present and properly typed

  - [ ]* 5.3 Write property test for gallery required field validation
    - **Property 7: Gallery Required Field Validation**
    - **Validates: Requirements 4.3, 10.3**
    - Test that requests missing required fields are rejected with 400
    - Test missing profileId, data, caption, and difficulty individually

  - [ ]* 5.4 Write property test for difficulty enum validation
    - **Property 8: Difficulty Enum Validation**
    - **Validates: Requirements 4.4, 4.6, 10.4**
    - Test that invalid difficulty values are rejected with 400
    - Test with various invalid values ("easy", "EASY", "Invalid", etc.)
    - Verify only exact matches to "Easy", "Medium", "Hard" are accepted

  - [ ]* 5.5 Write property test for success status codes
    - **Property 18: Success Status Codes**
    - **Validates: Requirements 1.6, 4.5**
    - Test that successful creation returns 201 status
    - Verify response contains created entity data

- [ ] 6. Implement gallery retrieval endpoint
  - [~] 6.1 Create GET /api/gallery route handler
    - Add GET handler to `src/routes/api/gallery.ts`
    - Parse query parameters: profileId (required), topicSlug (optional)
    - Validate profileId is present, return 400 if missing
    - Build MongoDB query with profile_id filter
    - Add topic_slug filter if topicSlug provided
    - Query gallery collection with filters
    - Return 200 status with items array (empty array if no matches)
    - Handle database errors with 500 status
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 9.1, 9.3, 9.4, 11.4_

  - [ ]* 6.2 Write property test for gallery profile isolation
    - **Property 12: Gallery Profile Isolation**
    - **Validates: Requirements 5.1, 12.4**
    - Create gallery items for multiple profiles
    - Test that retrieval only returns items for specified profileId
    - Verify cross-profile isolation

  - [ ]* 6.3 Write property test for gallery topic filtering
    - **Property 13: Gallery Topic Filtering**
    - **Validates: Requirements 5.2**
    - Create gallery items with different topic_slug values
    - Test that filtering by topicSlug returns only matching items
    - Verify both profileId and topicSlug filters apply correctly

- [ ] 7. Implement gallery deletion endpoint
  - [~] 7.1 Create DELETE /api/gallery route handler
    - Add DELETE handler to `src/routes/api/gallery.ts`
    - Parse query parameters: id (required), profileId (required)
    - Validate both id and profileId are present, return 400 if missing
    - Delete item from gallery collection where id and profile_id match
    - Return 200 status with success true (even if item not found)
    - Handle database errors with 500 status
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 9.1, 9.3, 9.4, 11.3_

  - [ ]* 7.2 Write property test for gallery deletion ownership
    - **Property 14: Gallery Deletion Ownership**
    - **Validates: Requirements 6.1**
    - Create gallery items for multiple profiles
    - Test that deletion only removes items matching both id and profileId
    - Verify users cannot delete other users' items

  - [ ]* 7.3 Write property test for gallery deletion validation
    - **Property 15: Gallery Deletion Validation**
    - **Validates: Requirements 6.2**
    - Test that requests missing id parameter are rejected with 400
    - Test that requests missing profileId parameter are rejected with 400

- [ ] 8. Implement gallery import endpoint
  - [~] 8.1 Create POST /api/gallery/import route handler
    - Create file `src/routes/api/gallery/import.ts`
    - Parse request body containing profileId and items array
    - Validate each item has required fields
    - Generate unique ID for each item using generateId
    - Generate timestamp for each item using Date.now()
    - Associate each item with specified profileId
    - Insert all items into MongoDB gallery collection
    - Return 201 status with created items
    - Handle validation errors with 400 status
    - Handle database errors with 500 status
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 9.1, 9.3, 9.4, 11.2_

  - [ ]* 8.2 Write property test for gallery import ID generation
    - **Property 16: Gallery Import ID Generation**
    - **Validates: Requirements 7.2**
    - Import multiple items and verify each has unique ID
    - Test with varying numbers of items

  - [ ]* 8.3 Write property test for gallery import profile association
    - **Property 17: Gallery Import Profile Association**
    - **Validates: Requirements 7.4**
    - Import items and verify all are associated with specified profileId
    - Test that imported items can be retrieved by profileId

- [~] 9. Checkpoint - Verify all endpoints
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Integration and error handling
  - [~] 10.1 Add comprehensive error handling
    - Review all route handlers for proper try-catch blocks
    - Ensure validation errors return 400 with descriptive messages
    - Ensure authentication failures return 401
    - Ensure database errors return 500 with error messages
    - Ensure unexpected errors are caught and return 500
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [~] 10.2 Add request validation middleware
    - Create centralized validation error handler
    - Ensure consistent error response format across all endpoints
    - Add input sanitization where appropriate
    - _Requirements: 10.1, 10.5_

  - [ ]* 10.3 Write integration tests for error handling
    - **Property 19: Validation Error Status**
    - **Validates: Requirements 9.1**
    - Test various validation failures return 400 with error messages
    - Verify error messages are descriptive

  - [ ]* 10.4 Write property test for timestamp consistency
    - **Property 20: Timestamp Consistency**
    - **Validates: Requirements 12.5**
    - Test that all created entities have numeric timestamps
    - Verify timestamps are generated using Date.now()
    - Test timestamps are reasonable (recent)

- [~] 11. Final checkpoint and verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests and integration tests validate specific examples and error conditions
- All endpoints use TanStack Start file-based routing conventions
- MongoDB connection is established via shared utility in `src/lib/mongodb.ts`
- All security-sensitive operations (PIN hashing) use bcrypt with salt rounds 10
- Error handling follows consistent patterns: 400 for validation, 401 for auth, 500 for server errors

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "2.7"] },
    { "id": 3, "tasks": ["4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "5.1"] },
    { "id": 5, "tasks": ["5.2", "5.3", "5.4", "5.5", "6.1"] },
    { "id": 6, "tasks": ["6.2", "6.3", "7.1"] },
    { "id": 7, "tasks": ["7.2", "7.3", "8.1"] },
    { "id": 8, "tasks": ["8.2", "8.3", "10.1", "10.2"] },
    { "id": 9, "tasks": ["10.3", "10.4"] }
  ]
}
```
