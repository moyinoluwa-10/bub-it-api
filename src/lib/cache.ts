import { createClient, RedisClientType } from "redis";
import { env } from "../config/env";
import logger from "../lib/winston-logger";

type CacheValue = unknown;

class Cache {
  private client: RedisClientType | null = null;
  private connecting = false;
  private connected = false;

  private isEnabled(): boolean {
    // You can tighten this rule if you want (e.g. require host+port)
    if (env.NODE_ENV === "test") return false;
    if (!env.REDIS_HOST || !env.REDIS_PORT) return false;
    return true;
  }

  private buildRedisUrl(): string {
    // Username/password may be optional depending on provider
    const hasAuth = Boolean(env.REDIS_USERNAME) || Boolean(env.REDIS_PASSWORD);
    const auth = hasAuth
      ? `${encodeURIComponent(env.REDIS_USERNAME || "")}:${encodeURIComponent(
          env.REDIS_PASSWORD || ""
        )}@`
      : "";

    return `redis://${auth}${env.REDIS_HOST}:${env.REDIS_PORT}`;
  }

  get enabled() {
    // Common toggle: disable in tests
    if (env.NODE_ENV === "test") return false;
    return Boolean(env.REDIS_HOST && env.REDIS_PORT && this.connected);
  }

  async connect(): Promise<void> {
    if (!this.isEnabled()) {
      logger.info("Cache disabled (env/test or missing redis config)");
      return;
    }

    if (this.client) return;
    if (this.connecting) return;

    this.connecting = true;

    try {
      const url = this.buildRedisUrl();

      const client: RedisClientType = createClient({
        url,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries >= 3) {
              logger.error("Redis reconnect failed after 3 attempts");
              this.connected = false;
              return new Error("Redis reconnect failed");
            }
            const delay = Math.min(1000 * retries, 3000);
            logger.warn("Redis reconnect", { retries, delay });

            return delay;
          },
        },
      });

      client.on("connect", () => {
        logger.info("Redis socket connected");
        this.connected = true;
      });
      client.on("ready", () => logger.info("Redis ready"));
      client.on("end", () => {
        logger.warn("Redis connection ended");
        this.connected = false;
      });
      client.on("error", (err) => logger.error("Redis error", { err }));

      await client.connect();
      this.client = client;

      logger.info("Redis connected");
    } catch (err) {
      logger.error("Failed to connect Redis", { err });
      this.client = null;
    } finally {
      this.connecting = false;
    }
  }

  private async ensure(): Promise<RedisClientType | null> {
    if (!this.enabled) return null;
    await this.connect();
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    const c = await this.ensure();
    if (!c) return null;
    return c.get(key);
  }

  async setEx(key: string, ttlSeconds: number, value: string): Promise<void> {
    const c = await this.ensure();
    if (!c) return;
    await c.setEx(key, ttlSeconds, value);
  }

  async del(...keys: string[]): Promise<void> {
    const c = await this.ensure();
    if (!c) return;
    if (keys.length === 0) return;
    await c.del(keys);
  }

  async getJson<T = CacheValue>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      // If corrupted, delete and treat as miss
      await this.del(key);
      return null;
    }
  }

  async setJson(
    key: string,
    ttlSeconds: number,
    value: CacheValue
  ): Promise<void> {
    await this.setEx(key, ttlSeconds, JSON.stringify(value));
  }

  async disconnect(): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.quit();
      this.client = null;
      this.connected = false;
      logger.info("Redis disconnected");
    } catch (err) {
      logger.error("Error disconnecting Redis", { err });
      this.client = null;
    }
  }
}

export const cache = new Cache();
