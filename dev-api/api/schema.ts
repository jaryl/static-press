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
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const siteId = req.query.siteId as string || 'default';
  console.log(`[API Server] Received GET /api/schema for site ${siteId}`);
  const result = await getSchema(siteId);
  res.status(result.statusCode).json(result.body);
});

// PUT schema data
router.put('/', async (req: Request, res: Response, next: NextFunction) => {
  const schemaData = req.body;
  const siteId = req.query.siteId as string || 'default';
  console.log(`[API Server] Received PUT /api/schema for site ${siteId}`);
  const result = await updateSchema(schemaData, siteId);
  res.status(result.statusCode).json(result.body);
});

// GET /api/schema/metadata
router.get('/metadata', async (req: Request, res: Response, next: NextFunction) => {
  const siteId = req.query.siteId as string || 'default';
  console.log(`[API Server] Received GET /api/schema/metadata for site ${siteId}`);
  const result = await getSchemaMetadata(siteId);
  res.status(result.statusCode).json(result.body);
});

// GET /api/schema/presigned-url
router.get('/presigned-url', async (req: Request, res: Response, next: NextFunction) => {
  const siteId = req.query.siteId as string || 'default';
  console.log(`[API Server] Received GET /api/schema/presigned-url for site ${siteId}`);
  const result = await getSchemaPresignedUrl(siteId);
  res.status(result.statusCode).json(result.body);
});

// PUT /api/schema/make-private
router.put('/make-private', async (req: Request, res: Response, next: NextFunction) => {
  const siteId = req.query.siteId as string || 'default';
  console.log(`[API Server] Received PUT /api/schema/make-private for site ${siteId}`);
  const result = await makeSchemaPrivate(siteId);
  res.status(result.statusCode).json(result.body);
});

export default router;
