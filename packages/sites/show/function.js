import { getSiteMetadata } from '../../../lib/api-logic/handlers/sites';
import { createResponse, handleError } from '../../../lib/digital-ocean/helpers';

/**
 * DigitalOcean Serverless Function for retrieving a specific site
 * Handles GET requests to /api/sites/:id
 * @param {object} event - The event object containing request data
 * @param {object} context - The context object containing function metadata
 * @returns {object} Response object with statusCode, headers, and body
 */
async function main(event, context) {
  console.log(`[Sites Show] Function Version: ${context?.functionVersion}`);

  const method = event.http.method?.toUpperCase();
  console.log(`[Sites Show] Received ${method} /api/sites/:id`);

  if (method !== 'GET') {
    return handleError(new Error('Method Not Allowed'), method);
  }

  try {
    // Extract site ID from path parameter
    const siteId = event?.params?.id;
    
    if (!siteId) {
      return createResponse(400, { message: 'Site ID is required' });
    }

    // Call the core handler
    const result = await getSiteMetadata(siteId);

    // Return the result
    return createResponse(result.statusCode, result.body, result.headers);
  } catch (error) {
    console.error('[Sites Show] Error during request processing:', error.message || error);
    return createResponse(500, { message: `Internal Server Error: ${error.message}` });
  }
}

export { main };
