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
    adminUsername: string;
    adminPassword: string;
  };
  urls: {
    presignedUrlExpirySeconds: number;
  };
  devServer: {
    port: number;
    viteUrl: string;
  };
} {
  const bucketName = process.env.VITE_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("Configuration Error: VITE_S3_BUCKET_NAME environment variable is not set.");
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("Configuration Error: JWT_SECRET environment variable is not set.");
  }

  // Determine mode
  const isRemoteDataMode = process.env.VITE_USE_REMOTE_DATA === 'true';

  // Load Admin Credentials conditionally
  let adminUsername: string;
  let adminPassword;

  if (isRemoteDataMode) {
    // In remote mode, require environment variables
    adminUsername = process.env.ADMIN_USERNAME!;
    if (!adminUsername) {
      throw new Error("Configuration Error: ADMIN_USERNAME environment variable is required when VITE_USE_REMOTE_DATA is true.");
    }
    adminPassword = process.env.ADMIN_PASSWORD!;
    if (!adminPassword) {
      logger.warn("Security Info: ADMIN_PASSWORD environment variable is not set. Using default 'password123' for demo/local development.");
      adminPassword = 'password123'; // Default for demo/local ONLY
    }
  } else {
    // In local/demo mode, use env vars if set, otherwise default
    adminUsername = 'admin';
    adminPassword = 'password123';
    logger.info('Running in local/demo mode, using default admin credentials.');
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

  // Dev Server Config
  const viteDevServerUrl = process.env.VITE_DEV_SERVER_URL || '';

  const apiPortRaw = process.env.API_PORT;
  let apiPort = 3001; // Default port
  if (apiPortRaw) {
    const parsed = parseInt(apiPortRaw, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed < 65536) {
      apiPort = parsed;
    } else {
      console.warn(`Invalid API_PORT value: "${apiPortRaw}". Using default ${apiPort}.`);
    }
  }

  return {
    s3: {
      bucketName,
    },
    auth: {
      jwtSecret,
      adminUsername,
      adminPassword,
    },
    urls: {
      presignedUrlExpirySeconds,
    },
    devServer: {
      port: apiPort,
      viteUrl: viteDevServerUrl,
    }
  };
}

export const config = loadConfig();

logger.info("Configuration loaded successfully.");
if (process.env.NODE_ENV !== 'production') {
  logger.info(`Bucket Name: ${config.s3.bucketName}`);
}
