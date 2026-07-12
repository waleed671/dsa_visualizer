/**
 * Gallery API Endpoints
 * GET /api/gallery?profileId={id}&topicSlug={slug} - Get gallery items
 * POST /api/gallery - Create a gallery item
 * DELETE /api/gallery?id={id}&profileId={profileId} - Delete a gallery item
 */

import { validateGalleryRequest } from '@/lib/validation';
import { generateId } from '@/lib/utils';
import { getDatabase } from '@/lib/mongodb';

/**
 * GET /api/gallery
 * Retrieves gallery items for a profile, optionally filtered by topic
 * 
 * @param request - The incoming HTTP request
 * @returns Response with array of gallery items
 */
export async function GET({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const profileId = url.searchParams.get('profileId');
    const topicSlug = url.searchParams.get('topicSlug');

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
    const query: any = { profile_id: profileId };
    
    if (topicSlug) {
      query.topic_slug = topicSlug;
    }

    const items = await db.collection('gallery').find(query).toArray();

    return new Response(
      JSON.stringify(items),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching gallery items:', error);
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
 * POST /api/gallery
 * Creates a new gallery item
 * 
 * @param request - The incoming HTTP request
 * @returns Response with created gallery item
 */
export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();

    // Validate request body
    if (!validateGalleryRequest(body)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: profileId, data, caption, difficulty' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create gallery item document
    const item = {
      id: generateId(),
      profile_id: body.profileId,
      topic_slug: body.topicSlug || '',
      data: body.data,
      caption: body.caption,
      difficulty: body.difficulty,
      created_at: Date.now(),
    };

    // Insert into database
    const db = await getDatabase();
    await db.collection('gallery').insertOne(item);

    return new Response(
      JSON.stringify(item),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error creating gallery item:', error);
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
 * DELETE /api/gallery
 * Deletes a gallery item by ID and profileId
 * 
 * @param request - The incoming HTTP request
 * @returns Response with success status
 */
export async function DELETE({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const profileId = url.searchParams.get('profileId');

    if (!id || !profileId) {
      return new Response(
        JSON.stringify({ error: 'id and profileId are required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const db = await getDatabase();
    await db.collection('gallery').deleteOne({ 
      id: id, 
      profile_id: profileId 
    });

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return new Response(
      JSON.stringify({ error: 'Database error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
