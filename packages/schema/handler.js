// packages/schema/handler.js
import { getSchema, updateSchema } from '../../lib/api-logic/handlers/schema.js'; // Corrected path
import { authenticateRequest } from '../../lib/api-logic/handlers/auth.js'; // Corrected path

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
 * DigitalOcean Serverless Function for schema GET/PUT operations (Protected)
 * Handles GET and PUT requests targeted directly at the schema resource.
 * Assumes sub-paths like /metadata, /presigned-url are handled elsewhere.
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
    // Use __ow_method if available (DigitalOcean convention)
    const method = event.__ow_method?.toUpperCase() || event.method?.toUpperCase() || 'GET';
    console.log(`[Schema] Received ${method}`);

    let result;

    // Route to the appropriate handler based on HTTP method
    if (method === 'GET') {
      result = await handleGetSchema();
    } else if (method === 'PUT') {
      // For DO Functions, event often contains the parsed body if Content-Type is JSON
      const requestBody = event; // Or event.body depending on platform/invocation
      if (!requestBody || typeof requestBody !== 'object' || Object.keys(requestBody).length === 0) {
        console.error('[Schema] Invalid or missing body for PUT request.');
        return createResponse(400, { message: 'Bad Request: Missing or invalid schema data in request body for PUT.' });
      }
      // Clone and clean potential platform args if necessary
      const schemaData = { ...requestBody };
      delete schemaData.__ow_method;
      delete schemaData.__ow_path;
      delete schemaData.__ow_headers;
      delete schemaData.__ow_query;
      delete schemaData.__ow_body;

      result = await handlePutSchema(schemaData);
    } else {
      // Method not supported by *this* handler
      return createResponse(405,
        { message: `Method Not Allowed. This endpoint only supports GET and PUT.` },
        { 'Allow': 'GET, PUT' }
      );
    }

    // Return the result with the appropriate response format
    return createResponse(result.statusCode, result.body, result.headers);

  } catch (error) {
    return handleError(error, event.__ow_method || event.method);
  }
}

export { main };
