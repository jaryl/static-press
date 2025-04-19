// dev-api/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../../lib/utils/logger'; // Use our logger

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    logger.error(`[API Error Handler] Path: ${req.path}, Error:`, err);

    // Check if headers have already been sent
    if (res.headersSent) {
        logger.warn('[API Error Handler] Headers already sent, passing error to default handler.');
        return next(err);
    }

    // Default error details
    let statusCode = 500;
    let responseBody = {
        message: 'Internal Server Error',
        errorType: 'INTERNAL_SERVER_ERROR'
    };

    // Check if the error object has structure from our core logic/utils
    // (e.g., from createErrorResponse being thrown or similar structure)
    // Note: Our core logic currently RETURNS ApiResponse, it doesn't THROW it.
    // We should check for standard Error properties first.
    if (err instanceof Error) {
        responseBody.message = err.message;
        // Handle specific authentication errors passed via middleware
        if (err.message?.startsWith('Unauthorized:') || err.message?.startsWith('Forbidden:')) {
            statusCode = err.message.startsWith('Forbidden:') ? 403 : 401;
            responseBody.errorType = err.message.startsWith('Forbidden:') ? 'FORBIDDEN' : 'UNAUTHORIZED';
        } else if (err.name === 'SyntaxError') {
            // Handle JSON parsing errors from express.json()
            statusCode = 400;
            responseBody.message = 'Invalid JSON in request body.';
            responseBody.errorType = 'INVALID_JSON';
        }
        // Add more specific error name/message checks here if needed
    } else if (err && typeof err.statusCode === 'number' && err.body && typeof err.body.message === 'string') {
        // Less likely scenario: If something throws an object matching ApiResponse structure
        statusCode = err.statusCode;
        responseBody.message = err.body.message;
        responseBody.errorType = err.body.errorType || 'UNKNOWN_STRUCTURED_ERROR';
    } else if (typeof err === 'string') {
        // Handle simple string errors
        responseBody.message = err;
    }

    res.status(statusCode).json(responseBody);
}
