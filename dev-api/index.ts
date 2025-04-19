import express, { Request, Response } from 'express';
import cors from 'cors';
import schemaRoutes from './api/schema';
import collectionRoutes from './api/collection';
import metadataHandler from './api/schema-metadata';
import presignedUrlHandler from './api/schema-presigned-url';
import makePrivateHandler from './api/schema-make-private';
import { handleLogin } from './core-api';
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
app.post('/api/login', async (req: Request, res: Response) => {
  // Pass the request body directly, assuming it matches LoginRequestBody
  // The express.json() middleware should have parsed it.
  const credentials = req.body;

  // Basic check if credentials object is provided
  if (!credentials || typeof credentials !== 'object' || Object.keys(credentials).length === 0) {
    res.status(400).json({ message: 'Invalid or empty request body.' });
    return; // Explicitly return void after sending response
  }

  try {
    // Call handleLogin with the request body
    const apiResponse = await handleLogin(credentials);

    if (apiResponse.headers) {
      res.set(apiResponse.headers);
    }

    // Send the response based on ApiResponse structure
    res.status(apiResponse.statusCode).json(apiResponse.body);

  } catch (error) {
    console.error('Error handling /api/login:', error);
    // Ensure a response is always sent in case of unexpected errors
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
});

// Root/Health Check Route - can remain public
app.get('/', (req: Request, res: Response) => {
  res.send('Static Press API Server is running.');
});

// --- Protected Routes (Auth Required) ---
// Mount protected routers, applying middleware individually
app.use('/api/schema', authenticateToken, schemaRoutes);
app.use('/api/collections', authenticateToken, collectionRoutes);

// Add the new route for schema metadata
app.get('/api/schema/metadata', authenticateToken, metadataHandler);

// Add new routes for presigned URL and making schema private
app.get('/api/schema/presigned-url', authenticateToken, presignedUrlHandler);
app.put('/api/schema/make-private', authenticateToken, makePrivateHandler);

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
