import { listSites } from '../../../lib/api-logic/handlers/sites';
import { createResponse, handleError } from '../../../lib/digital-ocean/helpers';

/**
 * DigitalOcean Serverless Function for listing all sites
 * Handles GET requests to /api/sites
 * @param {object} event - The event object containing request data
 * @param {object} context - The context object containing function metadata
 * @returns {object} Response object with statusCode, headers, and body
 */
async function main(event, context) {
  console.log(`[Sites List] Function Version: ${context?.functionVersion}`);

  const method = event.http.method?.toUpperCase();
  console.log(`[Sites List] Received ${method} /api/sites`);

  if (method !== 'GET') {
    return handleError(new Error('Method Not Allowed'), method);
  }

  try {
    // Call the core handler
    const result = await listSites();

    // Return the result
    return createResponse(result.statusCode, result.body, result.headers);
  } catch (error) {
    console.error('[Sites List] Error during request processing:', error.message || error);
    return createResponse(500, { message: `Internal Server Error: ${error.message}` });
  }
}

export { main };
