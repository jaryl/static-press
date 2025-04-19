import { Readable } from 'stream';
import { ApiResponse, createSuccessResponse, createErrorResponse } from '../utils/response';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { streamToString } from '../../utils/stream';
import { getObjectMetadata, isObjectPublic, setObjectAcl, putObjectJson, getObjectStream, generatePresignedGetUrl } from '../../utils/s3Utils';

// Schema is always at the root level
const SCHEMA_KEY = 'schema.json';

/**
 * Core handler for retrieving schema data
 * This function contains the business logic without being tied to Express or serverless
 */
export async function getSchema(): Promise<ApiResponse> {
  logger.info(`[API Core] Attempting to fetch schema from S3 at key: ${SCHEMA_KEY}`);

  try {
    // Use the new utility function to get the stream
    const stream = await getObjectStream(SCHEMA_KEY);

    if (!stream) {
      // getObjectStream returns null if NoSuchKey
      logger.warn(`[API Core] Schema file not found (NoSuchKey): ${SCHEMA_KEY}`);
      return createErrorResponse('Schema file (schema.json) not found.', 404, 'SCHEMA_FILE_NOT_FOUND');
    }

    // Attempt to parse the content from the stream
    try {
      const bodyContents = await streamToString(stream as Readable);
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
  if (!Array.isArray(schemaData)) {
    return createErrorResponse('Invalid schema format. Expected an array of collection schemas.', 400, 'VALIDATION_ERROR');
  }

  logger.info(`[API Core] Attempting to update schema in S3 at key: ${SCHEMA_KEY}`);

  try {
    // Use the new utility function, ensure schema remains public
    await putObjectJson(SCHEMA_KEY, schemaData, 'public-read');

    logger.info(`[API Core] Successfully updated schema in S3: ${SCHEMA_KEY}`);
    return createSuccessResponse({ message: 'Schema updated successfully in S3' });
  } catch (error) {
    logger.error(`[API Core] Error updating schema in S3:`, error);
    return createErrorResponse(
      `Failed to update schema in S3`,
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
  logger.info(`[API Core] Attempting to fetch metadata for schema from S3 at key: ${SCHEMA_KEY}`);

  try {
    // Use the new utility function for metadata
    const objectMetadata = await getObjectMetadata(SCHEMA_KEY);

    if (!objectMetadata) {
      logger.warn(`[API Core] Metadata not found for ${SCHEMA_KEY}`);
      return createErrorResponse(
        'Schema file (schema.json) not found in storage.',
        404,
        'SCHEMA_FILE_NOT_FOUND'
      );
    }

    // Use the new utility function to check public status
    const isPublic = await isObjectPublic(SCHEMA_KEY);

    logger.info(`[API Core] Successfully retrieved metadata for schema: ${SCHEMA_KEY}`);
    return createSuccessResponse({
      lastModified: objectMetadata.lastModified?.toISOString(), // Return as ISO string
      isPublic,
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
  logger.info(`[API Core] Attempting to generate pre-signed URL for schema: ${SCHEMA_KEY}`);
  const expiresIn = config.urls.presignedUrlExpirySeconds; // Use configured expiry

  try {
    // Use the new utility function
    const url = await generatePresignedGetUrl(SCHEMA_KEY, expiresIn);

    logger.info(`[API Core] Successfully generated pre-signed URL for schema: ${SCHEMA_KEY}`);
    return createSuccessResponse({ presignedUrl: url });
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
  logger.info(`[API Core] Attempting to set ACL for schema: ${SCHEMA_KEY} to private`);

  try {
    // Use the new utility function to set ACL
    await setObjectAcl(SCHEMA_KEY, 'private');

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
