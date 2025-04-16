import { createContext, ReactNode, useContext, useState, useCallback } from 'react';
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
  fetchCollections: () => Promise<void>;
  fetchCollection: (slug: string) => Promise<CollectionSchema | null>;
  fetchRecords: (slug: string) => Promise<CollectionRecord[]>;
  createCollection: (collection: Omit<CollectionSchema, 'createdAt' | 'updatedAt'>) => Promise<CollectionSchema>;
  updateCollection: (slug: string, updates: Partial<Omit<CollectionSchema, 'createdAt' | 'updatedAt'>>) => Promise<CollectionSchema>;
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
  const [errorType, setErrorType] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCollections = useCallback(async (): Promise<void> => {
    return withLoading(async () => {
      try {
        const data = await schemaService.getCollections();
        setCollections(data);
        setError(null);
        setErrorType(null);
      } catch (err) {
        handleApiError('fetch collections', err, setError, toast, setErrorType, false);
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
          setErrorType('SCHEMA_NOT_FOUND');
          return null;
        } else {
          setCurrentCollection(collection);
          setError(null);
          setErrorType(null);
          return collection;
        }
      } catch (err) {
        setCurrentCollection(null);
        handleApiError('fetch collection', err, setError, toast, setErrorType, false);
        return null;
      }
    }, setLoading);
  }, [toast, setLoading]);

  const fetchRecords = useCallback(async (slug: string): Promise<CollectionRecord[]> => {
    return withLoading(async () => {
      try {
        const data = await collectionService.getRecords(slug);
        setRecords(data);
        setError(null);
        setErrorType(null);
        return data;
      } catch (err) {
        let message = 'Failed to fetch records';
        let type: string | null = 'UNKNOWN_ERROR';

        if (err instanceof Error) {
          message = err.message;
        }

        setError(message);
        setErrorType(type);

        if (type !== 'COLLECTION_DATA_NOT_FOUND') {
          toast({
            title: "Error Fetching Records",
            description: message,
            variant: "destructive",
          });
        }
        return [];
      }
    }, setLoading);
  }, [toast, setLoading]);

  const createCollection = useCallback(async (collectionData: Omit<CollectionSchema, 'createdAt' | 'updatedAt'>): Promise<CollectionSchema> => {
    return withLoading(async () => {
      try {
        const newCollection = await schemaService.createCollection(collectionData);
        await fetchCollections();
        return newCollection;
      } catch (err) {
        handleApiError('create collection', err, setError, toast, setErrorType);
        throw err;
      }
    }, setLoading);
  }, [fetchCollections, toast, setLoading]);

  const updateCollection = useCallback(async (slug: string, updates: Partial<Omit<CollectionSchema, 'createdAt' | 'updatedAt'>>): Promise<CollectionSchema> => {
    return withLoading(async () => {
      try {
        const updatedCollection = await schemaService.updateCollection(slug, updates);
        setCollections(prev => prev.map(c => c.slug === slug ? updatedCollection : c));
        if (currentCollection?.slug === slug) {
          setCurrentCollection(updatedCollection);
        }
        return updatedCollection;
      } catch (err) {
        handleApiError('update collection', err, setError, toast, setErrorType);
        throw err;
      }
    }, setLoading);
  }, [currentCollection, toast, setLoading]);

  const deleteCollection = useCallback(async (slug: string): Promise<void> => {
    return withLoading(async () => {
      try {
        await schemaService.deleteCollection(slug);
        setCollections(prev => prev.filter(c => c.slug !== slug));
        if (currentCollection?.slug === slug) {
          setCurrentCollection(null);
        }
      } catch (err) {
        handleApiError('delete collection', err, setError, toast, setErrorType);
        throw err;
      }
    }, setLoading);
  }, [currentCollection, toast, setLoading]);

  const createRecord = useCallback(async (slug: string, data: RecordData): Promise<CollectionRecord> => {
    return withLoading(async () => {
      try {
        const newRecord = await collectionService.createRecord(slug, data);
        await fetchRecords(slug);
        return newRecord;
      } catch (err) {
        handleApiError('create record', err, setError, toast, setErrorType);
        throw err;
      }
    }, setLoading);
  }, [fetchRecords, toast, setLoading]);

  const updateRecord = useCallback(async (slug: string, recordId: string, data: RecordData): Promise<CollectionRecord> => {
    return withLoading(async () => {
      try {
        const updatedRecord = await collectionService.updateRecord(slug, recordId, data);
        await fetchRecords(slug);
        return updatedRecord;
      } catch (err) {
        handleApiError('update record', err, setError, toast, setErrorType);
        throw err;
      }
    }, setLoading);
  }, [fetchRecords, toast, setLoading]);

  const deleteRecord = useCallback(async (slug: string, recordId: string): Promise<void> => {
    return withLoading(async () => {
      try {
        await collectionService.deleteRecord(slug, recordId);
        await fetchRecords(slug);
      } catch (err) {
        handleApiError('delete record', err, setError, toast, setErrorType);
        throw err;
      }
    }, setLoading);
  }, [fetchRecords, toast, setLoading]);

  const getRawCollectionUrl = useCallback((slug: string): string => {
    return collectionService.getRawCollectionDataUrl(slug);
  }, []);

  const value = {
    collections,
    currentCollection,
    records,
    loading,
    error,
    errorType,
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
