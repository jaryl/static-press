const { authenticateRequest } = require('../../../lib/api-logic/handlers/auth');
const { makeSchemaPrivate } = require('../../../lib/api-logic/handlers/schema');

async function main(event, context) {
  console.log('[API Function: schema/make-private] Processing request');

  const method = event.http.method?.toUpperCase();
  console.log(`[Schema Make Private] Received ${method} /api/schema/make-private`);

  if (method !== 'PUT') {
    return handleError(new Error('Method Not Allowed'), method);
  }

  try {
    // Authenticate the request
    await authenticateRequest(event);
    console.log('[API Function: schema/make-private] Authentication successful');

    // Call the core logic function to set the ACL to private
    const result = await makeSchemaPrivate();
    console.log('[API Function: schema/make-private] Core logic result:', result.statusCode);

    return {
      statusCode: result.statusCode,
      body: result.body, // Pass the body directly (contains message or error)
      headers: {
        'Content-Type': 'application/json'
      }
    };

  } catch (error) {
    console.error('[API Function: schema/make-private] Error:', error.message || error);
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errorType = 'INTERNAL_SERVER_ERROR';

    // Handle specific authentication errors
    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      statusCode = error.message.includes('Token expired') ? 401 : 403;
      message = error.message;
      errorType = error.message.includes('Token expired') ? 'TOKEN_EXPIRED' : 'AUTHENTICATION_ERROR';
    }
    // Potentially handle specific S3 errors passed up if needed (e.g., PermissionError)
    else if (error.errorType === 'PERMISSION_ERROR') {
      statusCode = 403;
      message = error.message;
      errorType = error.errorType;
    }

    return {
      statusCode: statusCode,
      body: { errorType: errorType, message: message },
      headers: { 'Content-Type': 'application/json' }
    };
  }
}

export { main };
