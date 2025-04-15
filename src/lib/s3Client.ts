import { S3Client } from "@aws-sdk/client-s3";

// Server-side S3 configuration (not prefixed with VITE_)
const region = process.env.S3_REGION;
const endpoint = process.env.S3_ENDPOINT_URL || process.env.VITE_S3_ENDPOINT_URL;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const bucketName = process.env.S3_BUCKET_NAME || process.env.VITE_S3_BUCKET_NAME;

if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
  console.error(
    "FATAL ERROR: AWS S3 configuration (S3_REGION, S3_BUCKET_NAME, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY) must be available in process.env."
  );
  throw new Error("Missing required S3 configuration for API server.");
} else {
  console.log("[s3Client] S3 configuration loaded successfully for API server.");
  console.log(`[s3Client]   Region: ${region}`);
  console.log(`[s3Client]   Bucket: ${bucketName}`);
  console.log(`[s3Client]   Endpoint: ${endpoint || 'Default AWS'}`);
}

const s3Client = new S3Client({
  region: region,
  endpoint: endpoint,
  credentials: {
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
  },
  forcePathStyle: !!endpoint,
});

export { s3Client, bucketName };
