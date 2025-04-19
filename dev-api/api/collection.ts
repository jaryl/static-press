import { Router, Request, Response, NextFunction } from 'express';
import { updateCollection } from '../../lib/api-logic/handlers/collection';

const router = Router();

// PUT /api/collection/:slug
router.put('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;
  const recordsData = req.body;
  console.log(`[API Server] Received PUT /api/collections/${slug}`);

  const result = await updateCollection(slug, recordsData);

  res.status(result.statusCode).json(result.body);
});

export default router;
