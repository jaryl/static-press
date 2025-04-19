// dev-api/api/schema-metadata.ts
// Handles GET requests to /api/schema/metadata for local development

import type { Request, Response } from 'express';
import { getSchemaMetadata } from '../../lib/api-logic/handlers/schema.ts';
import { authenticateRequest } from '../../lib/api-logic/handlers/auth.ts';

export default async function handler(req: Request, res: Response) {
  console.log(`[Dev API] Received ${req.method} /api/schema/metadata`);

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // --- Authentication Check (using headers for Express) ---
    // Mimic the structure expected by authenticateRequest (args.__ow_headers)
    const simulatedArgs = { __ow_headers: req.headers };
    await authenticateRequest(simulatedArgs as any); // Cast needed for simulation
    // ------------------------------------------------------

    const result = await getSchemaMetadata();

    // Send response from core logic
    res.status(result.statusCode).json(result.body);

  } catch (error: any) {
    console.error(`[Dev API] Error in /api/schema/metadata handler:`, error);
    let statusCode = 500;
    // Initialize with a type that allows both message and optional errorType
    let responseBody: { message: string; errorType?: string } = { message: 'Internal Server Error' };

    // Handle specific authentication errors
    if (error.message?.startsWith('Unauthorized:') || error.message?.startsWith('Forbidden:')) {
      statusCode = error.message.startsWith('Forbidden:') ? 403 : 401;
      responseBody = { message: error.message };
    } else if (error.errorType && error.message) {
      // Use error details from core logic if available
      statusCode = error.statusCode || 500;
      responseBody = { errorType: error.errorType, message: error.message };
    }

    res.status(statusCode).json(responseBody);
  }
}
