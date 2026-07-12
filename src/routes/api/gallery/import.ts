/**
 * Gallery Import API Endpoint
 * POST /api/gallery/import - Import multiple gallery items
 */

import { generateId } from '@/lib/utils';
import { getDatabase } from '@/lib/mongodb';

/**
 * POST /api/gallery/import
 * Imports multiple gallery items for a profile
 * 
 * @param request - The incoming HTTP request
 * @returns Response with success status
 */
export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();

    if (!body.profileId || !Array.isArray(body.items)) {
      return new Response(
        JSON.stringify({ error: 'profileId and items array are required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Transform items with unique IDs and timestamps
    const itemsToInsert = body.items.map((item: any) => ({
      id: generateId(),
      profile_id: body.profileId,
      topic_slug: item.topic_slug || item.topicSlug || '',
      data: item.data,
      caption: item.caption,
      difficulty: item.difficulty,
      created_at: Date.now(),
    }));

    // Insert all items
    const db = await getDatabase();
    await db.collection('gallery').insertMany(itemsToInsert);

    return new Response(
      JSON.stringify({ success: true, count: itemsToInsert.length }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error importing gallery items:', error);
    return new Response(
      JSON.stringify({ error: 'Database error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
