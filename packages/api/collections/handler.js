// packages/default/collections/handler.js
import { updateCollection } from '../../../lib/api-logic/handlers/collection.js';
import { authenticateRequest } from '../../../lib/auth.js';

/**
 * DigitalOcean Serverless Function for collection operations (Protected)
 * Handles PUT requests to /api/collections/:slug
 * @param {Object} args - Parameters passed to the function
 * @returns {Object} Response object with statusCode and body
 */
async function main(args) {
  try {
    // --- Authentication Check ---
    const decodedToken = await authenticateRequest(args);
    console.log(`[Collections] Authenticated user: ${decodedToken.sub}`);
    // ---------------------------

    // Extract the slug from the path parameters
    const pathParts = args.__ow_path.split('/');
    const slug = pathParts.length > 3 ? pathParts[pathParts.length - 1] : null;

    if (!slug) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: { message: 'Missing collection slug in path' }
      };
    }

    // Determine the HTTP method
    const method = args.__ow_method ? args.__ow_method.toUpperCase() : 'GET';
    console.log(`[Collections] Received ${method} /api/collections/${slug}`);

    // We only support PUT for collections via the API
    if (method !== 'PUT') {
      return {
        statusCode: 405,
        headers: {
          'Content-Type': 'application/json',
          'Allow': 'PUT'
        },
        body: { message: 'Method Not Allowed. Only PUT is supported for collections.' }
      };
    }

    // Handle PUT request
    const recordsData = typeof args.__ow_body === 'string'
      ? JSON.parse(args.__ow_body)
      : args.__ow_body;

    const result = await updateCollection(slug, recordsData);

    // Return the result
    return {
      statusCode: result.statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: result.body
    };

  } catch (error) {
    // Handle potential errors, including authentication errors
    console.error(`[Collections] Error in collections ${args.__ow_method} function:`, error.message || error);

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
