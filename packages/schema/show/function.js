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
async function main(event, _) {
  try {
    // --- Authentication Check ---
    // Pass the event directly to authenticateRequest which now handles headers properly
    const decodedToken = await authenticateRequest(event);
    console.log(`[Schema] Authenticated user: ${decodedToken.sub}`);
    // ---------------------------

    // Determine the HTTP method from event
    const method = event.http.method?.toUpperCase();

    // Route to the appropriate handler based on HTTP method
    if (method === 'GET') {
      return await handleGetSchema();
    } else if (method === 'PUT') {
      return await handlePutSchema(event.http.body);
    }

    return { statusCode: 405, body: JSON.stringify({ message: `Method Not Allowed. This endpoint only supports GET and PUT, got ${method}.` }), headers: { 'Content-Type': 'application/json' } };
  } catch (error) {
    console.error('[Auth] Error during request processing:', error.message || error);
    return handleError(error, method);
  }
}

export { main };
