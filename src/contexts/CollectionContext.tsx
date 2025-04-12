import { createContext, ReactNode, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  collectionService,
  CollectionSchema,
  CollectionRecord,
  RecordData,
  FieldDefinition
} from '../services/collectionService';
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
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export const CollectionProvider = ({ children }: { children: ReactNode }) => {
  const [collections, setCollections] = useState<CollectionSchema[]>([]);
  const [currentCollection, setCurrentCollection] = useState<CollectionSchema | null>(null);
  const [records, setRecords] = useState<CollectionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCollections = async (): Promise<void> => {
    return withLoading(async () => {
      try {
        const data = await collectionService.getCollections();
        setCollections(data);
        setError(null);
      } catch (err) {
        handleApiError('fetch collections', err, setError, toast, false);
      }
    }, setLoading);
  };

  const fetchCollection = async (id: string): Promise<CollectionSchema | null> => {
    return withLoading(async () => {
      try {
        const collection = await collectionService.getCollection(id);
        setCurrentCollection(collection);
        setError(null);
        return collection;
      } catch (err) {
        handleApiError('fetch collection', err, setError, toast, false);
        return null;
      }
    }, setLoading);
  };

  const fetchRecords = async (slug: string): Promise<CollectionRecord[]> => {
    return withLoading(async () => {
      try {
        // First ensure we have the collection data
        const collection = await collectionService.getCollection(slug);
        if (!collection) {
          throw new Error('Collection not found');
        }

        // Then fetch the records - this will trigger lazy loading if needed
        const data = await collectionService.getRecords(slug);
        setRecords(data);
        setError(null);
        return data;
      } catch (err) {
        // Determine if this is a data format error that should be propagated
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch records';
        const isDataFormatError = errorMessage.includes('Malformed data') ||
          errorMessage.includes('Invalid data format') ||
          errorMessage.includes('missing required fields');

        // Set error state regardless
        setError(errorMessage);

        // Show toast for network/general errors, but let data format errors propagate
        if (!isDataFormatError) {
          toast({
            title: "Error",
            description: "Failed to fetch collection records",
            variant: "destructive",
          });
          return []; // Return empty array for non-data format errors
        }

        // Re-throw data format errors so they can be caught by the error boundary
        throw err;
      }
    }, setLoading);
  };

  const createCollection = async (collection: Omit<CollectionSchema, 'id' | 'createdAt' | 'updatedAt'>): Promise<CollectionSchema> => {
    return withLoading(async () => {
      try {
        // Generate a UUID for the new collection
        const collectionWithSlug = {
          ...collection,
          slug: `${collection.name.toLowerCase().replace(/\s+/g, '-')}`
        };

        const newCollection = await collectionService.createCollection(collectionWithSlug);
        setCollections([...collections, newCollection]);
        toast({
          title: "Success",
          description: `Collection "${newCollection.name}" created successfully`,
        });
        return newCollection;
      } catch (err) {
        handleApiError('create collection', err, setError, toast);
      }
    }, setLoading);
  };

  const updateCollection = async (
    slug: string,
    updates: Partial<Omit<CollectionSchema, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<CollectionSchema> => {
    return withLoading(async () => {
      try {
        const updatedCollection = await collectionService.updateCollection(slug, updates);
        setCollections(
          collections.map(c => c.slug === slug ? updatedCollection : c)
        );
        if (currentCollection?.slug === slug) {
          setCurrentCollection(updatedCollection);
        }
        toast({
          title: "Success",
          description: `Collection "${updatedCollection.name}" updated successfully`,
        });
        return updatedCollection;
      } catch (err) {
        handleApiError('update collection', err, setError, toast);
      }
    }, setLoading);
  };

  const deleteCollection = async (slug: string): Promise<void> => {
    return withLoading(async () => {
      try {
        await collectionService.deleteCollection(slug);
        setCollections(collections.filter(c => c.slug !== slug));
        if (currentCollection?.slug === slug) {
          setCurrentCollection(null);
        }
        toast({
          title: "Success",
          description: "Collection deleted successfully",
        });
      } catch (err) {
        handleApiError('delete collection', err, setError, toast);
      }
    }, setLoading);
  };

  const createRecord = async (slug: string, data: RecordData): Promise<CollectionRecord> => {
    return withLoading(async () => {
      try {
        const newRecord = await collectionService.createRecord(slug, data);
        setRecords([...records, newRecord]);
        toast({
          title: "Success",
          description: "Record created successfully",
        });
        return newRecord;
      } catch (err) {
        handleApiError('create record', err, setError, toast);
      }
    }, setLoading);
  };

  const updateRecord = async (slug: string, recordId: string, data: RecordData): Promise<CollectionRecord> => {
    return withLoading(async () => {
      try {
        const updatedRecord = await collectionService.updateRecord(slug, recordId, data);
        setRecords(
          records.map(r => r.id === recordId ? updatedRecord : r)
        );
        toast({
          title: "Success",
          description: "Record updated successfully",
        });
        return updatedRecord;
      } catch (err) {
        handleApiError('update record', err, setError, toast);
      }
    }, setLoading);
  };

  const deleteRecord = async (slug: string, recordId: string): Promise<void> => {
    return withLoading(async () => {
      try {
        await collectionService.deleteRecord(slug, recordId);
        setRecords(records.filter(r => r.id !== recordId));
        toast({
          title: "Success",
          description: "Record deleted successfully",
        });
      } catch (err) {
        handleApiError('delete record', err, setError, toast);
      }
    }, setLoading);
  };

  return (
    <CollectionContext.Provider value={{
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
      validateRecord: validateRecord
    }}>
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
