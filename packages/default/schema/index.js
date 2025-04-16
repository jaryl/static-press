const { getSchema } = require('../../../src/lib/api-logic/handlers/schema');

/**
 * DigitalOcean Serverless Function for getting schema
 * @param {Object} args - Parameters passed to the function
 * @returns {Object} Response object with statusCode and body
 */
async function main(args) {
  console.log('[Schema] Received GET /api/schema');

  try {
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
    console.error('[Schema] Error in schema get function:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        message: 'Internal server error',
        error: error.message
      }
    };
  }
}

// Export the function for DigitalOcean Functions
exports.main = main;
