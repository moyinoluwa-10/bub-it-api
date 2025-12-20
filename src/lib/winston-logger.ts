import fs from "fs";
import path from "path";
import winston from "winston";
import "winston-loggly-bulk";
import { env } from "../config/env";

// Prefer env/config over hardcoding secrets
const LOGGLY_TOKEN = env.LOGGLY_TOKEN;
const LOGGLY_SUBDOMAIN = env.LOGGLY_SUBDOMAIN;
const LOGGLY_TAGS = env.LOGGLY_TAGS;

const isProd = env.NODE_ENV === "production";

const { combine, timestamp, json, errors, splat } = winston.format;

function ensureLogsDir() {
  const dir = path.resolve(process.cwd(), "logs");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
  levels: winston.config.npm.levels,
  format: combine(
    timestamp(),
    errors({ stack: true }), // include stack traces
    splat(),
    json()
  ),
  defaultMeta: {
    service: env.LOGGLY_SERVICE_NAME,
    env: env.NODE_ENV,
  },
  transports: [],
  exitOnError: false,
});

// ---- Production: Loggly (only if fully configured) ----
if (isProd && LOGGLY_TOKEN && LOGGLY_SUBDOMAIN) {
  const LogglyTransport = (winston.transports as any).Loggly;

  logger.add(
    new LogglyTransport({
      level: "info",
      inputToken: LOGGLY_TOKEN,
      subdomain: LOGGLY_SUBDOMAIN,
      tags: LOGGLY_TAGS,
      json: true,
    })
  );

  // Optional: send exceptions/rejections to Loggly too
  logger.exceptions.handle(
    new LogglyTransport({
      level: "error",
      inputToken: LOGGLY_TOKEN,
      subdomain: LOGGLY_SUBDOMAIN,
      tags: [...LOGGLY_TAGS, "exception"],
      json: true,
    })
  );

  logger.rejections.handle(
    new LogglyTransport({
      level: "error",
      inputToken: LOGGLY_TOKEN,
      subdomain: LOGGLY_SUBDOMAIN,
      tags: [...LOGGLY_TAGS, "rejection"],
      json: true,
    })
  );
}

// ---- Non-prod: Console + Files ----
if (!isProd) {
  const logsDir = ensureLogsDir();

  logger.add(
    new winston.transports.Console({
      level: "debug",
      handleExceptions: true,
      format: combine(
        timestamp(),
        errors({ stack: true }),
        splat(),
        winston.format.colorize(),
        winston.format.printf((info) => {
          // readable dev output
          const { timestamp: ts, level, message, ...rest } = info as any;
          const meta = Object.keys(rest).length
            ? ` ${JSON.stringify(rest)}`
            : "";
          return `${ts} ${level}: ${message}${meta}`;
        })
      ),
    })
  );

  logger.add(
    new winston.transports.File({
      level: "error",
      filename: path.join(logsDir, "error.log"),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      level: "info",
      filename: path.join(logsDir, "combined.log"),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    })
  );

  logger.exceptions.handle(
    new winston.transports.File({
      filename: path.join(logsDir, "exceptions.log"),
    })
  );

  logger.rejections.handle(
    new winston.transports.File({
      filename: path.join(logsDir, "rejections.log"),
    })
  );
}

export default logger;
