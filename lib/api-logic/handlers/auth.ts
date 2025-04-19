// src/lib/api-logic/handlers/auth.ts
import * as jose from 'jose';
import { ApiResponse, createSuccessResponse, createErrorResponse } from '../utils/response';
import { config } from '../../config'; // Import centralized config
import { logger } from '../../utils/logger'; // Import the logger

// --- FAKE DATA & CONFIG (Replace with real logic/env vars later) ---
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123'; // In real app, use env vars

// IMPORTANT: Use environment variable for JWT secret
const JWT_EXPIRATION = '8h'; // Token expiration time (e.g., 8 hours)

// Utility to get the secret key as Uint8Array
const getSecretKey = () => {
  const secret = config.auth.jwtSecret;
  return new TextEncoder().encode(secret);
};

interface LoginRequestBody {
  username?: string;
  password?: string;
}

/**
 * Handles user login attempts using jose.
 * Validates credentials and returns a JWT if successful.
 * NOTE: This function is now async due to jose's async nature.
 */
export const handleLogin = async (credentials: LoginRequestBody): Promise<ApiResponse> => {
  // Basic check if credentials object is empty or missing essential fields
  if (!credentials || typeof credentials !== 'object' || Object.keys(credentials).length === 0) {
    return createErrorResponse('Invalid or empty request body.', 400);
  }

  const { username, password } = credentials;

  if (!username || !password) {
    return createErrorResponse('Username and password are required.', 400);
  }

  // --- Replace with actual credential validation logic later ---
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Credentials are valid, generate JWT
    const payload: jose.JWTPayload = {
      username: username,
      role: 'admin',
    };

    try {
      const secretKey = getSecretKey(); // Get key material

      const token = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' }) // Set Algorithm
        .setIssuedAt()                         // Set 'iat' claim
        .setSubject(username)                  // Set 'sub' claim
        .setExpirationTime(JWT_EXPIRATION)     // Set 'exp' claim
        .sign(secretKey);                      // Sign the token (async)

      return createSuccessResponse({ accessToken: token });
    } catch (error: any) {
      logger.error('Error signing JWT with jose', error);
      // Provide a more specific error message if the key was the issue
      if (error.message.includes('JWT_SECRET')) {
        return createErrorResponse('Internal server error: JWT secret misconfiguration.', 500);
      }
      return createErrorResponse('Internal server error: Could not generate token.', 500);
    }
  } else {
    // Invalid credentials
    return createErrorResponse('Invalid username or password.', 401);
  }
};

/**
 * Authenticates a request based on the JWT in the Authorization header.
 * Compatible with DigitalOcean Functions event format.
 * @param args - The arguments passed to the serverless function.
 * @returns The decoded JWT payload if authentication succeeds.
 * @throws Error If authentication fails (no token, invalid token, expired token).
 */
export async function authenticateRequest(args: any): Promise<jose.JWTPayload> {
  let authHeader: string | undefined;

  // Try extracting headers from different possible structures
  if (args?.http?.headers?.authorization) {
    // DigitalOcean Functions new format
    authHeader = args.http.headers.authorization;
  } else if (args?.__ow_headers?.authorization) {
    // Legacy format or simulation
    authHeader = args.__ow_headers.authorization;
  } else if (args?.headers?.authorization) {
    // Direct Express req.headers format
    authHeader = args.headers.authorization;
  }

  if (!authHeader) {
    throw new Error('Unauthorized: No Authorization header provided.');
  }

  // Token format is 'Bearer YOUR_TOKEN'
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== 'bearer') {
    throw new Error('Unauthorized: Malformed Authorization header.');
  }
  const token = tokenParts[1];

  try {
    // Get the secret key
    const secretKey = getSecretKey();

    // Verify the token using jose
    const { payload } = await jose.jwtVerify(token, secretKey, {
      // Optional verification options can be added here
    });

    return payload;
  } catch (error: any) {
    logger.error('Token verification failed', error);

    // Provide a more specific error based on the error type
    if (error.code === 'ERR_JWT_EXPIRED') {
      throw new Error('Forbidden: Token expired.');
    } else if (error.code === 'ERR_JWS_INVALID') {
      throw new Error('Forbidden: Invalid token.');
    } else if (error.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
      throw new Error('Forbidden: Token signature verification failed.');
    } else {
      throw new Error('Forbidden: Token verification failed.');
    }
  }
}
