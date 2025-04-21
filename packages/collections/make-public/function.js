import { createResponse, handleError } from '../../../lib/digital-ocean/helpers';
import { collectionHandler } from '../../../lib/api-logic/handlers/collection';
import { logger } from '../../../lib/utils/logger';
import { authenticateRequest } from '../../../lib/api-logic/handlers/auth';

/**
 * Main function handler for DigitalOcean Functions.
 * Sets the ACL of a specified collection's data file in S3 to 'public-read'
 * by calling the shared collectionHandler logic.
 * Triggered via API Gateway, expects 'slug' in path parameters.
 *
 * @param {object} event - The event object containing request details (e.g., pathParameters).
 * @param {object} context - The context object containing runtime information.
 * @returns {Promise<object>} The HTTP response object formatted for DigitalOcean Functions.
 */
async function main(event, context) {
  logger.info('[DO Function make-public] Received event:', JSON.stringify(event, null, 2));

  // Extract the slug from the path or params
  const slug = event.http.path.replace(/^\//, '');
  if (!slug) {
    return createResponse(400, { message: 'Missing collection slug in path' });
  }

  const method = event.http.method?.toUpperCase();
  console.log(`[Collections] Received ${method} /api/collections/${slug}`);

  if (method !== 'PUT') {
    return handleError(new Error('Method Not Allowed.'), method);
  }

  try {
    const decodedToken = await authenticateRequest(event);
    console.log(`[Collections] Authenticated user: ${decodedToken.sub}`);

    logger.info(`[DO Function make-public] Attempting to make collection public for slug: ${slug}`);

    await collectionHandler.makeCollectionPublic(slug);

    logger.info(`[DO Function make-public] Successfully set ACL to public-read for collection: ${slug}`);
    return createResponse(200, { message: `Collection data for '${slug}' set to public-read successfully.` });

  } catch (error) {
    logger.error(`[DO Function make-public] Error calling collectionHandler.makeCollectionPublic for slug ${slug}:`, error);

    if (error.name === 'NoSuchKey' || (error.message && error.message.includes('NoSuchKey'))) {
      const errorMsg = `Collection data file (${slug}.json) not found.`;
      logger.warn(`[DO Function make-public] ${errorMsg}`);
      return createResponse(404, { error: { message: errorMsg, code: "NOT_FOUND" } });
    }

    return handleError(error, `Failed to set collection data ACL for '${slug}'.`);
  }
}

export { main };
