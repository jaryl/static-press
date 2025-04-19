import { s3Client } from '../../s3Client';
import { ApiResponse, createSuccessResponse, createErrorResponse } from '../utils/response';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { putObjectJson } from '../../utils/s3Utils';

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
    await putObjectJson(key, recordsData);
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
