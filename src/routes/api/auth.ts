/**
 * Authentication API Endpoint
 * POST /api/auth - Authenticate with profile ID and PIN
 */

import { verifyPin } from '@/lib/utils';
import { getDatabase } from '@/lib/mongodb';

/**
 * POST /api/auth
 * Authenticates a user with profile ID and PIN
 * 
 * @param request - The incoming HTTP request
 * @returns Response with authentication result
 */
export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.id || !body.pin) {
      return new Response(
        JSON.stringify({ success: false }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Find profile by ID
    const db = await getDatabase();
    const profile = await db.collection('profiles').findOne({ id: body.id });

    if (!profile) {
      return new Response(
        JSON.stringify({ success: false }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify PIN
    const isValid = await verifyPin(body.pin, profile.pin_hash);

    if (isValid) {
      return new Response(
        JSON.stringify({ success: true, profile }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Error authenticating:', error);
    return new Response(
      JSON.stringify({ success: false }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
