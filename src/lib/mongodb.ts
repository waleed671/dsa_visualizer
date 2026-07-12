// MongoDB connection and utilities
import { MongoClient, Db, ObjectId } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'dsa-hub';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Connect to MongoDB with retry logic
 * Implements Requirement 11.5: Maintain connection to MongoDB for all database operations
 */
export async function connectToDatabase(): Promise<Db> {
  if (db) return db;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔄 Attempting MongoDB connection (attempt ${attempt}/${MAX_RETRIES})...`);
      
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      db = client.db(DB_NAME);
      
      console.log('✅ Connected to MongoDB successfully');
      return db;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`❌ MongoDB connection error (attempt ${attempt}/${MAX_RETRIES}):`, lastError.message);

      // If this isn't the last attempt, wait before retrying
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * attempt; // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  // All retries failed
  const errorMessage = `Failed to connect to MongoDB after ${MAX_RETRIES} attempts: ${lastError?.message}`;
  console.error('💥', errorMessage);
  throw new Error(errorMessage);
}

/**
 * Get database instance, connecting if necessary
 * Implements Requirement 11.5: Maintain connection to MongoDB for all database operations
 */
export async function getDatabase(): Promise<Db> {
  if (!db) {
    return await connectToDatabase();
  }
  return db;
}

export { ObjectId };

// Types
export type Profile = {
  _id?: ObjectId;
  id: string;
  name: string;
  pin_hash: string;
  created_at: number;
};

export type GalleryItem = {
  _id?: ObjectId;
  id: string;
  profile_id: string;
  topic_slug: string;
  data: string;
  caption: string;
  difficulty: "Easy" | "Medium" | "Hard";
  created_at: number;
};
