/**
 * Gallery Clear API Endpoint
 * DELETE /api/gallery/clear?profileId={id} - Clear all gallery items for a profile
 */

import { getDatabase } from '@/lib/mongodb';

/**
 * DELETE /api/gallery/clear
 * Deletes all gallery items for a specific profile
 * 
 * @param request - The incoming HTTP request
 * @returns Response with success status
 */
export async function DELETE({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const profileId = url.searchParams.get('profileId');

    if (!profileId) {
      return new Response(
        JSON.stringify({ error: 'profileId is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const db = await getDatabase();
    await db.collection('gallery').deleteMany({ profile_id: profileId });

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error clearing gallery:', error);
    return new Response(
      JSON.stringify({ error: 'Database error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
