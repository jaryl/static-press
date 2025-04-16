import { Router, Request, Response } from 'express';
import { updateCollection } from '../core-api';

const router = Router();

// PUT collection data
router.put('/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  const recordsData = req.body;
  console.log(`[API Server] Received PUT /api/collections/${slug}`);

  // Call the core handler
  const result = await updateCollection(slug, recordsData);

  // Send the response with the appropriate status code
  res.status(result.statusCode).json(result.body);
});

export default router;
