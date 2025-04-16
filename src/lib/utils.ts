import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ApiAdapterError } from '../services/adapters/ApiStorageAdapter';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Handle API errors with consistent error messages and toast notifications
 * @param operation Description of the operation that failed
 * @param error The error that occurred
 * @param setError Function to set the error state
 * @param setErrorType Optional function to set the error type
 * @param toast Toast function for displaying notifications
 * @param shouldRethrow Whether to rethrow the error (default: true)
 * @returns The original error for further handling if needed
 */
export const handleApiError = (
  operation: string,
  error: unknown,
  setError: (error: string | null) => void,
  toast: (props: { title: string; description: string; variant?: "destructive" | "default" }) => void,
  setErrorType?: (type: string | null) => void,
  shouldRethrow = true
): unknown => {
  let message = `Failed to ${operation}`;
  let type: string | null = 'UNKNOWN_ERROR';

  if (error instanceof ApiAdapterError) {
    message = error.message;
    type = error.errorType;
    console.error(`[handleApiError] ApiAdapterError (${type}) during ${operation}:`, message);
  } else if (error instanceof Error) {
    message = error.message;
    console.error(`[handleApiError] Error during ${operation}:`, message);
  } else {
    message = `An unknown error occurred during ${operation}.`;
    console.error(`[handleApiError] Unknown error type during ${operation}:`, error);
  }

  setError(message);
  if (setErrorType) {
    setErrorType(type);
  }

  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });

  if (shouldRethrow) {
    throw error;
  }

  return error;
};

/**
 * Wraps an async operation with loading state management
 * @param operation The async operation to perform
 * @param setLoading Function to set the loading state
 * @returns The result of the operation
 */
export const withLoading = async <T>(
  operation: () => Promise<T>,
  setLoading: (isLoading: boolean) => void
): Promise<T> => {
  setLoading(true);
  try {
    return await operation();
  } finally {
    setLoading(false);
  }
};

/**
 * Generates a URL-friendly slug from a string
 * @param str The string to convert to a slug
 * @returns A URL-friendly slug
 */
export const generateSlug = (str: string): string => {
  return str
    .toLowerCase()
    // Replace accented characters with their non-accented equivalents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and non-alphanumeric characters with dashes
    .replace(/[^a-z0-9]+/g, '-')
    // Remove consecutive dashes
    .replace(/-+/g, '-')
    // Remove leading and trailing dashes
    .replace(/^-|-$/g, '');
};
