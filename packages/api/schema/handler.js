// packages/default/schema/handler.js
import { getSchema, updateSchema } from '../../../lib/api-logic/handlers/schema.js';
import { authenticateRequest } from '../../../lib/api-logic/handlers/auth.js';

/**
 * DigitalOcean Serverless Function for schema operations (Protected)
 * Handles both GET and PUT requests to /api/schema
 * @param {Object} args - Parameters passed to the function
 * @returns {Object} Response object with statusCode and body
 */
async function main(args) {
  try {
    // --- Authentication Check ---
    const decodedToken = await authenticateRequest(args);
    console.log(`[Schema] Authenticated user: ${decodedToken.sub}`);
    // ---------------------------

    // Determine the HTTP method
    const method = args.__ow_method ? args.__ow_method.toUpperCase() : 'GET';
    console.log(`[Schema] Received ${method} /api/schema`);

    let result;

    if (method === 'GET') {
      // Handle GET request - retrieve schema
      result = await getSchema();
    } else if (method === 'PUT') {
      // Handle PUT request - update schema
      const schemaData = typeof args.__ow_body === 'string'
        ? JSON.parse(args.__ow_body)
        : args.__ow_body;

      result = await updateSchema(schemaData);
    } else {
      // Method not supported
      return {
        statusCode: 405,
        headers: {
          'Content-Type': 'application/json',
          'Allow': 'GET, PUT'
        },
        body: { message: 'Method Not Allowed. Only GET and PUT are supported for schema.' }
      };
    }

    // Return the result
    return {
      statusCode: result.statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: result.body
    };

  } catch (error) {
    // Handle potential errors, including authentication errors
    console.error(`[Schema] Error in schema ${args.__ow_method} function:`, error.message || error);

    let statusCode = 500;
    let message = 'Internal Server Error';

    // Check if it's an authentication error from our utility
    if (error.message.startsWith('Unauthorized:') || error.message.startsWith('Forbidden:')) {
      statusCode = error.message.startsWith('Forbidden:') ? 403 : 401;
      message = error.message;
    }

    return {
      statusCode: statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: { message: message }
    };
  }
}

module.exports = { main };
