import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, bucketName } from '../../s3Client.ts';
import { Readable } from 'stream';

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
