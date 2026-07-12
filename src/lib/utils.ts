import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import bcrypt from "bcrypt";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique identifier using crypto.randomUUID()
 * @returns A unique UUID string
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Hash a PIN using bcrypt with salt rounds of 10
 * @param pin - The plain text PIN to hash
 * @returns A promise that resolves to the hashed PIN
 */
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

/**
 * Verify a PIN against a hash using bcrypt
 * @param pin - The plain text PIN to verify
 * @param hash - The bcrypt hash to compare against
 * @returns A promise that resolves to true if the PIN matches, false otherwise
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}
