const { updateSchema } = require('../core-api');
const { authenticateRequest } = require('../utils/auth');

/**
 * DigitalOcean Serverless Function for updating schema
 * @param {Object} args - Parameters passed to the function
 * @returns {Object} Response object with statusCode and body
 */
async function main(args) {
  console.log('[Schema] Received PUT /api/schema');

  try {
    // --- Authentication Check ---
    const decodedToken = await authenticateRequest(args);
    console.log(`[Schema] Authenticated user: ${decodedToken.sub}`);
    // ---------------------------

    // Extract the schema data from the request body
    const schemaData = typeof args.__ow_body === 'string'
      ? JSON.parse(args.__ow_body)
      : args.__ow_body;

    // Call the core handler
    const result = await updateSchema(schemaData);

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
    console.error('[Schema] Error in schema update function:', error.message || error);

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
exports.main = main;
