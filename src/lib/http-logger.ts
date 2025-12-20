import morgan from "morgan";
import json from "morgan-json-fixed";
import logger from "./winston-logger";

/**
 * Optional: If you already set req.id somewhere else, keep it.
 * Otherwise, Morgan can log x-request-id header.
 */
const format = json({
  method: ":method",
  url: ":url",
  status: ":status",
  contentLength: ":res[content-length]",
  responseTime: ":response-time",
  userAgent: ":user-agent",
  referrer: ":referrer",
  remoteAddress: ":remote-addr",
  // request correlation id
  requestId: ":req[x-request-id]",
});

/**
 * Redact helper (avoid logging secrets)
 */
function redactHeaderValue(value: unknown) {
  if (!value) return undefined;
  return "[REDACTED]";
}

type MorganLogShape = {
  method?: string;
  url?: string;
  status?: string;
  contentLength?: string;
  responseTime?: string;
  userAgent?: string;
  referrer?: string;
  remoteAddress?: string;
  requestId?: string;
};

export const httpLogger = morgan(format as unknown as string, {
  stream: {
    write: (message: string) => {
      // morgan-json returns a JSON string (usually with trailing newline)
      const raw = message.trim();
      if (!raw) return;

      let parsed: MorganLogShape | null = null;
      try {
        parsed = JSON.parse(raw) as MorganLogShape;
      } catch {
        // If parsing fails, log the raw line once
        logger.info("HTTP Access Log", { raw });
        return;
      }

      const status = parsed.status ? Number(parsed.status) : undefined;
      const responseTime = parsed.responseTime
        ? Number(parsed.responseTime)
        : undefined;

      // Keep log line structured
      logger.info("HTTP Access Log", {
        requestId: parsed.requestId,
        method: parsed.method,
        url: parsed.url,
        status,
        contentLength: parsed.contentLength,
        responseTime,
        userAgent: parsed.userAgent,
        referrer: parsed.referrer,
        remoteAddress: parsed.remoteAddress,

        // safety: if you ever add req headers later, redact these
        authorization: redactHeaderValue(undefined),
        cookie: redactHeaderValue(undefined),
      });
    },
  },

  // skip health checks if you want:
  skip: (req) => req.url === "/health",
});
