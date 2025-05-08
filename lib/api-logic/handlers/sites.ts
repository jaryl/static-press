import { Readable } from 'stream';
import { ApiResponse, createSuccessResponse, createErrorResponse } from '../utils/response';
import { logger } from '../../utils/logger';
import {
  listObjects,
  getObjectMetadata,
  putObjectJson,
  getObjectStream,
  deleteObject,
  streamToString
} from '../../utils/s3Utils';

// Site metadata file name (stored at the root of each site directory)
const SITE_METADATA_FILE = 'site-metadata.json';

// Build the path to a site's metadata file
const getSiteMetadataKey = (siteId: string) => `sites/${siteId}/${SITE_METADATA_FILE}`;

// Get the site ID from a full S3 key path
const getSiteIdFromKey = (key: string): string | null => {
  // Expected format: sites/{siteId}/whatever
  const match = key.match(/^sites\/([^\/]+)\//);
  return match ? match[1] : null;
};

/**
 * Represents a site's metadata
 */
export interface SiteMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  // Additional metadata can be added here as needed
}

/**
 * Create a site metadata object with default values
 */
const createDefaultSiteMetadata = (id: string, name: string, createdBy?: string): SiteMetadata => ({
  id,
  name,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy
});

/**
 * List all available sites
 */
export async function listSites(): Promise<ApiResponse> {
  logger.info('[API Core] Attempting to list all sites');

  try {
    // List objects with the prefix 'sites/' and delimiter '/' to get site directories
    const siteDirectories = await listObjects('sites/', '/');

    // Extract site IDs from the CommonPrefixes
    const siteIds = siteDirectories
      .map(prefix => getSiteIdFromKey(`${prefix}`))
      .filter(id => id !== null) as string[];

    // Get metadata for each site
    const sitesMetadata: SiteMetadata[] = [];

    for (const siteId of siteIds) {
      try {
        const siteMetadataKey = getSiteMetadataKey(siteId);
        const metadataStream = await getObjectStream(siteMetadataKey);

        if (metadataStream) {
          const metadataContent = await streamToString(metadataStream as Readable);
          const metadata = JSON.parse(metadataContent);
          sitesMetadata.push({
            ...metadata,
            id: siteId // Ensure the ID matches the directory name
          });
        } else {
          // If no metadata file exists, create a basic entry
          sitesMetadata.push(createDefaultSiteMetadata(siteId, siteId));
        }
      } catch (error) {
        logger.warn(`[API Core] Error fetching metadata for site ${siteId}:`, error);
        // Add a basic entry even if metadata fetch fails
        sitesMetadata.push(createDefaultSiteMetadata(siteId, siteId));
      }
    }

    logger.info(`[API Core] Successfully retrieved ${sitesMetadata.length} sites`);
    return createSuccessResponse(sitesMetadata);
  } catch (error) {
    logger.error('[API Core] Error listing sites:', error);
    return createErrorResponse(
      'Failed to list sites due to an internal error.',
      500,
      'LIST_SITES_ERROR'
    );
  }
}

/**
 * Get metadata for a specific site
 */
export async function getSiteMetadata(siteId: string): Promise<ApiResponse> {
  logger.info(`[API Core] Fetching metadata for site: ${siteId}`);

  try {
    const siteMetadataKey = getSiteMetadataKey(siteId);
    const metadataStream = await getObjectStream(siteMetadataKey);

    if (metadataStream) {
      const metadataContent = await streamToString(metadataStream as Readable);
      const metadata = JSON.parse(metadataContent);

      logger.info(`[API Core] Successfully retrieved metadata for site ${siteId}`);
      return createSuccessResponse({
        ...metadata,
        id: siteId // Ensure the ID matches the directory name
      });
    } else {
      // Check if the site exists by looking for the schema file
      const siteExists = await getObjectMetadata(`sites/${siteId}/schema.json`);

      if (siteExists) {
        // Site exists but has no metadata file, return default metadata
        const defaultMetadata = createDefaultSiteMetadata(siteId, siteId);
        logger.info(`[API Core] No metadata file found for site ${siteId}, using default`);
        return createSuccessResponse(defaultMetadata);
      } else {
        // Site does not exist
        logger.warn(`[API Core] Site not found: ${siteId}`);
        return createErrorResponse(
          `Site with ID '${siteId}' not found.`,
          404,
          'SITE_NOT_FOUND'
        );
      }
    }
  } catch (error) {
    logger.error(`[API Core] Error fetching metadata for site ${siteId}:`, error);
    return createErrorResponse(
      `Failed to get site metadata due to an internal error.`,
      500,
      'GET_SITE_METADATA_ERROR'
    );
  }
}

/**
 * Create a new site with metadata
 */
export async function createSite(siteData: { id: string; name: string; description?: string; createdBy?: string }): Promise<ApiResponse> {
  const { id, name, description, createdBy } = siteData;

  logger.info(`[API Core] Attempting to create new site: ${id}`);

  if (!id || !name) {
    return createErrorResponse(
      'Site ID and name are required.',
      400,
      'VALIDATION_ERROR'
    );
  }

  // Validate site ID format (only allow alphanumeric and hyphens)
  if (!/^[a-z0-9-]+$/.test(id)) {
    return createErrorResponse(
      'Site ID must contain only lowercase letters, numbers, and hyphens.',
      400,
      'VALIDATION_ERROR'
    );
  }

  try {
    // Check if the site already exists
    const siteMetadataKey = getSiteMetadataKey(id);
    const existingMetadata = await getObjectMetadata(siteMetadataKey);

    if (existingMetadata) {
      logger.warn(`[API Core] Site with ID ${id} already exists`);
      return createErrorResponse(
        `Site with ID '${id}' already exists.`,
        409,
        'SITE_ALREADY_EXISTS'
      );
    }

    // Create site metadata
    const metadata: SiteMetadata = {
      id,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy
    };

    // Save metadata file
    await putObjectJson(siteMetadataKey, metadata);

    // Create an empty schema file for the new site
    await putObjectJson(`sites/${id}/schema.json`, []);

    logger.info(`[API Core] Successfully created new site: ${id}`);
    return createSuccessResponse(metadata);
  } catch (error) {
    logger.error(`[API Core] Error creating site ${id}:`, error);
    return createErrorResponse(
      'Failed to create site due to an internal error.',
      500,
      'CREATE_SITE_ERROR'
    );
  }
}

/**
 * Update site metadata
 */
export async function updateSiteMetadata(siteId: string, updates: Partial<SiteMetadata>): Promise<ApiResponse> {
  logger.info(`[API Core] Attempting to update metadata for site: ${siteId}`);

  try {
    // Check if the site exists
    const siteMetadataKey = getSiteMetadataKey(siteId);
    let currentMetadata: SiteMetadata;

    // Get current metadata if it exists
    const metadataStream = await getObjectStream(siteMetadataKey);
    if (metadataStream) {
      const metadataContent = await streamToString(metadataStream as Readable);
      currentMetadata = JSON.parse(metadataContent);
    } else {
      // Check if the site exists by schema file
      const siteExists = await getObjectMetadata(`sites/${siteId}/schema.json`);

      if (!siteExists) {
        logger.warn(`[API Core] Site not found for update: ${siteId}`);
        return createErrorResponse(
          `Site with ID '${siteId}' not found.`,
          404,
          'SITE_NOT_FOUND'
        );
      }

      // Create default metadata if it doesn't exist
      currentMetadata = createDefaultSiteMetadata(siteId, siteId);
    }

    // Prevent changing the ID
    if (updates.id && updates.id !== siteId) {
      return createErrorResponse(
        'Site ID cannot be changed.',
        400,
        'VALIDATION_ERROR'
      );
    }

    // Update metadata
    const updatedMetadata: SiteMetadata = {
      ...currentMetadata,
      ...updates,
      id: siteId, // Ensure ID remains the same
      updatedAt: new Date().toISOString() // Update the timestamp
    };

    // Save updated metadata
    await putObjectJson(siteMetadataKey, updatedMetadata);

    logger.info(`[API Core] Successfully updated metadata for site: ${siteId}`);
    return createSuccessResponse(updatedMetadata);
  } catch (error) {
    logger.error(`[API Core] Error updating metadata for site ${siteId}:`, error);
    return createErrorResponse(
      'Failed to update site metadata due to an internal error.',
      500,
      'UPDATE_SITE_METADATA_ERROR'
    );
  }
}

/**
 * Delete a site and all its data
 * This operation is destructive and should be used with caution
 */
export async function deleteSite(siteId: string): Promise<ApiResponse> {
  logger.info(`[API Core] Attempting to delete site: ${siteId}`);

  if (siteId === 'default') {
    return createErrorResponse(
      'The default site cannot be deleted.',
      400,
      'VALIDATION_ERROR'
    );
  }

  try {
    // Verify that the site exists
    const siteExists = await getObjectMetadata(`sites/${siteId}/schema.json`);

    if (!siteExists) {
      logger.warn(`[API Core] Site not found for deletion: ${siteId}`);
      return createErrorResponse(
        `Site with ID '${siteId}' not found.`,
        404,
        'SITE_NOT_FOUND'
      );
    }

    // In a real implementation, we would delete all objects in the site directory
    // For safety in this phase, we'll just delete the metadata and schema

    // Delete metadata
    await deleteObject(getSiteMetadataKey(siteId));

    // Delete schema
    await deleteObject(`sites/${siteId}/schema.json`);

    logger.info(`[API Core] Successfully deleted site: ${siteId}`);
    return createSuccessResponse({ message: `Site '${siteId}' has been deleted.` });
  } catch (error) {
    logger.error(`[API Core] Error deleting site ${siteId}:`, error);
    return createErrorResponse(
      'Failed to delete site due to an internal error.',
      500,
      'DELETE_SITE_ERROR'
    );
  }
}
