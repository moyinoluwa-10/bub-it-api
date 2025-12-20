import bcrypt from "bcryptjs";
import { env } from "../config/env";

/**
 * Hash a string value using bcrypt.
 */
export async function hashValue(value: string): Promise<string> {
  const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(value, salt);
}

/**
 * Compare a plain value with a bcrypt hash.
 */
export async function compareHash(
  value: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(value, hash);
}
