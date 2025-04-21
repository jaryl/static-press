import { updateCollection } from '../../../lib/api-logic/handlers/collection';
import { authenticateRequest } from '../../../lib/api-logic/handlers/auth';
import { createResponse, handleError } from '../../../lib/digital-ocean/helpers';

/**
 * Handles PUT request for collection data
 * @param {string} slug - The collection slug
 * @param {object|string} body - The collection data to update
 * @returns {Promise<object>} Result from updateCollection
 */
async function handlePutCollection(slug, body) {
  // Parse the collection data if it's a string
  const recordsData = typeof body === 'string'
    ? JSON.parse(body)
    : body;

  return await updateCollection(slug, recordsData);
}

/**
 * DigitalOcean Serverless Function for collection operations (Protected)
 * Handles PUT requests to /api/collections/:slug
 * @param {object} event - The event object containing request parameters and metadata
 * @param {object} context - The context object containing function metadata
 * @returns {object} Response object with statusCode, headers, and body
 */
async function main(event, context) {
  console.log(`[Collections] Function Version: ${context?.functionVersion}`);
  console.log(`[Collections] Received event with keys: ${Object.keys(event || {}).join(', ')}`);

  try {
    // --- Authentication Check ---
    const decodedToken = await authenticateRequest(event);
    console.log(`[Collections] Authenticated user: ${decodedToken.sub}`);
    // ---------------------------

    // Extract the slug from the path or params
    const slug = event.http.path.replace(/^\//, '');

    if (!slug) {
      return createResponse(400, { message: 'Missing collection slug in path' });
    }

    // Determine the HTTP method from event
    const method = event.http.method?.toUpperCase();
    console.log(`[Collections] Received ${method} /api/collections/${slug}`);

    // We only support PUT for collections via the API
    if (method !== 'PUT') {
      return handleError(new Error('Method Not Allowed.'), method);
    }

    // Handle PUT request
    const result = await handlePutCollection(slug, event.body);

    // Return the result with the appropriate response format
    return createResponse(result.statusCode, result.body, result.headers);

  } catch (error) {
    return handleError(error, event.method);
  }
}

export { main };
