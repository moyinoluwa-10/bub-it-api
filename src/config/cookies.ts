import { env } from "../config/env";

export interface CookieConfigOptions {
  httpOnly: boolean;
  secure: boolean;
  signed: boolean;
  expires: Date;
  sameSite: "lax" | "strict" | "none";
  domain?: string;
}

export const cookiesConfig = (lifetimeMs: number): CookieConfigOptions => {
  const cookieConfig: CookieConfigOptions = {
    httpOnly: true,
    secure: env.NODE_ENV !== "test",
    signed: true,
    expires: new Date(Date.now() + lifetimeMs),
    sameSite: "lax",
  };

  // Only set domain explicitly in production
  if (env.NODE_ENV === "production" && env.COOKIE_DOMAIN) {
    cookieConfig.domain = env.COOKIE_DOMAIN;
  }

  return cookieConfig;
};
