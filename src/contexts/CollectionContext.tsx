import { createContext, ReactNode, useContext, useState } from 'react';
import {
  collectionService,
  CollectionSchema,
  CollectionRecord,
  RecordData,
  FieldDefinition
} from '../services/collectionService';
import { useToast } from '@/components/ui/use-toast';

interface CollectionContextType {
  collections: CollectionSchema[];
  currentCollection: CollectionSchema | null;
  records: CollectionRecord[];
  loading: boolean;
  error: string | null;
  fetchCollections: () => Promise<void>;
  fetchCollection: (id: string) => Promise<CollectionSchema | null>;
  fetchRecords: (collectionId: string) => Promise<CollectionRecord[]>;
  createCollection: (collection: Omit<CollectionSchema, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CollectionSchema>;
  updateCollection: (id: string, updates: Partial<Omit<CollectionSchema, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<CollectionSchema>;
  deleteCollection: (id: string) => Promise<void>;
  createRecord: (collectionId: string, data: RecordData) => Promise<CollectionRecord>;
  updateRecord: (collectionId: string, recordId: string, data: RecordData) => Promise<CollectionRecord>;
  deleteRecord: (collectionId: string, recordId: string) => Promise<void>;
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
    setLoading(true);
    try {
      const data = await collectionService.getCollections();
      setCollections(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch collections');
      toast({
        title: "Error",
        description: "Failed to fetch collections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCollection = async (id: string): Promise<CollectionSchema | null> => {
    setLoading(true);
    try {
      const collection = await collectionService.getCollection(id);
      setCurrentCollection(collection);
      setError(null);
      return collection;
    } catch (err) {
      setError('Failed to fetch collection');
      toast({
        title: "Error",
        description: "Failed to fetch collection details",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async (collectionId: string): Promise<CollectionRecord[]> => {
    setLoading(true);
    try {
      // First ensure we have the collection data
      const collection = await collectionService.getCollection(collectionId);
      if (!collection) {
        throw new Error('Collection not found');
      }

      // Then fetch the records - this will trigger lazy loading if needed
      const data = await collectionService.getRecords(collectionId);
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
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async (collection: Omit<CollectionSchema, 'id' | 'createdAt' | 'updatedAt'>): Promise<CollectionSchema> => {
    setLoading(true);
    try {
      const newCollection = await collectionService.createCollection(collection);
      setCollections([...collections, newCollection]);
      toast({
        title: "Success",
        description: `Collection "${newCollection.name}" created successfully`,
      });
      return newCollection;
    } catch (err) {
      setError('Failed to create collection');
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCollection = async (
    id: string,
    updates: Partial<Omit<CollectionSchema, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<CollectionSchema> => {
    setLoading(true);
    try {
      const updatedCollection = await collectionService.updateCollection(id, updates);
      setCollections(
        collections.map(c => c.id === id ? updatedCollection : c)
      );
      if (currentCollection?.id === id) {
        setCurrentCollection(updatedCollection);
      }
      toast({
        title: "Success",
        description: `Collection "${updatedCollection.name}" updated successfully`,
      });
      return updatedCollection;
    } catch (err) {
      setError('Failed to update collection');
      toast({
        title: "Error",
        description: "Failed to update collection",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCollection = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      await collectionService.deleteCollection(id);
      setCollections(collections.filter(c => c.id !== id));
      if (currentCollection?.id === id) {
        setCurrentCollection(null);
      }
      toast({
        title: "Success",
        description: "Collection deleted successfully",
      });
    } catch (err) {
      setError('Failed to delete collection');
      toast({
        title: "Error",
        description: "Failed to delete collection",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (collectionId: string, data: RecordData): Promise<CollectionRecord> => {
    setLoading(true);
    try {
      const newRecord = await collectionService.createRecord(collectionId, data);
      setRecords([...records, newRecord]);
      toast({
        title: "Success",
        description: "Record created successfully",
      });
      return newRecord;
    } catch (err) {
      setError('Failed to create record');
      toast({
        title: "Error",
        description: "Failed to create record",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRecord = async (collectionId: string, recordId: string, data: RecordData): Promise<CollectionRecord> => {
    setLoading(true);
    try {
      const updatedRecord = await collectionService.updateRecord(collectionId, recordId, data);
      setRecords(
        records.map(r => r.id === recordId ? updatedRecord : r)
      );
      toast({
        title: "Success",
        description: "Record updated successfully",
      });
      return updatedRecord;
    } catch (err) {
      setError('Failed to update record');
      toast({
        title: "Error",
        description: "Failed to update record",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (collectionId: string, recordId: string): Promise<void> => {
    setLoading(true);
    try {
      await collectionService.deleteRecord(collectionId, recordId);
      setRecords(records.filter(r => r.id !== recordId));
      toast({
        title: "Success",
        description: "Record deleted successfully",
      });
    } catch (err) {
      setError('Failed to delete record');
      toast({
        title: "Error",
        description: "Failed to delete record",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateRecord = (data: RecordData, fields: FieldDefinition[]): string[] => {
    const errors: string[] = [];

    fields.forEach(field => {
      // Check required fields
      if (field.required && (data[field.name] === undefined || data[field.name] === null || data[field.name] === '')) {
        errors.push(`${field.name} is required`);
        return;
      }

      // Skip validation if value is empty and not required
      if (data[field.name] === undefined || data[field.name] === null || data[field.name] === '') {
        return;
      }

      // Type validations
      switch (field.type) {
        case 'number':
          if (isNaN(Number(data[field.name]))) {
            errors.push(`${field.name} must be a number`);
          }
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(data[field.name]))) {
            errors.push(`${field.name} must be a valid email`);
          }
          break;
        case 'url':
          try {
            new URL(String(data[field.name]));
          } catch (e) {
            errors.push(`${field.name} must be a valid URL`);
          }
          break;
        case 'date':
          const date = new Date(data[field.name]);
          if (isNaN(date.getTime())) {
            errors.push(`${field.name} must be a valid date`);
          }
          break;
        case 'select':
          if (field.options && !field.options.includes(String(data[field.name]))) {
            errors.push(`${field.name} must be one of the available options`);
          }
          break;
      }
    });

    return errors;
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
      validateRecord
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
