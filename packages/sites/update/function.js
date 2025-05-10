import { updateSiteMetadata } from '../../../lib/api-logic/handlers/sites';
import { createResponse, handleError } from '../../../lib/digital-ocean/helpers';

/**
 * DigitalOcean Serverless Function for updating a site
 * Handles PUT requests to /api/sites/:id
 * @param {object} event - The event object containing request data
 * @param {object} context - The context object containing function metadata
 * @returns {object} Response object with statusCode, headers, and body
 */
async function main(event, context) {
  console.log(`[Sites Update] Function Version: ${context?.functionVersion}`);

  const method = event.http.method?.toUpperCase();
  console.log(`[Sites Update] Received ${method} /api/sites/:id`);

  if (method !== 'PUT') {
    return handleError(new Error('Method Not Allowed'), method);
  }

  try {
    // Extract site ID from path parameter
    const siteId = event?.params?.id;
    
    if (!siteId) {
      return createResponse(400, { message: 'Site ID is required' });
    }

    // Extract update data from request body
    const { name, description } = event;
    
    if (!name && !description) {
      return createResponse(400, { message: 'At least one field to update is required' });
    }

    // Prepare updates object
    const updates = {};
    if (name) updates.name = name;
    if (description) updates.description = description;

    // Call the core handler
    const result = await updateSiteMetadata(siteId, updates);

    // Return the result
    return createResponse(result.statusCode, result.body, result.headers);
  } catch (error) {
    console.error('[Sites Update] Error during request processing:', error.message || error);
    return createResponse(500, { message: `Internal Server Error: ${error.message}` });
  }
}

export { main };
