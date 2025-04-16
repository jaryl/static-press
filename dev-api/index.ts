import express, { Request, Response } from 'express';
import cors from 'cors';
import schemaRoutes from './api/schema';
import collectionRoutes from './api/collection';
import { handleLogin } from '../src/lib/api-logic/handlers/auth';
import { authenticateToken } from './middleware/auth';

const app = express();
const port = process.env.API_PORT || 3001;
const viteDevServerUrl = process.env.VITE_DEV_SERVER_URL;
const bucketName = process.env.VITE_S3_BUCKET_NAME;

// Middleware
app.use(cors({ origin: viteDevServerUrl })); // Allow requests from Vite dev server
app.use(express.json()); // Parse JSON request bodies

// --- Public Routes (No Auth Required) ---
// Login route - must be public
app.post('/api/login', (req: Request, res: Response) => {
  const rawBody = req.body ? JSON.stringify(req.body) : null;
  const apiResponse = handleLogin(rawBody);
  if (apiResponse.headers) {
    res.set(apiResponse.headers);
  }
  res.status(apiResponse.statusCode).json(apiResponse.body);
});

// Root/Health Check Route - can remain public
app.get('/', (req: Request, res: Response) => {
  res.send('Static Press API Server is running.');
});

// --- Protected Routes (Auth Required) ---
// Mount protected routers, applying middleware individually
app.use('/api/schema', authenticateToken, schemaRoutes);
app.use('/api/collections', authenticateToken, collectionRoutes);

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
