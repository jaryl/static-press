// packages/api/schema/presigned-url/handler.js
// This handler generates a temporary, pre-signed URL to view schema.json

const { authenticateRequest } = require('../../../lib/api-logic/handlers/auth');
const { getSchemaPresignedUrl } = require('../../../lib/api-logic/handlers/schema');

async function main(args) {
  console.log('[API Function: schema/presigned-url] Processing request');

  // Ensure it's a GET request (though API Gateway/Function config should also enforce this)
  if (args.__ow_method?.toLowerCase() !== 'get') {
    console.log('[API Function: schema/presigned-url] Method not allowed:', args.__ow_method);
    return {
      statusCode: 405,
      body: { message: 'Method Not Allowed' },
      headers: { 'Allow': 'GET' }
    };
  }

  try {
    // Authenticate the request using the JWT in the header
    await authenticateRequest(args);
    console.log('[API Function: schema/presigned-url] Authentication successful');

    // Call the core logic function to get the pre-signed URL
    const result = await getSchemaPresignedUrl();
    console.log('[API Function: schema/presigned-url] Core logic result:', result.statusCode);

    return {
      statusCode: result.statusCode,
      body: result.body, // Pass the body directly (contains URL or error)
      headers: {
        'Content-Type': 'application/json'
      }
    };

  } catch (error) {
    console.error('[API Function: schema/presigned-url] Error:', error.message || error);
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errorType = 'INTERNAL_SERVER_ERROR';

    // Handle specific authentication errors
    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      statusCode = error.message.includes('Token expired') ? 401 : 403; // 401 for expired, 403 otherwise
      message = error.message;
      errorType = error.message.includes('Token expired') ? 'TOKEN_EXPIRED' : 'AUTHENTICATION_ERROR';
    }

    return {
      statusCode: statusCode,
      body: { errorType: errorType, message: message },
      headers: { 'Content-Type': 'application/json' }
    };
  }
}

module.exports = { main };
