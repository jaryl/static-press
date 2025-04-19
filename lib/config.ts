// lib/config.ts
import { logger } from './utils/logger';

/**
 * Loads and validates the necessary configuration from environment variables.
 */
function loadConfig(): {
  s3: {
    bucketName: string;
  };
  auth: {
    jwtSecret: string;
  };
  urls: {
    presignedUrlExpirySeconds: number;
  }
} {
  const bucketName = process.env.VITE_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("Configuration Error: VITE_S3_BUCKET_NAME environment variable is not set.");
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("Configuration Error: JWT_SECRET environment variable is not set.");
  }

  // Load URL expiry, providing a default
  const presignedUrlExpirySecondsRaw = process.env.VITE_PRESIGNED_URL_EXPIRY_SECONDS;
  let presignedUrlExpirySeconds = 3600; // Default to 1 hour
  if (presignedUrlExpirySecondsRaw) {
    const parsed = parseInt(presignedUrlExpirySecondsRaw, 10);
    if (!isNaN(parsed) && parsed > 0) {
      presignedUrlExpirySeconds = parsed;
    } else {
      console.warn(`Invalid VITE_PRESIGNED_URL_EXPIRY_SECONDS value: "${presignedUrlExpirySecondsRaw}". Using default ${presignedUrlExpirySeconds}s.`);
    }
  }

  return {
    s3: {
      bucketName,
    },
    auth: {
      jwtSecret,
    },
    urls: {
      presignedUrlExpirySeconds,
    }
  };
}

export const config = loadConfig();

// Log confirmation (optional, good for debugging startup)
logger.info("Configuration loaded successfully.");
if (process.env.NODE_ENV !== 'production') {
  logger.info(`Bucket Name: ${config.s3.bucketName}`);
  // Avoid logging secrets, even in dev
}
