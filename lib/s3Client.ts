import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.VITE_S3_ENDPOINT_URL;
const bucketName = process.env.VITE_S3_BUCKET_NAME;

const region = process.env.S3_REGION;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
  console.error(
    "FATAL ERROR: AWS S3 configuration (VITE_S3_REGION, VITE_S3_BUCKET_NAME, VITE_S3_ACCESS_KEY_ID, VITE_S3_SECRET_ACCESS_KEY) must be available in process.env."
  );
  console.log("[s3Client] S3 Bucket Name is NOT configured. API will fail S3 operations.");
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

export { s3Client };
