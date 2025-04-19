// lib/utils/logger.ts

// Define log levels (optional, but good practice)
type LogLevel = 'info' | 'warn' | 'error';

// Simple prefix for all logs
const LOG_PREFIX = '[StaticPress]';

/**
 * Formats and logs a message to the console.
 *
 * @param level - The log level ('info', 'warn', 'error').
 * @param message - The main message to log.
 * @param context - Optional additional context (e.g., an object or error).
 */
function log(level: LogLevel, message: string, context?: any): void {
  const timestamp = new Date().toISOString(); // Add timestamp
  const logMessage = `${LOG_PREFIX} ${timestamp} [${level.toUpperCase()}]: ${message}`;

  switch (level) {
    case 'info':
      if (context) {
        console.log(logMessage, context);
      } else {
        console.log(logMessage);
      }
      break;
    case 'warn':
      if (context) {
        console.warn(logMessage, context);
      } else {
        console.warn(logMessage);
      }
      break;
    case 'error':
      if (context instanceof Error) {
        // Log the error message and the stack trace separately
        console.error(logMessage);
        console.error(context); // Logs the stack trace nicely
      } else if (context) {
        console.error(logMessage, context);
      } else {
        console.error(logMessage);
      }
      break;
  }
}

// Export the logger functions
export const logger = {
  info: (message: string, context?: any) => log('info', message, context),
  warn: (message: string, context?: any) => log('warn', message, context),
  error: (message: string, context?: any) => log('error', message, context),
};
