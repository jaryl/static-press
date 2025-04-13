import { S3Client } from "@aws-sdk/client-s3";

const region = import.meta.env.S3_REGION;
const endpoint = import.meta.env.S3_ENDPOINT_URL; // Optional: for S3-compatible storage
const accessKeyId = import.meta.env.S3_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.S3_SECRET_ACCESS_KEY;
const bucketName = import.meta.env.S3_BUCKET_NAME;

if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
  // Log a warning but allow the app to run if adapter type isn't 'remote'
  // Operations requiring S3 will fail later if adapter is 'remote'
  console.warn(
    "AWS S3 configuration (region, bucket, credentials) not fully set in environment variables. Remote operations will fail if attempted."
  );
}

// Basic configuration
const s3Client = new S3Client({
  region: region,
  endpoint: endpoint, // SDK handles undefined endpoint correctly for AWS S3
  credentials: {
    accessKeyId: accessKeyId || "", // Provide defaults to satisfy types
    secretAccessKey: secretAccessKey || "",
  },
  forcePathStyle: !!endpoint, // Often needed for S3-compatible storage
});

export { s3Client, bucketName };
