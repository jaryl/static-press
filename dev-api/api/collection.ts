import { Router, Request, Response, NextFunction } from 'express';
import { updateCollection } from '../../lib/api-logic/handlers/collection';
import { collectionHandler } from '../../lib/api-logic/handlers/collection';
import { createSuccessResponse, createErrorResponse } from '../../lib/api-logic/utils/response';
import { logger } from '../../lib/utils/logger';

const router = Router();

// PUT /api/collection/:slug
router.put('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;
  const recordsData = req.body;
  console.log(`[API Server] Received PUT /api/collections/${slug}`);

  const result = await updateCollection(slug, recordsData);

  res.status(result.statusCode).json(result.body);
});

// PUT /api/make-public/:slug  (Note: This is now a top-level route, consider moving to its own file/router if structure grows)
router.put('/make-public/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  logger.info(`[API Route] PUT /collections/make-public/${slug} request received`);

  try {
    await collectionHandler.makeCollectionPublic(slug);
    res.status(200).json(createSuccessResponse({ message: `Collection ${slug} data ACL set to public-read.` }));
  } catch (error: any) {
    logger.error(`[API Route] Error setting ACL for collection ${slug} to public-read:`, error);
    // Check if the error indicates the object doesn't exist
    if (error.name === 'NoSuchKey' || (error.message && error.message.includes('NoSuchKey'))) {
      res.status(404).json(createErrorResponse(`Collection data file for '${slug}' not found.`, 404, 'NOT_FOUND'));
    } else {
      res.status(500).json(createErrorResponse(error.message || 'Failed to set collection data ACL to public-read.', 500, 'S3_ERROR'));
    }
  }
});

export default router;
