// dev-api/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';

// IMPORTANT: Use the SAME secret as your login handler!
const JWT_SECRET = process.env.JWT_SECRET;

// Check if JWT_SECRET is defined
if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is not set. Authentication will fail.');
  // In a production app, you might want to throw an error here to prevent startup
  // throw new Error('JWT_SECRET environment variable is required');
}

// Extend Express Request type to include 'user' property
// This avoids TypeScript errors when attaching the decoded payload
declare global {
  namespace Express {
    interface Request {
      user?: any; // Or define a more specific type for your payload
    }
  }
}

// Refactored to use async/await
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    // No token provided - End the cycle
    res.status(401).json({ message: 'Unauthorized: No token provided.' });
    return; // Explicitly return to satisfy void promise type
  }

  try {
    // Promisify jwt.verify
    const user = await new Promise((resolve, reject) => {
      // Ensure JWT_SECRET is defined before using it
      if (!JWT_SECRET) {
        return reject(new Error('JWT_SECRET is not configured. Authentication cannot proceed.'));
      }

      jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) {
          return reject(err);
        }
        resolve(decoded);
      });
    });

    // Token is valid, attach payload to request object
    req.user = user;
    next(); // Proceed to the next middleware or route handler

  } catch (err: any) {
    // Token is invalid (bad signature, expired, etc.)
    console.error('[Auth Middleware] Token verification failed:', err.message);
    // End the cycle
    res.status(403).json({ message: 'Forbidden: Invalid or expired token.' });
    // No explicit return needed here as res.status().json() ends the cycle
  }
};
