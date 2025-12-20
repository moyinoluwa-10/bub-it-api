import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import hpp from "hpp";
import compression from "compression";
import { errorHandler } from "./middleware/errorHandler";
import { env } from "./config/env";
import { notFound } from "./middleware/notFound";
import path from "path";
import cookieParser from "cookie-parser";
import { rateLimiter } from "./middleware/rateLimiter";
import { httpLogger } from "./lib/http-logger";
import { authRouter } from "./modules/auth/auth.routes";
import { urlRouter } from "./modules/url/url.routes";
import { userRouter } from "./modules/user/user.routes";
import { mongoSanitize } from "./middleware/mongoSanitize";
import { redirectRouter } from "./modules/redirect/redirect.routes";
import { StatusCodes } from "http-status-codes";

function getHost(input: string): string {
  if (!input) return "";
  if (!/^https?:\/\//i.test(input)) return input.toLowerCase();
  try {
    return new URL(input).hostname.toLowerCase();
  } catch {
    return "";
  }
}

const isProd = env.NODE_ENV === "production";

export const createApp = (): Application => {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  const allowedOrigins = [env.FRONTEND_URL].filter(Boolean);
  const corsOptions = {
    origin(
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    maxAge: 600,
    credentials: true,
  };
  app.use(cors(corsOptions));
  app.options(/.*/, cors(corsOptions));

  if (env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
  }
  app.use(httpLogger);

  app.use(
    express.json({
      limit: "100kb",
    })
  );
  app.use(mongoSanitize);
  app.use(hpp());
  app.use(compression());
  app.use(express.static(path.resolve(process.cwd(), "public")));
  app.use(cookieParser(env.JWT_SECRET));
  if (isProd) {
    app.use((req, res, next) => {
      const host = (req.hostname || "").toLowerCase();
      if (host === getHost(env.REDIRECT_URL))
        return redirectRouter(req, res, next);
      if (host === getHost(env.API_URL)) return next();
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid host header",
      });
    });
  } else {
    app.use("/r", redirectRouter);
  }

  app.use("/api", rateLimiter);

  //  Route handlers
  app.use("/api/auth", authRouter);
  app.use("/api/urls", urlRouter);
  app.use("/api/users", userRouter);

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: "Welcome to the Bub-It API",
    });
  });

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
