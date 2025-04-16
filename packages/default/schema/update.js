const { updateSchema } = require('../../../src/lib/api-logic/handlers/schema');

/**
 * DigitalOcean Serverless Function for updating schema
 * @param {Object} args - Parameters passed to the function
 * @returns {Object} Response object with statusCode and body
 */
async function main(args) {
  console.log('[Schema] Received PUT /api/schema');

  try {
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
    console.error('[Schema] Error in schema update function:', error);
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
