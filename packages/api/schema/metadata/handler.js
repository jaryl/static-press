// packages/api/schema/metadata/handler.js
// This function specifically handles fetching metadata for the schema.json file.

import { getSchemaMetadata } from '../../../lib/api-logic/handlers/schema.ts'; // Assuming build process handles .ts
import { authenticateRequest } from '../../../lib/api-logic/handlers/auth.ts'; // Assuming build process handles .ts

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
 * Handles error responses for the metadata function
 * @param {Error} error - The error that occurred
 * @returns {object} Formatted error response
 */
function handleError(error) {
  console.error(`[Schema Meta] Error in schema metadata function:`, error.message || error);

  let statusCode = 500;
  let message = 'Internal Server Error retrieving schema metadata';

  // Check if it's an authentication error from our utility
  if (error.message.startsWith('Unauthorized:') || error.message.startsWith('Forbidden:')) {
    statusCode = error.message.startsWith('Forbidden:') ? 403 : 401;
    message = error.message;
  } else if (error.errorType) { // Check for custom error types from getSchemaMetadata
    statusCode = error.statusCode || 500; // Use status code if provided by the core logic
    message = error.message || 'Failed to retrieve schema metadata.';
  }

  // Return a structured error matching the core logic's format
  return createResponse(statusCode, {
    errorType: error.errorType || 'INTERNAL_ERROR',
    message
  });
}

/**
 * DigitalOcean Serverless Function for schema metadata (Protected)
 * Handles GET requests to /api/schema/metadata
 * @param {object} event - The event object containing request parameters and metadata
 * @param {object} context - The context object containing function metadata
 * @returns {object} Response object with statusCode, headers, and body
 */
async function main(event, context) {
  console.log(`[Schema Meta] Function Version: ${context?.functionVersion}`);
  console.log(`[Schema Meta] Received event with keys: ${Object.keys(event || {}).join(', ')}`);

  try {
    // --- Authentication Check ---
    const decodedToken = await authenticateRequest(event);
    console.log(`[Schema Meta] Authenticated user: ${decodedToken.sub}`);
    // ---------------------------

    // Determine the HTTP method from event
    const method = event.httpMethod?.toUpperCase() || event.requestContext?.http?.method?.toUpperCase() || 'GET'; // Adapt for different event structures
    console.log(`[Schema Meta] Received ${method} /api/schema/metadata`);

    if (method !== 'GET') {
      return createResponse(405,
        { message: 'Method Not Allowed. Only GET is supported for schema metadata.' },
        { 'Allow': 'GET' }
      );
    }

    // Call the core logic function
    const result = await getSchemaMetadata();

    // Return the result with the appropriate response format
    // The core logic function already returns statusCode and body structure
    return createResponse(result.statusCode, result.body, result.headers);

  } catch (error) {
    // Handle potential errors from authenticateRequest or unexpected issues
    return handleError(error);
  }
}

export { main };
