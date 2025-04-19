// dev-api/api/schema-make-private.ts
// Handles PUT /api/schema/make-private for the dev server

import { Request, Response } from 'express';
import { makeSchemaPrivate } from '../../lib/api-logic/handlers/schema';

export default async function handler(req: Request, res: Response) {
  console.log('[Dev API] Processing PUT /api/schema/make-private');

  try {
    // Call the core logic function directly
    const result = await makeSchemaPrivate();

    console.log('[Dev API] Core logic makeSchemaPrivate result:', result.statusCode);
    res.status(result.statusCode).json(result.body);

  } catch (error: any) {
    // Safeguard catch block
    console.error(`[Dev API] Error in /api/schema/make-private handler:`, error);
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
