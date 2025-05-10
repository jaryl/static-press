import { createSite } from '../../../lib/api-logic/handlers/sites';
import { createResponse, handleError } from '../../../lib/digital-ocean/helpers';

/**
 * DigitalOcean Serverless Function for creating a new site
 * Handles POST requests to /api/sites
 * @param {object} event - The event object containing request data
 * @param {object} context - The context object containing function metadata
 * @returns {object} Response object with statusCode, headers, and body
 */
async function main(event, context) {
  console.log(`[Sites Create] Function Version: ${context?.functionVersion}`);

  const method = event.http.method?.toUpperCase();
  console.log(`[Sites Create] Received ${method} /api/sites`);

  if (method !== 'POST') {
    return handleError(new Error('Method Not Allowed'), method);
  }

  try {
    // Extract site data from request body
    const { id, name, description, templateId } = event;
    
    if (!id || !name) {
      return createResponse(400, { message: 'Site ID and name are required' });
    }

    // Call the core handler
    const result = await createSite({ id, name, description });

    // Return the result
    return createResponse(result.statusCode, result.body, result.headers);
  } catch (error) {
    console.error('[Sites Create] Error during request processing:', error.message || error);
    return createResponse(500, { message: `Internal Server Error: ${error.message}` });
  }
}

export { main };
