import dotenv from "dotenv";
dotenv.config();

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
};

export const env = {
  //  Server Configuration
  NODE_ENV: getEnv("NODE_ENV"),
  PORT: getEnv("PORT", "4000"),
  MONGODB_URI: getEnv("MONGODB_URI"),
  REDIRECT_URL: getEnv("REDIRECT_URL"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
  ACCESS_TTL: Number(getEnv("ACCESS_TTL", "3600000")), // 1 hour in ms
  REFRESH_TTL: Number(getEnv("REFRESH_TTL", "604800000")), // 7 days in ms
  MAX_RATE_LIMIT: Number(getEnv("MAX_RATE_LIMIT", "100")),
  BCRYPT_SALT_ROUNDS: Number(getEnv("BCRYPT_SALT_ROUNDS", "10")),
  FRONTEND_URL: process.env.FRONTEND_URL,
  FRONTEND_REDIRECT_URL: process.env.FRONTEND_REDIRECT_URL,
  FRONTEND_DEV_URL: getEnv("FRONTEND_DEV_URL", "http://localhost:3000"),
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  URL_ANALYTICS_MAX: Number(getEnv("URL_ANALYTICS_MAX", "100")),
  URL_CACHE_TTL_SECONDS: Number(getEnv("URL_CACHE_TTL_SECONDS", "3600")),
  //  Email Configuration
  EMAIL_SMTP_SERVICE: process.env.EMAIL_SMTP_SERVICE,
  EMAIL_SMTP_HOST: getEnv("EMAIL_SMTP_HOST"),
  EMAIL_SMTP_PORT: Number(getEnv("EMAIL_SMTP_PORT")),
  EMAIL_SMTP_SECURE: getEnv("EMAIL_SMTP_SECURE", "false") === "true",
  EMAIL_SMTP_USER: getEnv("EMAIL_SMTP_USER"),
  EMAIL_SMTP_PASS: getEnv("EMAIL_SMTP_PASS"),
  EMAIL_FROM_NAME: getEnv("EMAIL_FROM_NAME"),
  EMAIL_FROM_ADDRESS: getEnv("EMAIL_FROM_ADDRESS"),
  //  Redis Configuration
  REDIS_USERNAME: process.env.REDIS_USERNAME,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_HOST: getEnv("REDIS_HOST", "127.0.0.1"),
  REDIS_PORT: Number(getEnv("REDIS_PORT", "6379")),
  REDIS_CACHE_PREFIX: getEnv("REDIS_CACHE_PREFIX", "app"),
  // Logging Configuration
  LOGGLY_TOKEN: getEnv("LOGGLY_TOKEN"),
  LOGGLY_SUBDOMAIN: getEnv("LOGGLY_SUBDOMAIN"),
  LOGGLY_TAGS: getEnv("LOGGLY_TAGS")
    ? getEnv("LOGGLY_TAGS")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : ["loggly"],
  LOGGLY_SERVICE_NAME: getEnv("LOGGLY_SERVICE_NAME", "api"),
};
