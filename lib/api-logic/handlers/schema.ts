import { PutObjectCommand, GetObjectCommand, HeadObjectCommand, GetObjectAclCommand, PutObjectAclCommand } from '@aws-sdk/client-s3';
import { s3Client, bucketName } from '../../s3Client.ts';
import { Readable } from 'stream';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Schema is always at the root level
const SCHEMA_KEY = 'schema.json';

// Helper function to convert stream to string
async function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

/**
 * Core handler for retrieving schema data
 * This function contains the business logic without being tied to Express or serverless
 */
export async function getSchema() {
  console.log(`[API Core] Attempting to fetch schema`);

  if (!bucketName) {
    console.error("[API Core] S3 bucket name is missing!");
    return {
      statusCode: 500,
      body: {
        errorType: 'CONFIGURATION_ERROR', // Added errorType
        message: 'Server configuration error: S3 bucket name missing.'
      }
    };
  }

  console.log(`[API Core] Attempting to fetch schema from S3 at key: ${SCHEMA_KEY}`);

  try {
    // Attempt to get the object
    const command = new GetObjectCommand({
      Bucket: bucketName,
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

      console.log(`[API Core] Successfully retrieved and parsed schema from S3: ${SCHEMA_KEY}`);
      return {
        statusCode: 200,
        body: schemaData
      };
    } catch (parseError) {
      // Handle JSON parsing error specifically
      if (parseError instanceof SyntaxError) {
        console.error(`[API Core] Error parsing schema JSON from S3: ${SCHEMA_KEY}`, parseError);
        return {
          statusCode: 500,
          body: {
            errorType: 'SCHEMA_MALFORMED',
            message: `Failed to parse schema file (schema.json): ${parseError.message}`
          }
        };
      }
      // Re-throw other stream/parsing errors to be caught below
      throw parseError;
    }
  } catch (error: any) { // Use 'any' to access error.name
    // Check for S3 Not Found error
    if (error.name === 'NoSuchKey') {
      console.warn(`[API Core] Schema file not found in S3: ${SCHEMA_KEY}`);
      return {
        statusCode: 404,
        body: {
          errorType: 'SCHEMA_FILE_NOT_FOUND',
          message: 'Schema file (schema.json) not found in storage.'
        }
      };
    }

    // Handle other S3 or unexpected errors
    console.error(`[API Core] Error retrieving schema from S3: ${SCHEMA_KEY}`, error);
    return {
      statusCode: 500,
      body: {
        errorType: 'INTERNAL_ERROR',
        message: `Failed to retrieve schema from S3 due to an internal error.`,
        // Optionally include error details in dev mode, but be cautious in prod
        // error: error instanceof Error ? error.message : String(error)
      }
    };
  }
}

/**
 * Core handler for updating schema data
 * This function contains the business logic without being tied to Express or serverless
 */
export async function updateSchema(schemaData: any) {
  console.log(`[API Core] Attempting to update schema`);

  if (!Array.isArray(schemaData)) {
    return {
      statusCode: 400,
      body: { message: 'Invalid schema format. Expected an array of collection schemas.' }
    };
  }

  if (!bucketName) {
    console.error("[API Core] S3 bucket name is missing!");
    return {
      statusCode: 500,
      body: { message: 'Server configuration error: S3 bucket name missing.' }
    };
  }

  console.log(`[API Core] Attempting to update schema in S3 at key: ${SCHEMA_KEY}`);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: SCHEMA_KEY,
    Body: JSON.stringify(schemaData, null, 2),
    ContentType: 'application/json',
    // Schema is private by default (no ACL specified)
  });

  try {
    await s3Client.send(command);
    console.log(`[API Core] Successfully updated ${SCHEMA_KEY} in S3 bucket: ${bucketName}`);
    return {
      statusCode: 200,
      body: { message: `Schema updated successfully at ${SCHEMA_KEY} in S3` }
    };
  } catch (error) {
    console.error(`[API Core] Error updating ${SCHEMA_KEY} in S3:`, error);
    return {
      statusCode: 500,
      body: {
        message: `Failed to update schema at ${SCHEMA_KEY} in S3`,
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
}

/**
 * Core handler for retrieving schema metadata (LastModified, public status)
 * This function contains the business logic without being tied to Express or serverless
 */
export async function getSchemaMetadata() {
  console.log(`[API Core] Attempting to fetch schema metadata`);

  if (!bucketName) {
    console.error("[API Core] S3 bucket name is missing!");
    return {
      statusCode: 500,
      body: {
        errorType: 'CONFIGURATION_ERROR',
        message: 'Server configuration error: S3 bucket name missing.'
      }
    };
  }

  console.log(`[API Core] Attempting to fetch metadata for schema from S3 at key: ${SCHEMA_KEY}`);

  try {
    // 1. Get HeadObject for LastModified and other metadata
    const headCmd = new HeadObjectCommand({
      Bucket: bucketName,
      Key: SCHEMA_KEY,
    });
    const headResponse = await s3Client.send(headCmd);
    const lastModified = headResponse.LastModified;

    // 2. Get Object ACL to check for public read access
    // Note: This requires s3:GetObjectAcl permission for the function's role
    let isPublic = false;
    try {
      const aclCmd = new GetObjectAclCommand({
        Bucket: bucketName,
        Key: SCHEMA_KEY,
      });
      const aclResponse = await s3Client.send(aclCmd);
      isPublic = aclResponse.Grants?.some(
        (grant) =>
          grant.Grantee?.URI === 'http://acs.amazonaws.com/groups/global/AllUsers' &&
          (grant.Permission === 'READ' || grant.Permission === 'FULL_CONTROL')
      ) || false;
      console.log(`[API Core] Schema public read status: ${isPublic}`);
    } catch (aclError: any) {
      // If GetObjectAcl fails (e.g., bucket owner enforced), we might not be able to determine public status
      // Or if ACLs are disabled. Log the error but don't fail the whole request.
      console.warn(`[API Core] Could not determine ACL for ${SCHEMA_KEY}. Assuming not public. Error: ${aclError.message}`);
      // Depending on security posture, you might want to return an error or specific status here.
    }

    console.log(`[API Core] Successfully retrieved metadata for schema: ${SCHEMA_KEY}`);
    return {
      statusCode: 200,
      body: {
        lastModified: lastModified?.toISOString(), // Return as ISO string
        isPublic,
        // CORS info could be added here if needed via GetBucketCorsCommand
        // corsConfig: bucketCorsConfig, // Example
      }
    };
  } catch (error: any) {
    // Check for S3 Not Found error (applies to HeadObject as well)
    if (error.name === 'NotFound' || error.name === 'NoSuchKey') { // HeadObject might return 'NotFound'
      console.warn(`[API Core] Schema file not found when fetching metadata: ${SCHEMA_KEY}`);
      return {
        statusCode: 404,
        body: {
          errorType: 'SCHEMA_FILE_NOT_FOUND',
          message: 'Schema file (schema.json) not found in storage.'
        }
      };
    }

    // Handle other S3 or unexpected errors
    console.error(`[API Core] Error retrieving schema metadata from S3: ${SCHEMA_KEY}`, error);
    return {
      statusCode: 500,
      body: {
        errorType: 'INTERNAL_ERROR',
        message: `Failed to retrieve schema metadata from S3 due to an internal error.`,
      }
    };
  }
}

/**
 * Core handler for generating a pre-signed GET URL for the schema file.
 */
export async function getSchemaPresignedUrl() {
  console.log(`[API Core] Attempting to generate pre-signed URL for schema`);

  if (!bucketName) {
    console.error("[API Core] S3 bucket name is missing!");
    return {
      statusCode: 500,
      body: {
        errorType: 'CONFIGURATION_ERROR',
        message: 'Server configuration error: S3 bucket name missing.'
      }
    };
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: SCHEMA_KEY,
      ResponseContentType: 'application/json' // Hint browser to treat as JSON
    });

    // Generate pre-signed URL (expires in 60 seconds by default)
    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    console.log(`[API Core] Successfully generated pre-signed URL for schema: ${SCHEMA_KEY}`);
    return {
      statusCode: 200,
      body: {
        url: url
      }
    };
  } catch (error: any) {
    // Check for S3 Not Found error before attempting to sign
    if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
      console.warn(`[API Core] Schema file not found when generating pre-signed URL: ${SCHEMA_KEY}`);
      return {
        statusCode: 404,
        body: {
          errorType: 'SCHEMA_FILE_NOT_FOUND',
          message: 'Schema file (schema.json) not found. Cannot generate URL.'
        }
      };
    }
    console.error(`[API Core] Error generating pre-signed URL for schema: ${SCHEMA_KEY}`, error);
    return {
      statusCode: 500,
      body: {
        errorType: 'PRESIGN_URL_ERROR',
        message: `Failed to generate pre-signed URL for schema due to an internal error.`,
      }
    };
  }
}

/**
 * Core handler for setting the schema file ACL to private.
 */
export async function makeSchemaPrivate() {
  console.log(`[API Core] Attempting to set schema ACL to private`);

  if (!bucketName) {
    console.error("[API Core] S3 bucket name is missing!");
    return {
      statusCode: 500,
      body: {
        errorType: 'CONFIGURATION_ERROR',
        message: 'Server configuration error: S3 bucket name missing.'
      }
    };
  }

  try {
    const command = new PutObjectAclCommand({
      Bucket: bucketName,
      Key: SCHEMA_KEY,
      ACL: 'private',
    });

    await s3Client.send(command);

    console.log(`[API Core] Successfully set schema ACL to private for: ${SCHEMA_KEY}`);
    return {
      statusCode: 200,
      body: {
        message: 'Schema file ACL successfully set to private.'
      }
    };
  } catch (error: any) {
    // Check for S3 Not Found error before attempting to set ACL
    if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
      console.warn(`[API Core] Schema file not found when attempting to set ACL: ${SCHEMA_KEY}`);
      return {
        statusCode: 404,
        body: {
          errorType: 'SCHEMA_FILE_NOT_FOUND',
          message: 'Schema file (schema.json) not found. Cannot set ACL.'
        }
      };
    }
    // Handle potential access denied errors
    if (error.name === 'AccessDenied') {
      console.error(`[API Core] Access Denied setting schema ACL for: ${SCHEMA_KEY}`, error);
      return {
        statusCode: 403,
        body: {
          errorType: 'PERMISSION_ERROR',
          message: `Permission denied when trying to set schema file ACL to private. Check function permissions.`,
        }
      };
    }

    console.error(`[API Core] Error setting schema ACL to private for: ${SCHEMA_KEY}`, error);
    return {
      statusCode: 500,
      body: {
        errorType: 'SET_ACL_ERROR',
        message: `Failed to set schema file ACL to private due to an internal error.`,
      }
    };
  }
}
