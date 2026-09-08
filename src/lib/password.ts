import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

/**
 * Password hashing for the mock account store. Uses Node's built-in scrypt (no native
 * dependency required) with a random salt per password and a constant-time comparison on
 * verify. A production deployment backed by a real auth provider (Auth.js, Clerk, Cognito,
 * etc.) would delegate this entirely to that provider instead of hashing locally.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, hashHex] = parts;
  const storedBuffer = Buffer.from(hashHex, "hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  if (derivedKey.length !== storedBuffer.length) return false;
  return timingSafeEqual(derivedKey, storedBuffer);
}
