import rateLimit from "express-rate-limit";
import { env } from "../config/env";

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.MAX_RATE_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});
