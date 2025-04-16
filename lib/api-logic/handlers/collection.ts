import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, bucketName } from '../../s3Client.ts';

// Collections are always in the data directory
const getCollectionKey = (slug: string) => `data/${slug}.json`;

/**
 * Core handler for updating collection data
 * This function contains the business logic without being tied to Express or serverless
 */
export async function updateCollection(slug: string, recordsData: any) {
  // Validate input
  if (!Array.isArray(recordsData)) {
    return {
      statusCode: 400,
      body: { message: 'Invalid data format. Expected an array of records.' }
    };
  }

  if (!bucketName) {
    console.error("[API Core] S3 bucket name is missing!");
    return {
      statusCode: 500,
      body: { message: 'Server configuration error: S3 bucket name missing.' }
    };
  }

  const key = getCollectionKey(slug);
  console.log('[API Core] Attempting to update collection in S3 at key: %s', key);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: JSON.stringify(recordsData, null, 2),
    ContentType: 'application/json',
    ACL: 'public-read', // Collections remain public
  });

  try {
    await s3Client.send(command);
    console.log('[API Core] Successfully updated %s in S3 bucket: %s', key, bucketName);
    return {
      statusCode: 200,
      body: { message: `Collection ${slug} updated successfully in S3` }
    };
  } catch (error) {
    console.error('[API Core] Error updating %s in S3: %s', key, error);
    return {
      statusCode: 500,
      body: {
        message: `Failed to update collection ${slug} in S3`,
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
}
