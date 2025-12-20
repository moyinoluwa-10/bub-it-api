import { Response } from "express";
import { cookiesConfig } from "../config/cookies";
import { env } from "../config/env";
import { signAccessToken, signRefreshToken, TokenUser } from "./jwt";

/**
 * Attach cookies to response object
 */
export function attachCookiesToResponse({
  res,
  user,
  refreshToken,
}: {
  res: Response;
  user: TokenUser;
  refreshToken: string;
}): void {
  const accessTokenJWT = signAccessToken(user);
  const refreshTokenJWT = signRefreshToken(user, refreshToken);
  res.cookie("accessToken", accessTokenJWT, cookiesConfig(env.ACCESS_TTL));
  res.cookie("refreshToken", refreshTokenJWT, cookiesConfig(env.REFRESH_TTL));
}
