// server/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import schemaRoutes from './api/schema';
import collectionRoutes from './api/collection';

const app = express();
const port = process.env.API_PORT || 3001;
const viteDevServerUrl = process.env.VITE_DEV_SERVER_URL;
const bucketName = process.env.S3_BUCKET_NAME;

// Middleware
app.use(cors({ origin: viteDevServerUrl })); // Allow requests from Vite dev server
app.use(express.json()); // Parse JSON request bodies

// Mount Routers
app.use('/api/schema', schemaRoutes);
app.use('/api/collections', collectionRoutes);

// Root/Health Check Route
app.get('/', (req: Request, res: Response) => {
  res.send('Static Press API Server is running.');
});

// Start Server
app.listen(port, () => {
  console.log(`[API Server] Listening on port ${port}`);
  console.log(`[API Server] Allowing CORS origin: ${viteDevServerUrl}`);

  if (bucketName) {
    console.log(`[API Server] Configured to use S3 Bucket: ${bucketName}`);
  } else {
    console.error(`[API Server] S3 Bucket Name is NOT configured. API will fail S3 operations.`);
  }
});
