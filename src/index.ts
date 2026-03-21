import { createApp } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { cache } from "./lib/cache";
import logger from "./lib/winston-logger";

// start the server
const start = async () => {
  await cache.connect();
  await connectDB();
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server is running on http://localhost:${env.PORT}`);
  });

  // Graceful shutdown handler
  const gracefulShutdown = async (signal: string, attempt: number = 1) => {
    logger.warn(`Received ${signal}, attempt ${attempt} of 3`);

    // For development, be more aggressive with shutdown
    if (env.NODE_ENV === "development") {
      logger.info("Development mode: forcing immediate shutdown");
      process.exit(0);
    }

    if (attempt > 3) {
      logger.error(
        "Failed to shutdown gracefully after 3 attempts, forcing exit",
      );
      process.exit(1);
    }

    // Close server from accepting new connections
    server.close(async () => {
      logger.info("Server close callback called");
      try {
        logger.info("HTTP server closed");

        // Close database connection
        await connectDB().catch(() => {}); // Already connected, just ensure it closes
        if (require("mongoose").connection) {
          await require("mongoose").disconnect();
          logger.info("MongoDB disconnected");
        }

        // Close cache connection
        await cache.disconnect();

        logger.info("Graceful shutdown completed");
        process.exit(0);
      } catch (err) {
        logger.error("Error during graceful shutdown", { err });
        gracefulShutdown(signal, attempt + 1);
      }
    });

    // Force shutdown after 2 seconds in development
    const timeout = setTimeout(
      () => {
        logger.error("Shutdown timeout, forcing exit");
        process.exit(1);
      },
      env.NODE_ENV === "development" ? 2000 : 10000,
    );

    timeout.unref();
  };

  // Handle shutdown signals
  process.on("SIGTERM", () => {
    logger.info("SIGTERM received, shutting down immediately");
    process.exit(0);
  });
  process.on("SIGINT", () => {
    logger.info("SIGINT received, shutting down immediately");
    process.exit(0);
  });
  process.on("SIGUSR2", () => {
    logger.info("SIGUSR2 received, shutting down immediately");
    process.exit(0);
  });
};

start().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
