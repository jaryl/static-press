// src/lib/api-logic/handlers/auth.ts
import jwt from 'jsonwebtoken';

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
// -------------------------------------------------------------------

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
 * Handles user login attempts.
 * Validates credentials and returns a JWT if successful.
 */
export const handleLogin = (body: string | null): ApiResponse => {
  let credentials: LoginRequestBody;
  try {
    credentials = body ? JSON.parse(body) : {};
  } catch (error) {
    return {
      statusCode: 400,
      body: { message: 'Invalid request body: Malformed JSON.' },
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
    const payload = {
      sub: username, // Subject (usually user ID or username)
      role: 'admin', // Example custom claim for role
      // iat (issued at) is added automatically
    };

    try {
      // Ensure JWT_SECRET is defined before using it
      if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured. Authentication cannot proceed.');
      }

      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRATION,
        algorithm: 'HS256',
      });

      return {
        statusCode: 200,
        body: { accessToken: token },
        headers: {
          'Content-Type': 'application/json',
        },
      };
    } catch (error) {
      console.error('[API Logic Auth] Error signing JWT:', error);
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
