// server/api/collection.ts
import { Router, Request, Response } from 'express';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, bucketName } from '../../src/lib/s3Client'; // Adjusted path
import path from 'path';

const router = Router();
const s3BasePath = process.env.S3_BASE_PATH || ''; // Re-read base path

// PUT collection data
router.put('/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  const recordsData = req.body;
  console.log(`[API Server] Received PUT /api/collections/${slug}`);

  if (!Array.isArray(recordsData)) {
    res.status(400).json({ message: 'Invalid data format. Expected an array of records.' });
    return;
  }

  if (!bucketName) {
    console.error("[API Server] S3 bucket name is missing!");
    res.status(500).json({ message: 'Server configuration error: S3 bucket name missing.' });
    return;
  }

  const key = path.join(s3BasePath, `${slug}.json`).replace(/\\/g, '/');

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: JSON.stringify(recordsData, null, 2),
    ContentType: 'application/json',
    ACL: 'public-read',
  });

  try {
    await s3Client.send(command);
    console.log(`[API Server] Successfully updated ${key} in S3 bucket: ${bucketName}`);
    res.status(200).json({ message: `Collection ${slug} updated successfully in S3` });
  } catch (error) {
    console.error(`[API Server] Error updating ${key} in S3:`, error);
    res.status(500).json({ message: `Failed to update collection ${slug} in S3`, error: error instanceof Error ? error.message : String(error) });
  }
});

export default router;
