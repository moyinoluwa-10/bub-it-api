import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { UnauthenticatedError } from "../errors";
import { Types } from "mongoose";

export interface TokenUser {
  userId: string;
  role: string;
  refreshToken?: string;
}

interface JwtTokenPayload extends JwtPayload, TokenUser {}

/**
 * Sign an access token with a minimal payload.
 */
export function signAccessToken(payload: TokenUser): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TTL,
  });
}

/**
 * Sign a refresh token with a minimal payload.
 */
export function signRefreshToken(
  payload: TokenUser,
  refreshToken: string
): string {
  return jwt.sign({ ...payload, refreshToken }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TTL,
  });
}

/**
 * Verify an access token and return the typed payload.
 */
export function verifyAccessToken(token: string): JwtTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  if (typeof decoded === "string") {
    throw new UnauthenticatedError("Invalid token payload");
  }
  return decoded as JwtTokenPayload;
}

/**
 * Verify a refresh token and return the typed payload.
 */
export function verifyRefreshToken(token: string): JwtTokenPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  if (typeof decoded === "string") {
    throw new UnauthenticatedError("Invalid token payload");
  }
  return decoded as JwtTokenPayload;
}

/**
 * Create the minimal user payload to embed in tokens.
 */
export function createTokenUser(user: {
  _id: Types.ObjectId;
  role: string;
}): TokenUser {
  return {
    userId: user._id.toString(),
    role: user.role,
  };
}
