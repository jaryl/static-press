import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Handle API errors with consistent error messages and toast notifications
 * @param operation Description of the operation that failed
 * @param error The error that occurred
 * @param setError Function to set the error state
 * @param toast Toast function for displaying notifications
 * @param shouldRethrow Whether to rethrow the error (default: true)
 * @returns The original error for further handling if needed
 */
export const handleApiError = (
  operation: string,
  error: unknown,
  setError: (error: string) => void,
  toast: (props: { title: string; description: string; variant?: "destructive" }) => void,
  shouldRethrow = true
): unknown => {
  const message = `Failed to ${operation}`;
  setError(message);

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
