import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type ToastProps } from "@/components/ui/toast";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDataUrl = (slug: string): string => {
  const baseUrl = import.meta.env.VITE_DATA_URL;
  return baseUrl ? `${baseUrl}/${slug}.json` : `/api/collections/${slug}/json`;
};

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
