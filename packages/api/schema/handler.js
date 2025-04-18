// packages/api/schema/handler.js
import { getSchema, updateSchema } from '../../../lib/api-logic/handlers/schema.js';
import { authenticateRequest } from '../../../lib/api-logic/handlers/auth.js';

/**
 * Handles GET request for schema
 * @returns {Promise<object>} Result from getSchema
 */
async function handleGetSchema() {
  return await getSchema();
}

/**
 * Handles PUT request for schema
 * @param {object|string} body - The schema data to update
 * @returns {Promise<object>} Result from updateSchema
 */
async function handlePutSchema(body) {
  // Parse the schema data if it's a string
  const schemaData = typeof body === 'string'
    ? JSON.parse(body)
    : body;

  return await updateSchema(schemaData);
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
  console.error(`[Schema] Error in schema ${method} function:`, error.message || error);

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
 * DigitalOcean Serverless Function for schema operations (Protected)
 * Handles GET and PUT requests to /api/schema
 * @param {object} event - The event object containing request parameters and metadata
 * @param {object} context - The context object containing function metadata
 * @returns {object} Response object with statusCode, headers, and body
 */
async function main(event, context) {
  console.log(`[Schema] Function Version: ${context?.functionVersion}`);
  console.log(`[Schema] Received event with keys: ${Object.keys(event || {}).join(', ')}`);

  try {
    // --- Authentication Check ---
    // Pass the event directly to authenticateRequest which now handles headers properly
    const decodedToken = await authenticateRequest(event);
    console.log(`[Schema] Authenticated user: ${decodedToken.sub}`);
    // ---------------------------

    // Determine the HTTP method from event
    const method = event.method?.toUpperCase() || 'GET';
    console.log(`[Schema] Received ${method} /api/schema`);

    let result;

    // Route to the appropriate handler based on HTTP method
    if (method === 'GET') {
      result = await handleGetSchema();
    } else if (method === 'PUT') {
      result = await handlePutSchema(event.body);
    } else {
      // Method not supported
      return createResponse(405, 
        { message: 'Method Not Allowed. Only GET and PUT are supported for schema.' },
        { 'Allow': 'GET, PUT' }
      );
    }

    // Return the result with the appropriate response format
    return createResponse(result.statusCode, result.body, result.headers);

  } catch (error) {
    return handleError(error, event.method);
  }
}

export { main };
