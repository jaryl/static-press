// dev-api/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';

// IMPORTANT: Use the SAME secret as your login handler!
const JWT_SECRET = process.env.JWT_SECRET;

// Check if JWT_SECRET is defined
if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is not set. Authentication will fail.');
  // In a production app, you might want to throw an error here to prevent startup
  // throw new Error('JWT_SECRET environment variable is required');
}

// Utility to get the secret key as Uint8Array (same as in auth.ts)
const getSecretKey = () => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }
  // jose requires the key material as a Uint8Array
  return new TextEncoder().encode(JWT_SECRET);
};

// Extend Express Request type to include 'user' property
// This avoids TypeScript errors when attaching the decoded payload
declare global {
  namespace Express {
    interface Request {
      user?: any; // Or define a more specific type for your payload
    }
  }
}

// Refactored to use jose for JWT verification
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  try {
    // Get the secret key
    const secretKey = getSecretKey();

    // Verify the token using jose
    const { payload } = await jose.jwtVerify(token, secretKey, {
      // Optional verification options can be added here
    });

    // Attach the decoded payload to the request object
    req.user = payload;
    next();
  } catch (error: any) {
    console.error('[Auth Middleware] Token verification failed:', error.message || error);

    // Provide a more specific error based on the error type
    if (error.code === 'ERR_JWT_EXPIRED') {
      res.status(401).json({ message: 'Unauthorized: Token expired' });
    } else if (error.code === 'ERR_JWS_INVALID' || error.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
      res.status(403).json({ message: 'Forbidden: Invalid token' });
    } else {
      res.status(403).json({ message: 'Forbidden: Token verification failed' });
    }
  }
};
