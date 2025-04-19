import { Router, Request, Response, NextFunction } from 'express';
import {
  getSchema,
  updateSchema,
  getSchemaMetadata,
  getSchemaPresignedUrl,
  makeSchemaPrivate
} from '../../lib/api-logic/handlers/schema';

const router = Router();

// GET schema data
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  console.log(`[API Server] Received GET /api/schema`);
  const result = await getSchema();
  res.status(result.statusCode).json(result.body);
});

// PUT schema data
router.put('/', async (req: Request, res: Response, next: NextFunction) => {
  const schemaData = req.body;
  console.log(`[API Server] Received PUT /api/schema`);
  const result = await updateSchema(schemaData);
  res.status(result.statusCode).json(result.body);
});

// GET /api/schema/metadata
router.get('/metadata', async (_req: Request, res: Response, next: NextFunction) => {
  console.log('[API Server] Received GET /api/schema/metadata');
  const result = await getSchemaMetadata();
  res.status(result.statusCode).json(result.body);
});

// GET /api/schema/presigned-url
router.get('/presigned-url', async (_req: Request, res: Response, next: NextFunction) => {
  console.log('[API Server] Received GET /api/schema/presigned-url');
  const result = await getSchemaPresignedUrl();
  res.status(result.statusCode).json(result.body);
});

// PUT /api/schema/make-private
router.put('/make-private', async (_req: Request, res: Response, next: NextFunction) => {
  console.log('[API Server] Received PUT /api/schema/make-private');
  const result = await makeSchemaPrivate();
  res.status(result.statusCode).json(result.body);
});

export default router;
