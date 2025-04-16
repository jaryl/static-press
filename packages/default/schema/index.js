const { getSchema } = require('../core-api');
const { authenticateRequest } = require('../utils/auth');

/**
 * DigitalOcean Serverless Function for getting schema(s) (Protected)
 * @param {Object} args - Parameters passed to the function
 * @returns {Object} Response object with statusCode and body
 */
async function main(args) {
  console.log('[Schema] Received GET /api/schema');

  try {
    // --- Authentication Check ---
    const decodedToken = await authenticateRequest(args);
    console.log(`[Schema] Authenticated user: ${decodedToken.sub}`);
    // ---------------------------

    // Call the core handler
    const result = await getSchema();

    // Return the result in the format expected by DigitalOcean Functions
    return {
      statusCode: result.statusCode,
      headers: {
        'Content-Type': 'application/json'
      },
      body: result.body
    };
  } catch (error) {
    // Handle potential errors, including authentication errors
    console.error('[Schema] Error in schema get function:', error.message || error);

    let statusCode = 500;
    let message = 'Internal Server Error';

    // Check if it's an authentication error from our utility
    if (error.message.startsWith('Unauthorized:') || error.message.startsWith('Forbidden:')) {
      statusCode = error.message.startsWith('Forbidden:') ? 403 : 401;
      message = error.message;
    }

    return {
      statusCode: statusCode,
      headers: {
        'Content-Type': 'application/json'
      },
      body: { message: message }
    };
  }
}

// Export the function for DigitalOcean Functions
module.exports = { main };
