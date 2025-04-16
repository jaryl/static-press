// packages/utils/auth.js
const jwt = require('jsonwebtoken');

// IMPORTANT: Use the SAME secret as your login handler and dev middleware!
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Authenticates a request based on the JWT in the Authorization header.
 * Assumes DigitalOcean Functions header format.
 * @param {Object} args - The arguments passed to the serverless function.
 * @returns {Promise<Object>} The decoded JWT payload if authentication succeeds.
 * @throws {Error} If authentication fails (no token, invalid token, expired token).
 */
async function authenticateRequest(args) {
  // Extract headers (adjust key based on serverless provider if needed)
  const headers = args.__ow_headers || {};
  const authHeader = headers['authorization'];

  if (!authHeader) {
    throw new Error('Unauthorized: No Authorization header provided.');
  }

  // Token format is 'Bearer YOUR_TOKEN'
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== 'bearer') {
    throw new Error('Unauthorized: Malformed Authorization header.');
  }
  const token = tokenParts[1];

  if (!token) {
    throw new Error('Unauthorized: No token provided in Authorization header.');
  }

  try {
    // Verify the token using a Promise wrapper for async/await
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
          console.error('[Auth Util] Token verification failed:', err.message);
          // Provide a more specific error based on the JWT error type
          if (err.name === 'TokenExpiredError') {
            return reject(new Error('Forbidden: Token expired.'));
          } else if (err.name === 'JsonWebTokenError') {
            return reject(new Error('Forbidden: Invalid token.'));
          } else {
            return reject(new Error('Forbidden: Token verification failed.'));
          }
        }
        resolve(user);
      });
    });
    return decoded; // Return the payload on success
  } catch (error) {
    // Re-throw the specific error from the Promise rejection
    throw error;
  }
}

module.exports = { authenticateRequest };
