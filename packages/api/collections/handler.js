// packages/api/collections/handler.js
import { updateCollection } from '../../../lib/api-logic/handlers/collection.js';
import { authenticateRequest } from '../../../lib/api-logic/handlers/auth.js';

/**
 * Handles PUT request for collection data
 * @param {string} slug - The collection slug
 * @param {object|string} body - The collection data to update
 * @returns {Promise<object>} Result from updateCollection
 */
async function handlePutCollection(slug, body) {
  // Parse the collection data if it's a string
  const recordsData = typeof body === 'string'
    ? JSON.parse(body)
    : body;

  return await updateCollection(slug, recordsData);
}

/**
 * Creates a properly formatted response object
 * @param {number} statusCode - HTTP status code
 * @param {object} body - Response body
 * @param {object} [headers={}] - Additional headers
 * @returns {object} Formatted response object
 */
function createResponse(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  };
}

/**
 * Handles error responses
 * @param {Error} error - The error that occurred
 * @param {string} method - The HTTP method being processed
 * @returns {object} Formatted error response
 */
function handleError(error, method) {
  console.error(`[Collections] Error in collections ${method} function:`, error.message || error);

  let statusCode = 500;
  let message = 'Internal Server Error';

  // Check if it's an authentication error from our utility
  if (error.message.startsWith('Unauthorized:') || error.message.startsWith('Forbidden:')) {
    statusCode = error.message.startsWith('Forbidden:') ? 403 : 401;
    message = error.message;
  }

  return createResponse(statusCode, { message });
}

/**
 * DigitalOcean Serverless Function for collection operations (Protected)
 * Handles PUT requests to /api/collections/:slug
 * @param {object} event - The event object containing request parameters and metadata
 * @param {object} context - The context object containing function metadata
 * @returns {object} Response object with statusCode, headers, and body
 */
async function main(event, context) {
  console.log(`[Collections] Function Version: ${context?.functionVersion}`);
  console.log(`[Collections] Received event with keys: ${Object.keys(event || {}).join(', ')}`);

  try {
    // --- Authentication Check ---
    // Pass the event directly to authenticateRequest which now handles headers properly
    const decodedToken = await authenticateRequest(event);
    console.log(`[Collections] Authenticated user: ${decodedToken.sub}`);
    // ---------------------------

    // Extract the slug from the path or params
    const slug = event.slug || event.pathParameters?.slug;

    if (!slug) {
      return createResponse(400, { message: 'Missing collection slug in path' });
    }

    // Determine the HTTP method from event
    const method = event.method?.toUpperCase() || 'GET';
    console.log(`[Collections] Received ${method} /api/collections/${slug}`);

    // We only support PUT for collections via the API
    if (method !== 'PUT') {
      return createResponse(405,
        { message: 'Method Not Allowed. Only PUT is supported for collections.' },
        { 'Allow': 'PUT' }
      );
    }

    // Handle PUT request
    const result = await handlePutCollection(slug, event.body);

    // Return the result with the appropriate response format
    return createResponse(result.statusCode, result.body, result.headers);

  } catch (error) {
    return handleError(error, event.method);
  }
}

export { main };
