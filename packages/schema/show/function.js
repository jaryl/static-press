import { getSchema, updateSchema } from '../../../lib/api-logic/handlers/schema';
import { authenticateRequest } from '../../../lib/api-logic/handlers/auth';
import { createResponse, handleError } from '../../../lib/digital-ocean/helpers';

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
 * DigitalOcean Serverless Function for schema GET/PUT operations (Protected)
 * Handles GET and PUT requests targeted directly at the schema resource.
 * Assumes sub-paths like /metadata, /presigned-url are handled elsewhere.
 * @param {object} event - The event object containing request parameters and metadata
 * @param {object} context - The context object containing function metadata
 * @returns {object} Response object with statusCode, headers, and body
 */
async function main(event, context) {
  try {
    // --- Authentication Check ---
    // Pass the event directly to authenticateRequest which now handles headers properly
    const decodedToken = await authenticateRequest(event);
    console.log(`[Schema] Authenticated user: ${decodedToken.sub}`);
    // ---------------------------

    // Determine the HTTP method from event
    const method = event.http.method?.toUpperCase();

    let result;

    // Route to the appropriate handler based on HTTP method
    if (method === 'GET') {
      result = await handleGetSchema();
    } else if (method === 'PUT') {

      // For DO Functions, event often contains the parsed body if Content-Type is JSON
      const requestBody = event; // Or event.body depending on platform/invocation

      // if (!requestBody || typeof requestBody !== 'object' || Object.keys(requestBody).length === 0) {
      //   console.error('[Schema] Invalid or missing body for PUT request.');
      //   return createResponse(400, { message: 'Bad Request: Missing or invalid schema data in request body for PUT.' });
      // }

      result = await handlePutSchema(requestBody);
    } else {
      // Method not supported by *this* handler
      result = { statusCode: 405, body: JSON.stringify({ message: `Method Not Allowed. This endpoint only supports GET and PUT, got ${method}.` }), headers: { 'Content-Type': 'application/json' } };
    }

    // Return the result with the appropriate response format
    return createResponse(result.statusCode, result.body, result.headers);

  } catch (error) {
    console.error('[Auth] Error during request processing:', error.message || error);
    return handleError(error, method);
  }
}

export { main };
