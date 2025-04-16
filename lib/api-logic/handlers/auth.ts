// src/lib/api-logic/handlers/auth.ts
import * as jose from 'jose';

// --- FAKE DATA & CONFIG (Replace with real logic/env vars later) ---
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123'; // In real app, use env vars

// IMPORTANT: Use environment variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = '8h'; // Token expiration time (e.g., 8 hours)

// Check if JWT_SECRET is defined
if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is not set. Authentication will fail.');
  // In a production app, you might want to throw an error here to prevent startup
  // throw new Error('JWT_SECRET environment variable is required');
}

// Utility to get the secret key as Uint8Array
const getSecretKey = () => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }
  // jose requires the key material as a Uint8Array
  return new TextEncoder().encode(JWT_SECRET);
};

interface LoginRequestBody {
  username?: string;
  password?: string;
}

interface ApiResponse {
  statusCode: number;
  body: { [key: string]: any };
  headers?: { [key: string]: string };
}

/**
 * Handles user login attempts using jose.
 * Validates credentials and returns a JWT if successful.
 * NOTE: This function is now async due to jose's async nature.
 */
export const handleLogin = async (credentials: LoginRequestBody): Promise<ApiResponse> => {
  // Basic check if credentials object is empty or missing essential fields
  if (!credentials || typeof credentials !== 'object' || Object.keys(credentials).length === 0) {
    return {
      statusCode: 400,
      body: { message: `Invalid or empty request body.` },
    };
  }

  const { username, password } = credentials;

  if (!username || !password) {
    return {
      statusCode: 400,
      body: { message: 'Username and password are required.' },
    };
  }

  // --- Replace with actual credential validation logic later ---
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Credentials are valid, generate JWT
    const payload: jose.JWTPayload = {
      role: 'admin', // Example custom claim
      // 'sub' will be set via .setSubject()
      // 'iat' will be set via .setIssuedAt()
      // 'exp' will be set via .setExpirationTime()
    };

    try {
      const secretKey = getSecretKey(); // Get key material

      const token = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' }) // Set Algorithm
        .setIssuedAt()                         // Set 'iat' claim
        .setSubject(username)                  // Set 'sub' claim
        .setExpirationTime(JWT_EXPIRATION)     // Set 'exp' claim
        .sign(secretKey);                      // Sign the token (async)

      return {
        statusCode: 200,
        body: { accessToken: token },
        headers: {
          'Content-Type': 'application/json',
        },
      };
    } catch (error: any) {
      console.error('[API Logic Auth] Error signing JWT with jose:', error.message || error);
      // Provide a more specific error message if the key was the issue
      if (error.message.includes('JWT_SECRET')) {
        return { statusCode: 500, body: { message: 'Internal server error: JWT secret misconfiguration.' } };
      }
      return {
        statusCode: 500,
        body: { message: 'Internal server error: Could not generate token.' },
      };
    }
  } else {
    // Invalid credentials
    return {
      statusCode: 401,
      body: { message: 'Invalid username or password.' },
    };
  }
};
