import {
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectAclCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { s3Client } from '../s3Client';
import { config } from '../config';
import { logger } from './logger';
import { Readable } from 'stream';
import { Buffer } from 'buffer';

export interface S3ObjectMetadata {
  lastModified?: Date;
  contentLength?: number;
  contentType?: string;
  // Add other relevant metadata fields as needed
}

/**
 * Puts a JSON object into S3.
 *
 * @param key - The S3 object key.
 * @param data - The JSON-serializable data to put.
 * @param acl - Optional ACL setting (e.g., 'private', 'public-read'). Defaults to private.
 * @throws Error on S3 error.
 */
export async function putObjectJson(key: string, data: any, acl: 'private' | 'public-read' = 'private'): Promise<void> {
  logger.info(`[S3 Utils] Attempting to put JSON object: ${key} with ACL: ${acl}`);
  const command = new PutObjectCommand({
    Bucket: config.s3.bucketName,
    Key: key,
    Body: JSON.stringify(data, null, 2), // Pretty-print JSON
    ContentType: 'application/json',
    ACL: acl,
  });

  try {
    await s3Client.send(command);
    logger.info(`[S3 Utils] Successfully put object: ${key}`);
  } catch (error) {
    logger.error(`[S3 Utils] Error putting object ${key} to S3`, error);
    throw new Error(`S3 Error putting object ${key}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fetches basic metadata for an S3 object.
 * Handles 'NotFound' errors gracefully.
 *
 * @param key - The S3 object key.
 * @returns An S3ObjectMetadata object or null if not found.
 * @throws Error for S3 errors other than NotFound.
 */
export async function getObjectMetadata(key: string): Promise<S3ObjectMetadata | null> {
  logger.info(`[S3 Utils] Attempting to get metadata for object: ${key}`);
  const command = new HeadObjectCommand({
    Bucket: config.s3.bucketName,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    logger.info(`[S3 Utils] Successfully retrieved metadata for object: ${key}`);
    return {
      lastModified: response.LastModified,
      contentLength: response.ContentLength,
      contentType: response.ContentType,
    };
  } catch (error) {
    // HeadObject might throw 'NotFound' or 'NoSuchKey'. Use instanceof Error.
    if (error instanceof Error && (error.name === 'NotFound' || error.name === 'NoSuchKey')) {
      logger.warn(`[S3 Utils] Object not found (NotFound/NoSuchKey) when fetching metadata: ${key}`);
      return null; // Indicate not found
    }
    logger.error(`[S3 Utils] Error getting metadata for object ${key} from S3`, error);
    throw new Error(`S3 Error getting metadata for object ${key}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Checks if an S3 object is publicly readable via ACL.
 * Logs warnings if ACLs cannot be read but doesn't throw an error.
 *
 * @param key - The S3 object key.
 * @returns True if publicly readable, false otherwise or if ACLs cannot be determined.
 * @throws Error only if the underlying GetObjectAclCommand fails for reasons other than access/existence issues.
 */
export async function isObjectPublic(key: string): Promise<boolean> {
  logger.info(`[S3 Utils] Attempting to check public status for object: ${key}`);
  const command = new GetObjectAclCommand({
    Bucket: config.s3.bucketName,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    const isPublic = response.Grants?.some(
      (grant) =>
        grant.Grantee?.URI === 'http://acs.amazonaws.com/groups/global/AllUsers' &&
        (grant.Permission === 'READ' || grant.Permission === 'FULL_CONTROL')
    ) || false;
    logger.info(`[S3 Utils] Public status for ${key}: ${isPublic}`);
    return isPublic;
  } catch (error) {
    // If GetObjectAcl fails (e.g., permission denied, ACLs disabled), log a warning but assume private.
    // Don't fail the whole operation just because we can't check public status.
    // NoSuchKey should ideally be caught by checking metadata first, but handle it defensively.
    // Use instanceof Error for type safety
    if (error instanceof Error && error.name === 'NoSuchKey') {
      logger.warn(`[S3 Utils] Object ${key} not found when checking ACL. Assuming private.`);
    } else {
      // Use instanceof Error for type safety
      logger.warn(`[S3 Utils] Could not determine ACL for ${key}. Assuming private. Error: ${error instanceof Error ? error.message : String(error)}`, error);
    }
    return false; // Default to false if ACL check fails
  }
}

/**
 * Sets the ACL for an S3 object.
 *
 * @param key - The S3 object key.
 * @param acl - The ACL to set ('private' or 'public-read').
 * @throws Error on S3 error (e.g., NotFound, AccessDenied).
 */
export async function setObjectAcl(key: string, acl: 'private' | 'public-read'): Promise<void> {
  logger.info(`[S3 Utils] Attempting to set ACL to '${acl}' for object: ${key}`);
  // Copy the object onto itself with the new ACL
  const copyCommand = new CopyObjectCommand({
    Bucket: config.s3.bucketName,
    CopySource: `${config.s3.bucketName}/${key}`, // Source includes bucket name
    Key: key,
    ACL: acl, // Apply the new ACL
    MetadataDirective: 'REPLACE', // Replace metadata (including ACL)
  });

  console.log(`[setObjectAcl] Attempting to set ACL '${acl}' for key '${key}' by copying`);
  try {
    await s3Client.send(copyCommand);
    logger.info(`[S3 Utils] Successfully set ACL to '${acl}' for object: ${key}`);
  } catch (error) {
    logger.error(`[S3 Utils] Error setting ACL for object ${key} to '${acl}'`, error);
    // Re-throw the error so the caller can handle specific cases like NotFound or AccessDenied
    // Use instanceof Error for type safety
    throw new Error(`S3 Error setting ACL for ${key}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fetches an object's body as a Readable stream from S3.
 * Handles 'NoSuchKey' errors gracefully.
 *
 * @param key - The S3 object key.
 * @returns The Readable stream or null if not found.
 * @throws Error for S3 errors other than NoSuchKey.
 */
export async function getObjectStream(key: string): Promise<Readable | null> {
  logger.info(`[S3 Utils] Attempting to get object stream: ${key}`);
  const command = new GetObjectCommand({
    Bucket: config.s3.bucketName,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    if (!response.Body) {
      // This case is less likely for GetObject but good practice
      logger.warn(`[S3 Utils] Empty response body from S3 for key: ${key}`);
      return null;
    }
    logger.info(`[S3 Utils] Successfully retrieved stream for object: ${key}`);
    // Ensure the body is a Readable stream (type assertion needed for Node.js)
    return response.Body as Readable;
  } catch (error) {
    if (error instanceof Error && error.name === 'NoSuchKey') {
      logger.warn(`[S3 Utils] Object not found (NoSuchKey) when getting stream: ${key}`);
      return null; // Return null to indicate not found
    }
    logger.error(`[S3 Utils] Error getting object stream ${key} from S3`, error);
    throw new Error(`S3 Error getting object stream ${key}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generates a pre-signed GET URL for an S3 object.
 *
 * @param key - The S3 object key.
 * @param expiresIn - URL validity duration in seconds. Defaults to 3600 (1 hour).
 * @returns The pre-signed URL string.
 * @throws Error on S3 error or signing error.
 */
export async function generatePresignedGetUrl(key: string, expiresIn: number = 3600): Promise<string> {
  logger.info(`[S3 Utils] Attempting to generate pre-signed GET URL for: ${key}, expiresIn: ${expiresIn}s`);
  const command = new GetObjectCommand({
    Bucket: config.s3.bucketName,
    Key: key,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    logger.info(`[S3 Utils] Successfully generated pre-signed URL for: ${key}`);
    return url;
  } catch (error) {
    logger.error(`[S3 Utils] Error generating pre-signed URL for ${key}`, error);
    // Note: getSignedUrl might throw errors if the command is invalid or credentials are bad
    throw new Error(`S3 Error generating pre-signed URL for ${key}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Lists objects in an S3 bucket with a specific prefix and delimiter.
 *
 * @param prefix - The prefix to filter objects by.
 * @param delimiter - The delimiter to use (typically '/' for directory-like behavior).
 * @returns Array of prefixes (directory names) matching the criteria.
 * @throws Error on S3 error.
 */
export async function listObjects(prefix: string, delimiter: string = '/'): Promise<string[]> {
  logger.info(`[S3 Utils] Listing objects with prefix: ${prefix} and delimiter: ${delimiter}`);

  const command = new ListObjectsV2Command({
    Bucket: config.s3.bucketName,
    Prefix: prefix,
    Delimiter: delimiter
  });

  try {
    const response = await s3Client.send(command);

    // Extract CommonPrefixes (which are like directories)
    const prefixes: string[] = [];

    if (response.CommonPrefixes && response.CommonPrefixes.length > 0) {
      response.CommonPrefixes.forEach(prefix => {
        if (prefix.Prefix) {
          prefixes.push(prefix.Prefix);
        }
      });
    }

    logger.info(`[S3 Utils] Found ${prefixes.length} prefixes for ${prefix}`);
    return prefixes;
  } catch (error) {
    logger.error(`[S3 Utils] Error listing objects with prefix ${prefix}`, error);
    throw new Error(`S3 Error listing objects with prefix ${prefix}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Deletes an object from S3.
 *
 * @param key - The S3 object key to delete.
 * @throws Error on S3 error.
 */
export async function deleteObject(key: string): Promise<void> {
  logger.info(`[S3 Utils] Attempting to delete object: ${key}`);

  const command = new DeleteObjectCommand({
    Bucket: config.s3.bucketName,
    Key: key
  });

  try {
    await s3Client.send(command);
    logger.info(`[S3 Utils] Successfully deleted object: ${key}`);
  } catch (error) {
    logger.error(`[S3 Utils] Error deleting object ${key}`, error);
    throw new Error(`S3 Error deleting object ${key}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Converts a Readable stream to a string.
 *
 * @param stream - The Readable stream to convert.
 * @returns A promise that resolves with the string content of the stream.
 */
export async function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}
