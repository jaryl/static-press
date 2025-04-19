import { handleLogin } from '../../../lib/api-logic/handlers/auth';
import { createResponse } from '../../../lib/digital-ocean/helpers';

/**
 * DigitalOcean Serverless Function for user authentication using the event/context signature.
 * Handles POST requests, expecting parameters directly on the event object.
 * @param {object} event - The event object containing request parameters (e.g., event.username, event.password).
 * @param {object} context - The context object containing function metadata.
 * @returns {object} Response object with statusCode, headers, and body.
 */
async function main(event, context) {
  console.log(`[Auth] Function Version: ${context?.functionVersion}`);
  // Log received event keys to help debugging parameter passing
  console.log(`[Auth] Received event with keys: ${Object.keys(event || {}).join(', ')}`);

  try {
    // Extract parameters directly from the event object
    const username = event?.username;
    const password = event?.password;

    // Construct the body object expected by handleLogin
    const requestBody = { username, password };

    console.log(`[Auth] Calling handleLogin with username: ${username ? 'present' : 'missing'}`);

    // Call the core handler (which is now async)
    const result = await handleLogin(requestBody);

    // Return the result - structure matches DO Functions expectations
    const response = createResponse(result.statusCode, result.body, result.headers);

    return response;

  } catch (error) {
    // Catch errors from handleLogin or other synchronous code
    console.error('[Auth] Error during request processing:', error.message || error);
    return createResponse(500, { message: `Internal Server Error: ${error.message}` });
  }
}

export { main };
