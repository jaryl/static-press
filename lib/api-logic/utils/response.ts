// lib/api-logic/utils/response.ts

/**
 * Standardized structure for API responses.
 */
export interface ApiResponse {
  statusCode: number;
  body: { [key: string]: any }; // General body structure
  headers?: { [key: string]: string };
}

/**
 * Creates a standardized success response object.
 *
 * @param data - The payload to include in the response body.
 * @param statusCode - The HTTP status code (default: 200).
 * @returns An ApiResponse object.
 */
export const createSuccessResponse = (
  data: { [key: string]: any },
  statusCode: number = 200
): ApiResponse => {
  return {
    statusCode,
    body: data,
    headers: {
      'Content-Type': 'application/json',
      // Add any other standard success headers here
    },
  };
};

/**
 * Creates a standardized error response object.
 *
 * @param message - The error message.
 * @param statusCode - The HTTP status code.
 * @param errorType - Optional categorization of the error (e.g., 'VALIDATION_ERROR').
 * @returns An ApiResponse object.
 */
export const createErrorResponse = (
  message: string,
  statusCode: number,
  errorType?: string
): ApiResponse => {
  const body: { message: string; errorType?: string } = { message };
  if (errorType) {
    body.errorType = errorType;
  }
  return {
    statusCode,
    body,
    headers: {
      'Content-Type': 'application/json',
      // Add any other standard error headers here
    },
  };
};
