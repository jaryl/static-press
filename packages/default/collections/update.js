const { updateCollection } = require('../core-api');
// const { updateCollection } = require('../../../src/lib/api-logic/handlers/collection'); // Old import
// Require the authentication utility
const { authenticateRequest } = require('../utils/auth');

/**
 * DigitalOcean Serverless Function for updating collection data (Protected)
 * @param {Object} args - Parameters passed to the function
 * @returns {Object} Response object with statusCode and body
 */
async function main(args) {
  console.log('[Collections] Received PUT /api/collections/:slug');

  try {
    // --- Authentication Check ---
    const decodedToken = await authenticateRequest(args);
    // Optional: Use decodedToken.sub or decodedToken.role if needed for authorization
    console.log(`[Collections] Authenticated user: ${decodedToken.sub}`);
    // ---------------------------

    // Extract the slug from the path parameters
    const slug = args.__ow_path.split('/').pop();

    if (!slug) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: { message: 'Missing collection slug in path' }
      };
    }

    // Extract the collection data from the request body
    const recordsData = typeof args.__ow_body === 'string'
      ? JSON.parse(args.__ow_body)
      : args.__ow_body;

    // Call the core handler
    const result = await updateCollection(slug, recordsData);

    // Return the result
    return {
      statusCode: result.statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: result.body
    };

  } catch (error) {
    // Handle potential errors, including authentication errors
    console.error('[Collections] Error in collection update function:', error.message || error);

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

module.exports = { main }; // Ensure main is exported
