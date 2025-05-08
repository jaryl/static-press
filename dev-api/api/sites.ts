import { Router, Request, Response, NextFunction } from 'express';
import {
  listSites,
  getSiteMetadata,
  createSite,
  updateSiteMetadata,
  deleteSite
} from '../../lib/api-logic/handlers/sites';

interface AuthenticatedRequest extends Request {
  user?: {
    sub?: string;
    email?: string;
    [key: string]: any;
  };
}

const router = Router();

// GET /api/sites - List all sites
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  console.log('[API Server] Received GET /api/sites');
  const result = await listSites();
  res.status(result.statusCode).json(result.body);
});

// GET /api/sites/:siteId - Get site metadata
router.get('/:siteId', async (req: Request, res: Response, next: NextFunction) => {
  const siteId = req.params.siteId;
  console.log(`[API Server] Received GET /api/sites/${siteId}`);
  const result = await getSiteMetadata(siteId);
  res.status(result.statusCode).json(result.body);
});

// POST /api/sites - Create a new site
router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const siteData = req.body;

  // Add createdBy if we have user information
  if (req.user) {
    siteData.createdBy = req.user.sub || req.user.email || 'unknown';
  }

  console.log(`[API Server] Received POST /api/sites with data:`, siteData);
  const result = await createSite(siteData);
  res.status(result.statusCode).json(result.body);
});

// PUT /api/sites/:siteId - Update site metadata
router.put('/:siteId', async (req: Request, res: Response, next: NextFunction) => {
  const siteId = req.params.siteId;
  const updates = req.body;

  console.log(`[API Server] Received PUT /api/sites/${siteId}`);
  const result = await updateSiteMetadata(siteId, updates);
  res.status(result.statusCode).json(result.body);
});

// DELETE /api/sites/:siteId - Delete a site
router.delete('/:siteId', async (req: Request, res: Response, next: NextFunction) => {
  const siteId = req.params.siteId;
  console.log(`[API Server] Received DELETE /api/sites/${siteId}`);
  const result = await deleteSite(siteId);
  res.status(result.statusCode).json(result.body);
});

export default router;
