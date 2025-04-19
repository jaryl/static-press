// dev-api/api/schema-presigned-url.ts
// Handles GET /api/schema/presigned-url for the dev server

import { Request, Response } from 'express';
import { getSchemaPresignedUrl } from '../../lib/api-logic/handlers/schema';

export default async function handler(req: Request, res: Response) {
  console.log('[Dev API] Processing GET /api/schema/presigned-url');

  try {
    // Call the core logic function directly
    const result = await getSchemaPresignedUrl();

    console.log('[Dev API] Core logic getSchemaPresignedUrl result:', result.statusCode);
    res.status(result.statusCode).json(result.body);

  } catch (error: any) {
    // This catch block might be redundant if core logic handles all errors,
    // but it's a safeguard.
    console.error(`[Dev API] Error in /api/schema/presigned-url handler:`, error);
    let statusCode = 500;
    let responseBody = { errorType: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' };

    // Check if it's an error structure from our core logic
    if (error && typeof error.statusCode === 'number' && typeof error.body === 'object') {
      statusCode = error.statusCode;
      responseBody = error.body;
    } else if (error instanceof Error) {
      // Handle generic errors
      responseBody.message = error.message;
    }

    res.status(statusCode).json(responseBody);
  }
}
