import { createContext, ReactNode, useContext, useState, useCallback } from 'react';
import type { CollectionSchema, FieldDefinition } from '../services/shared/types/schema';
import type { CollectionRecord, RecordData } from '../services/shared/types/collection';
import { schemaService } from '../services/backend/schemaService';
import { collectionService } from '../services/backend/collectionService';
import { useToast } from '@/hooks/use-toast';
import { validateRecord } from '../lib/validation';
import { handleApiError, withLoading } from '../lib/utils';

interface CollectionContextType {
  collections: CollectionSchema[];
  currentCollection: CollectionSchema | null;
  records: CollectionRecord[];
  loading: boolean;
  error: string | null;
  fetchCollections: () => Promise<void>;
  fetchCollection: (id: string) => Promise<CollectionSchema | null>;
  fetchRecords: (slug: string) => Promise<CollectionRecord[]>;
  createCollection: (collection: Omit<CollectionSchema, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CollectionSchema>;
  updateCollection: (slug: string, updates: Partial<Omit<CollectionSchema, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<CollectionSchema>;
  deleteCollection: (slug: string) => Promise<void>;
  createRecord: (slug: string, data: RecordData) => Promise<CollectionRecord>;
  updateRecord: (slug: string, recordId: string, data: RecordData) => Promise<CollectionRecord>;
  deleteRecord: (slug: string, recordId: string) => Promise<void>;
  validateRecord: (data: RecordData, fields: FieldDefinition[]) => string[];
  getRawCollectionUrl: (slug: string) => string;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export const CollectionProvider = ({ children }: { children: ReactNode }) => {
  const [collections, setCollections] = useState<CollectionSchema[]>([]);
  const [currentCollection, setCurrentCollection] = useState<CollectionSchema | null>(null);
  const [records, setRecords] = useState<CollectionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCollections = useCallback(async (): Promise<void> => {
    return withLoading(async () => {
      try {
        const data = await schemaService.getCollections();
        setCollections(data);
        setError(null);
      } catch (err) {
        handleApiError('fetch collections', err, setError, toast, false);
      }
    }, setLoading);
  }, [toast, setLoading]);

  const fetchCollection = useCallback(async (id: string): Promise<CollectionSchema | null> => {
    return withLoading(async () => {
      let collection: CollectionSchema | null = null;
      try {
        collection = await schemaService.getCollection(id);

        if (!collection) {
          setCurrentCollection(null);
          setError(`Collection schema '${id}' not found.`);
          return null;
        } else {
          setCurrentCollection(collection);
          setError(null);
          return collection;
        }
      } catch (err) {
        setCurrentCollection(null);
        handleApiError('fetch collection', err, setError, toast, false);
        return null;
      }
    }, setLoading);
  }, [toast, setLoading]);

  const fetchRecords = useCallback(async (slug: string): Promise<CollectionRecord[]> => {
    return withLoading(async () => {
      try {
        const data = await collectionService.getRecords(slug);
        setRecords(data);
        setError(null); // Clear error on successful record fetch
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch records';
        const isDataFormatError = errorMessage.includes('Malformed data') ||
          errorMessage.includes('Invalid data format') ||
          errorMessage.includes('missing required fields');

        setError(errorMessage);

        if (!isDataFormatError) {
          toast({
            title: "Error",
            description: "Failed to fetch collection records",
            variant: "destructive",
          });
          return []; // Return empty array for non-data format errors
        }

        throw err;
      }
    }, setLoading);
  }, [toast, setLoading]);

  const createCollection = useCallback(async (collectionData: Omit<CollectionSchema, 'id' | 'createdAt' | 'updatedAt'>): Promise<CollectionSchema> => {
    return withLoading(async () => {
      try {
        const newCollection = await schemaService.createCollection(collectionData);
        // Refetch collections list to include the new one
        await fetchCollections();
        return newCollection;
      } catch (err) {
        handleApiError('create collection', err, setError, toast); // Default rethrow=true
        throw err; // Rethrow after handling
      }
    }, setLoading);
  }, [fetchCollections, toast, setLoading]);

  const updateCollection = useCallback(async (slug: string, updates: Partial<Omit<CollectionSchema, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CollectionSchema> => {
    return withLoading(async () => {
      try {
        const updatedCollection = await schemaService.updateCollection(slug, updates);
        // Update the list and potentially currentCollection
        setCollections(prev => prev.map(c => c.slug === slug ? updatedCollection : c));
        if (currentCollection?.slug === slug) {
          setCurrentCollection(updatedCollection);
        }
        return updatedCollection;
      } catch (err) {
        handleApiError('update collection', err, setError, toast);
        throw err;
      }
    }, setLoading);
  }, [currentCollection, toast, setLoading]);

  const deleteCollection = useCallback(async (slug: string): Promise<void> => {
    return withLoading(async () => {
      try {
        await schemaService.deleteCollection(slug);
        // Update the list and potentially currentCollection
        setCollections(prev => prev.filter(c => c.slug !== slug));
        if (currentCollection?.slug === slug) {
          setCurrentCollection(null); // Clear current if it was deleted
        }
      } catch (err) {
        handleApiError('delete collection', err, setError, toast);
        throw err;
      }
    }, setLoading);
  }, [currentCollection, toast, setLoading]);

  const createRecord = useCallback(async (slug: string, data: RecordData): Promise<CollectionRecord> => {
    return withLoading(async () => {
      try {
        const newRecord = await collectionService.createRecord(slug, data);
        // Optimistically update or refetch? Refetch for simplicity for now.
        await fetchRecords(slug);
        return newRecord;
      } catch (err) {
        handleApiError('create record', err, setError, toast);
        throw err;
      }
    }, setLoading);
  }, [fetchRecords, toast, setLoading]);

  const updateRecord = useCallback(async (slug: string, recordId: string, data: RecordData): Promise<CollectionRecord> => {
    return withLoading(async () => {
      try {
        const updatedRecord = await collectionService.updateRecord(slug, recordId, data);
        // Optimistically update or refetch? Refetch for simplicity.
        await fetchRecords(slug);
        return updatedRecord;
      } catch (err) {
        handleApiError('update record', err, setError, toast);
        throw err;
      }
    }, setLoading);
  }, [fetchRecords, toast, setLoading]);

  const deleteRecord = useCallback(async (slug: string, recordId: string): Promise<void> => {
    return withLoading(async () => {
      try {
        await collectionService.deleteRecord(slug, recordId);
        // Optimistically update or refetch? Refetch for simplicity.
        await fetchRecords(slug);
      } catch (err) {
        handleApiError('delete record', err, setError, toast);
        throw err;
      }
    }, setLoading);
  }, [fetchRecords, toast, setLoading]);

  const getRawCollectionUrl = useCallback((slug: string): string => {
    return collectionService.getRawCollectionDataUrl(slug);
  }, []); // No dependencies

  const value = {
    collections,
    currentCollection,
    records,
    loading,
    error,
    fetchCollections,
    fetchCollection,
    fetchRecords,
    createCollection,
    updateCollection,
    deleteCollection,
    createRecord,
    updateRecord,
    deleteRecord,
    validateRecord,
    getRawCollectionUrl
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
