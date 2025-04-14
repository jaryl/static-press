import { createContext, ReactNode, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { collectionService } from '../services/collectionService';
import type { CollectionRecord, RecordData } from '../services/collectionService';
import { schemaService } from '../services/schemaService';
import type { CollectionSchema, FieldDefinition } from '../services/schemaService';
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

  const fetchCollections = async (): Promise<void> => {
    return withLoading(async () => {
      try {
        const data = await schemaService.getCollections();
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
        const collection = await schemaService.getCollection(id);
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
        const collection = await schemaService.getCollection(slug);
        if (!collection) {
          throw new Error(`Collection with slug '${slug}' not found.`);
        }

        const data = await collectionService.getRecords(slug);
        setRecords(data);
        setError(null);
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
  };

  const createCollection = async (collection: Omit<CollectionSchema, 'id' | 'createdAt' | 'updatedAt'>): Promise<CollectionSchema> => {
    return withLoading(async () => {
      try {
        const collectionWithSlug = {
          ...collection,
          id: uuidv4(),
          slug: `${collection.name.toLowerCase().replace(/\s+/g, '-')}`
        };

        const newCollection = await schemaService.createCollection(collectionWithSlug);
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
        const updatedCollection = await schemaService.updateCollection(slug, updates);
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
        await schemaService.deleteCollection(slug);
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

  const getRawCollectionUrl = (slug: string): string => {
    return collectionService.getRawCollectionDataUrl(slug);
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
      validateRecord,
      getRawCollectionUrl
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
