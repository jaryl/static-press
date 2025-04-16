import { useState, useEffect } from 'react';
import { schemaService, CollectionSchema } from '@/services/schemaService';

interface UseSchemaLoaderReturn {
  schema: CollectionSchema | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook to load a collection schema based on its slug.
 * Handles loading state, error state, and fetches the schema data.
 */
export const useSchemaLoader = (slug: string | undefined): UseSchemaLoaderReturn => {
  const [schema, setSchema] = useState<CollectionSchema | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when slug changes or on initial mount
    setSchema(null);
    setIsLoading(true);
    setError(null);

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
          }
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : String(err);
          setError(`Error fetching collection: ${message}`);
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

  return { schema, isLoading, error };
};
