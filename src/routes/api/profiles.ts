/**
 * Profile Management API Endpoints
 * GET /api/profiles - Get all profiles
 * POST /api/profiles - Create a new profile
 * DELETE /api/profiles?id={id} - Delete a profile
 */

import { validateProfileRequest } from '@/lib/validation';
import { hashPin, generateId } from '@/lib/utils';
import { getDatabase } from '@/lib/mongodb';

/**
 * POST /api/profiles
 * Creates a new profile with hashed PIN
 * 
 * @param request - The incoming HTTP request
 * @returns Response with created profile or error
 */
export async function POST({ request }: { request: Request }) {
  try {
    // Step 1: Parse request body
    const body = await request.json();

    // Step 2: Validate request body structure
    if (!validateProfileRequest(body)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name and pin' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 3: Validate PIN length (minimum 4 characters)
    if (body.pin.length < 4) {
      return new Response(
        JSON.stringify({ error: 'PIN must be at least 4 characters' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 4: Hash PIN using bcrypt
    const pinHash = await hashPin(body.pin);

    // Step 5: Generate unique profile ID
    const profileId = generateId();

    // Step 6: Create profile document
    const profile = {
      id: profileId,
      name: body.name,
      pin_hash: pinHash,
      created_at: Date.now(),
    };

    // Step 7: Insert profile into MongoDB
    const db = await getDatabase();
    await db.collection('profiles').insertOne(profile);

    // Step 8: Return 201 status with profile data
    return new Response(
      JSON.stringify(profile),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    // Handle database errors or unexpected errors
    console.error('Error creating profile:', error);
    return new Response(
      JSON.stringify({ error: 'Database error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * GET /api/profiles
 * Retrieves all profiles from the database
 * 
 * @returns Response with array of profiles
 */
export async function GET() {
  try {
    const db = await getDatabase();
    const profiles = await db.collection('profiles').find({}).toArray();
    
    return new Response(
      JSON.stringify(profiles),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return new Response(
      JSON.stringify({ error: 'Database error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * DELETE /api/profiles?id={id}
 * Deletes a profile by ID
 * 
 * @param request - The incoming HTTP request
 * @returns Response with success status
 */
export async function DELETE({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Profile ID is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const db = await getDatabase();
    await db.collection('profiles').deleteOne({ id });

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error deleting profile:', error);
    return new Response(
      JSON.stringify({ error: 'Database error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
