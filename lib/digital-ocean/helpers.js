/**
 * Creates a properly formatted response object
 * @param {number} statusCode - HTTP status code
 * @param {object} body - Response body
 * @param {object} [headers={}] - Additional headers
 * @returns {object} Formatted response object
 */
function createResponse(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  };
}

/**
 * Handles error responses
 * @param {Error} error - The error that occurred
 * @param {string} method - The HTTP method being processed
 * @returns {object} Formatted error response
 */
function handleError(error, method) {
  console.error(`[Schema] Error in schema ${method} function:`, error.message || error);

  let statusCode = 500;
  const message = `Internal Server Error: ${error.message}`;

  // Check if it's an authentication error from our utility
  if (error.message.startsWith('Unauthorized:') || error.message.startsWith('Forbidden:')) {
    statusCode = error.message.startsWith('Forbidden:') ? 403 : 401;
  }

  return createResponse(statusCode, { message });
}

export { createResponse, handleError };
