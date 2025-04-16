const { updateCollection } = require('../../../src/lib/api-logic/handlers/collection');

/**
 * DigitalOcean Serverless Function for updating collection data
 * @param {Object} args - Parameters passed to the function
 * @returns {Object} Response object with statusCode and body
 */
async function main(args) {
  console.log('[Collections] Received PUT /api/collections/:slug');

  try {
    // Extract the slug from the path parameters
    const slug = args.__ow_path.split('/').pop();

    if (!slug) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          message: 'Missing collection slug in path'
        }
      };
    }

    // Extract the collection data from the request body
    const recordsData = typeof args.__ow_body === 'string'
      ? JSON.parse(args.__ow_body)
      : args.__ow_body;

    // Call the core handler
    const result = await updateCollection(slug, recordsData);

    // Return the result in the format expected by DigitalOcean Functions
    return {
      statusCode: result.statusCode,
      headers: {
        'Content-Type': 'application/json'
      },
      body: result.body
    };
  } catch (error) {
    console.error('[Collections] Error in collection update function:', error);
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
