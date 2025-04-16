import { Router, Request, Response } from 'express';
import { getSchema, updateSchema } from '../../src/lib/api-logic/handlers/schema';

const router = Router();

// GET schema data
router.get('/', async (_req: Request, res: Response) => {
  console.log(`[API Server] Received GET /api/schema`);

  // Call the core handler
  const result = await getSchema();

  // Send the response with the appropriate status code
  res.status(result.statusCode).json(result.body);
});

// PUT schema data
router.put('/', async (req: Request, res: Response) => {
  const schemaData = req.body;
  console.log(`[API Server] Received PUT /api/schema`);

  // Call the core handler
  const result = await updateSchema(schemaData);

  // Send the response with the appropriate status code
  res.status(result.statusCode).json(result.body);
});

export default router;
