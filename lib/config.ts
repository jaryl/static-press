// lib/config.ts
import { logger } from './utils/logger';

/**
 * Loads and validates required environment variables.
 * Throws an error if any required variable is missing.
 */
function loadConfig() {
  const bucketName = process.env.VITE_S3_BUCKET_NAME;
  const jwtSecret = process.env.JWT_SECRET;

  if (!bucketName) {
    throw new Error("Configuration Error: S3_BUCKET_NAME environment variable is not set.");
  }

  if (!jwtSecret) {
    throw new Error("Configuration Error: JWT_SECRET environment variable is not set.");
  }

  // Add other required variables here in the future

  return {
    s3: {
      bucketName: bucketName,
    },
    auth: {
      jwtSecret: jwtSecret,
      // jwtExpiration: '8h', // Could add expiration here too
    },
    // Add other config sections as needed
  };
}

export const config = loadConfig();

// Log confirmation (optional, good for debugging startup)
logger.info("Configuration loaded successfully.");
if (process.env.NODE_ENV !== 'production') {
  logger.info(`Bucket Name: ${config.s3.bucketName}`);
  // Avoid logging secrets, even in dev
}
