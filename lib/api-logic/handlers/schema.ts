import { PutObjectCommand, GetObjectCommand, HeadObjectCommand, GetObjectAclCommand, PutObjectAclCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../../s3Client';
import { Readable } from 'stream';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ApiResponse, createSuccessResponse, createErrorResponse } from '../utils/response';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { streamToString } from '../../utils/stream';

// Schema is always at the root level
const SCHEMA_KEY = 'schema.json';

/**
 * Core handler for retrieving schema data
 * This function contains the business logic without being tied to Express or serverless
 */
export async function getSchema(): Promise<ApiResponse> {
  logger.info('[API Core] Attempting to fetch schema');

  logger.info(`[API Core] Attempting to fetch schema from S3 at key: ${SCHEMA_KEY}`);

  try {
    // Attempt to get the object
    const command = new GetObjectCommand({
      Bucket: config.s3.bucketName,
      Key: SCHEMA_KEY,
    });
    const response = await s3Client.send(command);

    if (!response.Body) {
      // This case is unlikely but good to handle
      throw new Error('Empty response body from S3');
    }

    // Attempt to parse the content
    try {
      const bodyContents = await streamToString(response.Body as Readable);
      const schemaData = JSON.parse(bodyContents);

      logger.info(`[API Core] Successfully retrieved and parsed schema from S3: ${SCHEMA_KEY}`);
      return createSuccessResponse(schemaData);
    } catch (parseError) {
      // Handle JSON parsing error specifically
      if (parseError instanceof SyntaxError) {
        logger.error(`[API Core] Error parsing schema JSON from S3: ${SCHEMA_KEY}`, parseError);
        return createErrorResponse(
          `Failed to parse schema file (schema.json): ${parseError.message}`,
          500,
          'SCHEMA_MALFORMED'
        );
      }
      // Re-throw other stream/parsing errors to be caught below
      throw parseError;
    }
  } catch (error: any) { // Use 'any' to access error.name
    // Check for S3 Not Found error
    if (error.name === 'NoSuchKey') {
      logger.warn(`[API Core] Schema file not found in S3: ${SCHEMA_KEY}`);
      return createErrorResponse(
        'Schema file (schema.json) not found in storage.',
        404,
        'SCHEMA_FILE_NOT_FOUND'
      );
    }

    // Handle other S3 or unexpected errors
    logger.error(`[API Core] Error retrieving schema from S3: ${SCHEMA_KEY}`, error);
    return createErrorResponse(
      'Internal server error retrieving schema.',
      500,
      'INTERNAL_ERROR'
    );
  }
}

/**
 * Core handler for updating schema data
 * This function contains the business logic without being tied to Express or serverless
 */
export async function updateSchema(schemaData: any): Promise<ApiResponse> {
  logger.info('[API Core] Attempting to update schema');

  if (!Array.isArray(schemaData)) {
    return createErrorResponse('Invalid schema format. Expected an array of collection schemas.', 400, 'VALIDATION_ERROR');
  }

  logger.info(`[API Core] Attempting to update schema in S3 at key: ${SCHEMA_KEY}`);

  const command = new PutObjectCommand({
    Bucket: config.s3.bucketName,
    Key: SCHEMA_KEY,
    Body: JSON.stringify(schemaData, null, 2),
    ContentType: 'application/json',
    // Schema is private by default (no ACL specified)
  });

  try {
    await s3Client.send(command);
    logger.info(`[API Core] Successfully updated ${SCHEMA_KEY} in S3 bucket: ${config.s3.bucketName}`);
    return createSuccessResponse({ message: `Schema updated successfully at ${SCHEMA_KEY} in S3` });
  } catch (error) {
    logger.error(`[API Core] Error updating ${SCHEMA_KEY} in S3:`, error);
    return createErrorResponse(
      `Failed to update schema at ${SCHEMA_KEY} in S3`,
      500,
      'S3_UPDATE_ERROR'
    );
  }
}

/**
 * Core handler for retrieving schema metadata (LastModified, public status)
 * This function contains the business logic without being tied to Express or serverless
 */
export async function getSchemaMetadata(): Promise<ApiResponse> {
  logger.info('[API Core] Attempting to fetch schema metadata');

  logger.info(`[API Core] Attempting to fetch metadata for schema from S3 at key: ${SCHEMA_KEY}`);

  try {
    // 1. Get HeadObject for LastModified and other metadata
    const headCmd = new HeadObjectCommand({
      Bucket: config.s3.bucketName,
      Key: SCHEMA_KEY,
    });
    const headResponse = await s3Client.send(headCmd);
    const lastModified = headResponse.LastModified;

    // 2. Get Object ACL to check for public read access
    // Note: This requires s3:GetObjectAcl permission for the function's role
    let isPublic = false;
    try {
      const aclCmd = new GetObjectAclCommand({
        Bucket: config.s3.bucketName,
        Key: SCHEMA_KEY,
      });
      const aclResponse = await s3Client.send(aclCmd);
      isPublic = aclResponse.Grants?.some(
        (grant) =>
          grant.Grantee?.URI === 'http://acs.amazonaws.com/groups/global/AllUsers' &&
          (grant.Permission === 'READ' || grant.Permission === 'FULL_CONTROL')
      ) || false;
      logger.info(`[API Core] Schema public read status: ${isPublic}`);
    } catch (aclError: any) {
      // If GetObjectAcl fails (e.g., bucket owner enforced), we might not be able to determine public status
      // Or if ACLs are disabled. Log the error but don't fail the whole request.
      logger.warn(`[API Core] Could not determine ACL for ${SCHEMA_KEY}. Assuming not public. Error: ${aclError.message}`, aclError);
      // Depending on security posture, you might want to return an error or specific status here.
    }

    logger.info(`[API Core] Successfully retrieved metadata for schema: ${SCHEMA_KEY}`);
    return createSuccessResponse({
      lastModified: lastModified?.toISOString(), // Return as ISO string
      isPublic,
      // CORS info could be added here if needed via GetBucketCorsCommand
      // corsConfig: bucketCorsConfig, // Example
    });
  } catch (error: any) {
    // Check for S3 Not Found error before attempting to get metadata
    if (error.name === 'NotFound' || error.name === 'NoSuchKey') { // HeadObject might return 'NotFound'
      logger.warn(`[API Core] Schema file not found when fetching metadata: ${SCHEMA_KEY}`);
      return createErrorResponse(
        'Schema file (schema.json) not found in storage.',
        404,
        'SCHEMA_FILE_NOT_FOUND'
      );
    }

    // Handle other S3 or unexpected errors
    logger.error(`[API Core] Error retrieving schema metadata from S3: ${SCHEMA_KEY}`, error);
    return createErrorResponse(
      'Internal server error retrieving schema metadata.',
      500,
      'METADATA_RETRIEVAL_ERROR'
    );
  }
}

/**
 * Core handler for generating a pre-signed GET URL for the schema file.
 */
export async function getSchemaPresignedUrl(): Promise<ApiResponse> {
  logger.info('[API Core] Attempting to generate pre-signed URL for schema');

  try {
    const command = new GetObjectCommand({
      Bucket: config.s3.bucketName,
      Key: SCHEMA_KEY,
      ResponseContentType: 'application/json' // Hint browser to treat as JSON
    });

    // Generate pre-signed URL (expires in 60 seconds by default)
    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    logger.info(`[API Core] Successfully generated pre-signed URL for schema: ${SCHEMA_KEY}`);
    return createSuccessResponse({ url: url });
  } catch (error: any) {
    // Check for S3 Not Found error before attempting to sign
    if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
      logger.warn(`[API Core] Schema file not found when generating pre-signed URL: ${SCHEMA_KEY}`);
      return createErrorResponse(
        'Schema file (schema.json) not found. Cannot generate URL.',
        404,
        'SCHEMA_FILE_NOT_FOUND'
      );
    }
    logger.error(`[API Core] Error generating pre-signed URL for schema: ${SCHEMA_KEY}`, error);
    return createErrorResponse(
      `Failed to generate pre-signed URL for schema due to an internal error.`,
      500,
      'PRESIGN_URL_ERROR'
    );
  }
}

/**
 * Core handler for setting the schema file ACL to private.
 */
export async function makeSchemaPrivate(): Promise<ApiResponse> {
  logger.info('[API Core] Attempting to set schema ACL to private');

  try {
    const command = new PutObjectAclCommand({
      Bucket: config.s3.bucketName,
      Key: SCHEMA_KEY,
      ACL: 'private',
    });

    await s3Client.send(command);

    logger.info(`[API Core] Successfully set schema ACL to private for: ${SCHEMA_KEY}`);
    return createSuccessResponse({ message: 'Schema file ACL successfully set to private.' });
  } catch (error: any) {
    // Check for S3 Not Found error before attempting to set ACL
    if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
      logger.warn(`[API Core] Schema file not found when attempting to set ACL: ${SCHEMA_KEY}`);
      return createErrorResponse(
        'Schema file (schema.json) not found. Cannot set ACL.',
        404,
        'SCHEMA_FILE_NOT_FOUND'
      );
    }
    // Handle potential access denied errors
    if (error.name === 'AccessDenied') {
      logger.error(`[API Core] Access Denied setting schema ACL for: ${SCHEMA_KEY}`, error);
      return createErrorResponse(
        `Permission denied when trying to set schema file ACL to private. Check function permissions.`,
        403,
        'PERMISSION_ERROR'
      );
    }

    logger.error(`[API Core] Error setting schema ACL to private for: ${SCHEMA_KEY}`, error);
    return createErrorResponse(
      `Failed to set schema file ACL to private due to an internal error.`,
      500,
      'SET_ACL_ERROR'
    );
  }
}
