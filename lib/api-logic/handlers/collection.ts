import { ApiResponse, createSuccessResponse, createErrorResponse } from '../utils/response';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { putObjectJson, setObjectAcl } from '../../utils/s3Utils';

// Collections are always in the data directory
const getCollectionKey = (slug: string) => `data/${slug}.json`;

/**
 * Core handler for updating collection data in S3.
 * This function contains the business logic without being tied to Express or serverless.
 */
export async function updateCollection(slug: string, recordsData: any): Promise<ApiResponse> {
  // Validate input
  if (!Array.isArray(recordsData)) {
    return createErrorResponse('Invalid data format. Expected an array of records.', 400, 'VALIDATION_ERROR');
  }

  const key = getCollectionKey(slug);
  logger.info(`Attempting to update ${key} in S3 bucket: ${config.s3.bucketName}`);

  try {
    await putObjectJson(key, recordsData, 'public-read');
    logger.info(`Successfully updated ${key} in S3 bucket: ${config.s3.bucketName}`);
    return createSuccessResponse({ message: `Collection ${slug} updated successfully in S3` });
  } catch (error) {
    logger.error(`Error updating ${key} in S3:`, error);
    if (error instanceof Error) {
      return createErrorResponse(`Failed to update collection ${slug} in S3: ${error.message}`, 500, 'S3_ERROR');
    }
    return createErrorResponse(`Failed to update collection ${slug} in S3`, 500, 'S3_UPDATE_ERROR');
  }
}

/**
 * Handles business logic for collection data operations.
 */
class CollectionHandler {
  /**
   * Sets the ACL of a collection's data file to 'public-read'.
   * @param slug - The slug of the collection.
   */
  async makeCollectionPublic(slug: string): Promise<void> {
    logger.info(`Attempting to set collection data ACL to public-read for ${slug}`);
    const key = getCollectionKey(slug);
    try {
      await setObjectAcl(key, 'public-read');
      logger.info(`Successfully set collection data ACL to public-read for ${slug}`);
    } catch (error) {
      logger.error(`Failed to set collection data ACL to public-read for ${slug}`, error);
      throw error;
    }
  }
}

export const collectionHandler = new CollectionHandler();
