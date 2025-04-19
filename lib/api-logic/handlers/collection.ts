import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../../s3Client';
import { ApiResponse, createSuccessResponse, createErrorResponse } from '../utils/response';
import { config } from '../../config';
import { logger } from '../../utils/logger';

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

  const command = new PutObjectCommand({
    Bucket: config.s3.bucketName,
    Key: key,
    Body: JSON.stringify(recordsData, null, 2),
    ContentType: 'application/json',
    ACL: 'public-read', // Collections remain public
  });

  try {
    await s3Client.send(command);
    logger.info(`Successfully updated ${key} in S3 bucket: ${config.s3.bucketName}`);
    return createSuccessResponse({ message: `Collection ${slug} updated successfully in S3` });
  } catch (error) {
    logger.error(`Error updating ${key} in S3:`, error);
    return createErrorResponse(`Failed to update collection ${slug} in S3`, 500, 'S3_UPDATE_ERROR');
  }
}
