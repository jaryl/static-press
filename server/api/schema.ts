// server/api/schema.ts
import { Router, Request, Response } from 'express';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, bucketName } from '../../src/lib/s3Client'; // Adjusted path
import { Readable } from 'stream';

const router = Router();

// Schema is always at the root level
const SCHEMA_KEY = 'schema.json';

// Helper function to stream S3 response to string
async function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

// GET schema data
router.get('/', async (_req: Request, res: Response) => {
  console.log(`[API Server] Received GET /api/schema`);

  if (!bucketName) {
    console.error("[API Server] S3 bucket name is missing!");
    res.status(500).json({ message: 'Server configuration error: S3 bucket name missing.' });
    return;
  }

  console.log(`[API Server] Attempting to fetch schema from S3 at key: ${SCHEMA_KEY}`);

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: SCHEMA_KEY,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error('Empty response body');
    }

    const bodyContents = await streamToString(response.Body as Readable);
    const schemaData = JSON.parse(bodyContents);

    console.log(`[API Server] Successfully retrieved schema from S3: ${SCHEMA_KEY}`);
    res.status(200).json(schemaData);
  } catch (error) {
    console.error(`[API Server] Error retrieving schema from S3: ${SCHEMA_KEY}`, error);
    res.status(500).json({
      message: `Failed to retrieve schema from S3`,
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// PUT schema data
router.put('/', async (req: Request, res: Response) => {
  const schemaData = req.body;
  console.log(`[API Server] Received PUT /api/schema`);

  if (!Array.isArray(schemaData)) {
    res.status(400).json({ message: 'Invalid schema format. Expected an array.' });
    return;
  }

  if (!bucketName) {
    console.error("[API Server] S3 bucket name is missing!");
    res.status(500).json({ message: 'Server configuration error: S3 bucket name missing.' });
    return;
  }

  console.log(`[API Server] Attempting to update schema in S3 at key: ${SCHEMA_KEY}`);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: SCHEMA_KEY,
    Body: JSON.stringify(schemaData, null, 2),
    ContentType: 'application/json',
    // Schema is private by default (no ACL specified)
  });

  try {
    await s3Client.send(command);
    console.log(`[API Server] Successfully updated ${SCHEMA_KEY} in S3 bucket: ${bucketName}`);
    res.status(200).json({ message: `Schema updated successfully at ${SCHEMA_KEY} in S3` });
  } catch (error) {
    console.error(`[API Server] Error updating ${SCHEMA_KEY} in S3:`, error);
    res.status(500).json({ message: `Failed to update schema at ${SCHEMA_KEY} in S3`, error: error instanceof Error ? error.message : String(error) });
  }
});

export default router;
