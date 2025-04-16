import { useState, useEffect } from 'react';
import { schemaService } from '@/services/schemaService';
import type { CollectionSchema } from '@/types';
import { ApiAdapterError } from '@/services/adapters/ApiStorageAdapter';

interface UseSchemaLoaderReturn {
  schema: CollectionSchema | null;
  isLoading: boolean;
  error: string | null;
  errorType: string | null;
}

/**
 * Custom hook to load a collection schema based on its slug.
 * Handles loading state, error state, and fetches the schema data.
 */
export const useSchemaLoader = (slug: string | undefined): UseSchemaLoaderReturn => {
  const [schema, setSchema] = useState<CollectionSchema | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when slug changes or on initial mount
    setSchema(null);
    setIsLoading(true);
    setError(null);
    setErrorType(null);

    if (!slug) {
      setError("No collection slug provided.");
      setIsLoading(false);
      return;
    }

    let isMounted = true; // Flag to prevent state updates on unmounted component

    const loadCollection = async () => {
      try {
        const collectionData = await schemaService.getCollection(slug);
        if (isMounted) {
          if (collectionData) {
            setSchema(collectionData);
          } else {
            setError(`Collection schema '${slug}' not found.`);
            setErrorType('COLLECTION_SCHEMA_NOT_FOUND');
          }
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof ApiAdapterError) {
            console.error(`[useSchemaLoader] ApiAdapterError (${err.errorType}):`, err.message);
            setError(err.message);
            setErrorType(err.errorType);
          } else {
            const message = err instanceof Error ? err.message : String(err);
            console.error(`[useSchemaLoader] Generic error:`, message);
            setError(`Error fetching collection: ${message}`);
            setErrorType('UNKNOWN_ERROR');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCollection();

    // Cleanup function to set isMounted to false when the component unmounts or slug changes
    return () => {
      isMounted = false;
    };
  }, [slug]); // Re-run effect if slug changes

  return { schema, isLoading, error, errorType };
};
