import { 
  listSites, 
  getSiteMetadata, 
  createSite, 
  updateSiteMetadata, 
  deleteSite 
} from '../../../lib/api-logic/handlers/sites';
import { createResponse, handleError } from '../../../lib/digital-ocean/helpers';

/**
 * DigitalOcean Serverless Function for handling all site operations
 * Routes to appropriate handler based on HTTP method and path parameters
 * 
 * Supports:
 * - GET /api/sites - List all sites
 * - GET /api/sites/:id - Get a specific site
 * - POST /api/sites - Create a new site
 * - PUT /api/sites/:id - Update a site
 * - DELETE /api/sites/:id - Delete a site
 * 
 * @param {object} event - The event object containing request data
 * @param {object} context - The context object containing function metadata
 * @returns {object} Response object with statusCode, headers, and body
 */
async function main(event, context) {
  console.log(`[Sites API] Function Version: ${context?.functionVersion}`);
  
  const method = event.http.method?.toUpperCase();
  const siteId = event?.params?.id;
  const path = event.http.path;
  
  console.log(`[Sites API] Received ${method} ${path}`);
  
  try {
    // Route based on method and whether an ID is present
    
    // GET requests
    if (method === 'GET') {
      // GET /api/sites/:id - Get specific site
      if (siteId) {
        console.log(`[Sites API] Getting site with ID: ${siteId}`);
        const result = await getSiteMetadata(siteId);
        return createResponse(result.statusCode, result.body, result.headers);
      }
      // GET /api/sites - List all sites
      else {
        console.log('[Sites API] Listing all sites');
        const result = await listSites();
        return createResponse(result.statusCode, result.body, result.headers);
      }
    }
    
    // POST requests - Create a new site
    else if (method === 'POST') {
      const { id, name, description } = event;
      
      if (!id || !name) {
        return createResponse(400, { message: 'Site ID and name are required' });
      }
      
      console.log(`[Sites API] Creating site with ID: ${id}, name: ${name}`);
      const result = await createSite({ id, name, description });
      return createResponse(result.statusCode, result.body, result.headers);
    }
    
    // PUT requests - Update an existing site
    else if (method === 'PUT') {
      if (!siteId) {
        return createResponse(400, { message: 'Site ID is required' });
      }
      
      const { name, description } = event;
      
      if (!name && !description) {
        return createResponse(400, { message: 'At least one field to update is required' });
      }
      
      // Prepare updates object
      const updates = {};
      if (name) updates.name = name;
      if (description) updates.description = description;
      
      console.log(`[Sites API] Updating site with ID: ${siteId}`);
      const result = await updateSiteMetadata(siteId, updates);
      return createResponse(result.statusCode, result.body, result.headers);
    }
    
    // DELETE requests - Delete a site
    else if (method === 'DELETE') {
      if (!siteId) {
        return createResponse(400, { message: 'Site ID is required' });
      }
      
      console.log(`[Sites API] Deleting site with ID: ${siteId}`);
      const result = await deleteSite(siteId);
      return createResponse(result.statusCode, result.body, result.headers);
    }
    
    // Unsupported HTTP method
    else {
      return handleError(new Error('Method Not Allowed'), method);
    }
    
  } catch (error) {
    console.error('[Sites API] Error during request processing:', error.message || error);
    return createResponse(500, { message: `Internal Server Error: ${error.message}` });
  }
}

export { main };
