import { useState, useCallback } from 'react';
import { CollectionSchema } from '@/services/shared/types/schema';
import { CollectionFormData } from '@/components/layout/CollectionForm'; // Assuming type is here

type CreateCollectionFunction = (
    data: Omit<CollectionSchema, 'createdAt' | 'updatedAt'>
) => Promise<CollectionSchema>;

interface UseCreateCollectionSubmitReturn {
    submit: (data: CollectionFormData) => Promise<boolean>; // Returns true on success, false on failure
    isSubmitting: boolean;
    error: string | null;
    resetError: () => void;
}

/**
 * Custom hook to handle the logic for submitting a new collection creation request.
 *
 * @param createCollectionFunction The function to call to actually create the collection (e.g., from context).
 * @returns An object containing the submit function, loading state, error state, and a function to reset the error.
 */
export const useCreateCollectionSubmit = (
    createCollectionFunction: CreateCollectionFunction
): UseCreateCollectionSubmitReturn => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const submit = useCallback(async (data: CollectionFormData): Promise<boolean> => {
        setIsSubmitting(true);
        setError(null);
        try {
            await createCollectionFunction({
                ...data,
                fields: data.fields || [] // Ensure fields is an array
            });
            setIsSubmitting(false);
            return true; // Indicate success
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('Failed to create collection:', err);
            setError(message);
            setIsSubmitting(false);
            return false; // Indicate failure
        }
    }, [createCollectionFunction]);

    const resetError = useCallback(() => {
        setError(null);
    }, []);

    return { submit, isSubmitting, error, resetError };
};
