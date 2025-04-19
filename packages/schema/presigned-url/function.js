
import { authenticateRequest } from '../../../lib/api-logic/handlers/auth';
import { getSchemaPresignedUrl } from '../../../lib/api-logic/handlers/schema';
import { createResponse, handleError } from '../../../lib/digital-ocean/helpers';

async function main(event, context) {
  console.log('[API Function: schema/presigned-url] Processing request');

  // Ensure it's a GET request (though API Gateway/Function config should also enforce this)
  const method = event.http.method?.toUpperCase();
  console.log(`[Schema Presigned URL] Received ${method} /api/schema/presigned-url`);

  if (method !== 'GET') {
    return handleError(new Error('Method Not Allowed'), method);
  }

  try {
    const decodedToken = await authenticateRequest(event);
    console.log(`[Schema Meta] Authenticated user: ${decodedToken.sub}`);

    // Call the core logic function to get the pre-signed URL
    const result = await getSchemaPresignedUrl();
    console.log('[API Function: schema/presigned-url] Core logic result:', result.statusCode);

    return createResponse(result.statusCode, result.body, result.headers);
  } catch (error) {
    return handleError(error, event.http.method);
  }
}

export { main };
