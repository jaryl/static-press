import { createContext, ReactNode, useContext, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CollectionSchema,
  FieldDefinition,
  CollectionRecord,
  RecordData,
} from '@/types';
import { schemaService } from '@/services/schemaService';
import { collectionService } from '@/services/collectionService';
import { useToast } from '@/hooks/use-toast';
import { validateRecord } from '@/lib/validation';
import { handleApiError, withLoading } from '@/lib/utils';

interface CollectionContextType {
  collections: CollectionSchema[];
  currentCollection: CollectionSchema | null;
  records: CollectionRecord[];
  loading: boolean;
  error: string | null;
  errorType: string | null;
  setCurrentCollectionSlug: (slug: string | null) => void;
  createCollection: (collection: Omit<CollectionSchema, 'createdAt' | 'updatedAt'>) => Promise<CollectionSchema>;
  updateCollection: (slug: string, updates: Partial<Omit<CollectionSchema, 'createdAt' | 'updatedAt'>>) => Promise<CollectionSchema>;
  deleteCollection: (slug: string) => Promise<void>;
  createRecord: (slug: string, data: RecordData) => Promise<CollectionRecord>;
  updateRecord: (slug: string, recordId: string, data: RecordData) => Promise<CollectionRecord>;
  deleteRecord: (slug: string, recordId: string) => Promise<void>;
  validateRecord: (data: RecordData, fields: FieldDefinition[]) => string[];
  getRawCollectionUrl: (slug: string) => string;
  makeCollectionPublic: (slug: string) => Promise<void>;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export const CollectionProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [currentCollectionSlug, setCurrentCollectionSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: collections = [] } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      try {
        return await schemaService.getCollections();
      } catch (err) {
        console.error('Error fetching collections:', err);
        throw err;
      }
    },
  });

  // Fetch current collection if slug is set
  const { data: currentCollection = null } = useQuery({
    queryKey: ['collection', currentCollectionSlug],
    queryFn: async () => {
      if (!currentCollectionSlug) return null;
      try {
        return await schemaService.getCollection(currentCollectionSlug);
      } catch (err) {
        console.error(`Error fetching collection ${currentCollectionSlug}:`, err);
        throw err;
      }
    },
    enabled: !!currentCollectionSlug, // Only run query if slug is available
  });

  // Fetch records for current collection
  const { data: records = [] } = useQuery({
    queryKey: ['records', currentCollectionSlug],
    queryFn: async () => {
      if (!currentCollectionSlug) return [];
      try {
        return await collectionService.getRecords(currentCollectionSlug);
      } catch (err) {
        // Handle specific error types
        if (err instanceof Error && err.message.includes('not found')) {
          console.warn(`Collection data for ${currentCollectionSlug} not found.`);
          return [];
        }
        console.error(`Error fetching records for ${currentCollectionSlug}:`, err);
        throw err;
      }
    },
    enabled: !!currentCollectionSlug, // Only run query if slug is available
  });

  const createCollection = useCallback(async (collectionData: Omit<CollectionSchema, 'createdAt' | 'updatedAt'>): Promise<CollectionSchema> => {
    return withLoading(async () => {
      try {
        const newCollection = await schemaService.createCollection(collectionData);
        queryClient.invalidateQueries({ queryKey: ['collections'] });
        return newCollection;
      } catch (err) {
        handleApiError('create collection', err, setError, toast, setErrorType);
        throw err;
      }
    }, setLoading);
  }, [toast, setLoading, queryClient]);

  const updateCollection = useCallback(async (slug: string, updates: Partial<Omit<CollectionSchema, 'createdAt' | 'updatedAt'>>): Promise<CollectionSchema> => {
    return withLoading(async () => {
      try {
        const updatedCollection = await schemaService.updateCollection(slug, updates);
        queryClient.invalidateQueries({ queryKey: ['collections'] });
        if (currentCollection?.slug === slug) {
          setCurrentCollectionSlug(slug);
        }
        return updatedCollection;
      } catch (err) {
        handleApiError('update collection', err, setError, toast, setErrorType);
        throw err;
      }
    }, setLoading);
  }, [currentCollection, toast, setLoading, queryClient]);

  const deleteCollection = useCallback(async (slug: string): Promise<void> => {
    return withLoading(async () => {
      try {
        await schemaService.deleteCollection(slug);
        queryClient.invalidateQueries({ queryKey: ['collections'] });
        if (currentCollection?.slug === slug) {
          setCurrentCollectionSlug(null);
        }
      } catch (err) {
        handleApiError('delete collection', err, setError, toast, setErrorType);
        throw err;
      }
    }, setLoading);
  }, [currentCollection, toast, setLoading, queryClient]);

  const createRecord = useCallback(async (slug: string, data: RecordData): Promise<CollectionRecord> => {
    return withLoading(async () => {
      try {
        const newRecord = await collectionService.createRecord(slug, data);
        queryClient.invalidateQueries({ queryKey: ['records', slug] });
        return newRecord;
      } catch (err) {
        handleApiError('create record', err, setError, toast, setErrorType);
        throw err;
      }
    }, setLoading);
  }, [toast, setLoading, queryClient]);

  const updateRecord = useCallback(async (slug: string, recordId: string, data: RecordData): Promise<CollectionRecord> => {
    return withLoading(async () => {
      try {
        const updatedRecord = await collectionService.updateRecord(slug, recordId, data);
        queryClient.invalidateQueries({ queryKey: ['records', slug] });
        return updatedRecord;
      } catch (err) {
        handleApiError('update record', err, setError, toast, setErrorType);
        throw err;
      }
    }, setLoading);
  }, [toast, setLoading, queryClient]);

  const deleteRecord = useCallback(async (slug: string, recordId: string): Promise<void> => {
    return withLoading(async () => {
      try {
        await collectionService.deleteRecord(slug, recordId);
        queryClient.invalidateQueries({ queryKey: ['records', slug] });
      } catch (err) {
        handleApiError('delete record', err, setError, toast, setErrorType);
        throw err;
      }
    }, setLoading);
  }, [toast, setLoading, queryClient]);

  const getRawCollectionUrl = useCallback((slug: string): string => {
    return collectionService.getRawCollectionDataUrl(slug);
  }, []);

  const makeCollectionPublic = useCallback(async (slug: string): Promise<void> => {
    return withLoading(async () => {
      try {
        await collectionService.makeCollectionPublic(slug);
        queryClient.invalidateQueries({ queryKey: ['collection', slug] });
        toast({
          title: "Success",
          description: `Collection '${slug}' has been made public.`,
        });
      } catch (err) {
        handleApiError('make collection public', err, setError, toast, setErrorType);
        throw err;
      }
    }, setLoading);
  }, [toast, setLoading, queryClient]);

  const value = {
    collections,
    currentCollection,
    records,
    loading,
    error,
    errorType,
    setCurrentCollectionSlug,
    createCollection,
    updateCollection,
    deleteCollection,
    createRecord,
    updateRecord,
    deleteRecord,
    validateRecord,
    getRawCollectionUrl,
    makeCollectionPublic
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollection = () => {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context;
};
