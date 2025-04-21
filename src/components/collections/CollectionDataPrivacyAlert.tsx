import React, { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useCollection } from '@/contexts/CollectionContext';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from "@tanstack/react-query";

/**
 * Displays an alert if the collection's data file in S3 is not publicly accessible.
 * Provides a button to attempt to make it public (dev server only for now).
 */
export const CollectionDataPrivacyAlert: React.FC = () => {
  const {
    currentCollection,
    getRawCollectionUrl,
    loading: collectionLoading,
    makeCollectionPublic,
  } = useCollection();
  const [isPrivate, setIsPrivate] = useState<boolean | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [isMakingPublic, setIsMakingPublic] = useState<boolean>(false);
  const [makePublicError, setMakePublicError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const checkDataPrivacy = useCallback(async () => {
    if (!currentCollection || !getRawCollectionUrl) {
      setIsPrivate(null);
      setCheckError(null);
      return;
    }
    const url = getRawCollectionUrl(currentCollection.slug);
    if (!url) {
      setCheckError("Could not construct the collection data URL.");
      setIsPrivate(null);
      return;
    }

    setCheckError(null);
    setIsPrivate(null);

    try {
      const response = await fetch(url, { method: 'HEAD', cache: 'no-store' });

      if (response.ok) {
        setIsPrivate(false);
      } else if (response.status === 403 || response.status === 404) {
        setIsPrivate(true);
      } else {
        setCheckError(`Unexpected status code ${response.status} received.`);
        setIsPrivate(null);
      }
    } catch (error) {
      console.error("Error checking data privacy:", error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setCheckError("A network error occurred or CORS policy blocked the request.");
      } else {
        setCheckError("An unexpected error occurred while checking file accessibility.");
      }
      setIsPrivate(null);
    }
  }, [currentCollection, getRawCollectionUrl]);

  useEffect(() => {
    if (currentCollection && !collectionLoading) {
      checkDataPrivacy();
    }
  }, [currentCollection, collectionLoading, checkDataPrivacy]);

  const handleMakePublic = async () => {
    if (!currentCollection?.slug) return;

    setIsMakingPublic(true);
    setMakePublicError(null);

    try {
      await makeCollectionPublic(currentCollection.slug);

      await checkDataPrivacy();

      queryClient.invalidateQueries({ queryKey: ['records', currentCollection.slug] });
    } catch (error: any) {
      console.error("Error making collection public (caught in component):", error);
      const errorMessage = error?.message || (error instanceof Error ? error.message : 'An unexpected error occurred.');
      setMakePublicError(errorMessage);
    } finally {
      setIsMakingPublic(false);
    }
  };


  if (isPrivate === false || isPrivate === null && !checkError) {
    return null;
  }

  if (collectionLoading) {
    return null;
  }

  return (
    <Alert variant="default" className="m-4 border-yellow-500 text-yellow-700 dark:border-yellow-600 dark:text-yellow-300">
      <AlertTriangle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
      {checkError ? (
        <>
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">Accessibility Check Failed</AlertTitle>
          <AlertDescription className="text-yellow-600 dark:text-yellow-400">
            Could not determine if the collection data file is public. Reason: {checkError}
            <br />
            The static site may not function correctly if the data is private.
          </AlertDescription>
        </>
      ) : (
        <>
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">Collection Data is Private</AlertTitle>
          <AlertDescription className="text-yellow-600 dark:text-yellow-400">
            The data file for this collection (<code>{currentCollection?.slug}.json</code>) is currently private in S3.
            <br />
            For the static site build to access this data, it needs to be publicly readable.
            {makePublicError && (
              <p className="mt-2 text-red-600 dark:text-red-400">Error: {makePublicError}</p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-2 border-yellow-500 hover:bg-yellow-100 dark:border-yellow-600 dark:hover:bg-yellow-900"
              onClick={handleMakePublic}
              disabled={isMakingPublic}
            >
              {isMakingPublic ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Making Public...
                </>
              ) : (
                'Make Data Public'
              )}
            </Button>
          </AlertDescription>
        </>
      )}
    </Alert>
  );
};
