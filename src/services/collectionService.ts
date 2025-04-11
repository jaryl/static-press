
// This service manages collections and their records
// Loading data from JSON files

export interface FieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'select';
  required: boolean;
  options?: string[]; // For select field types
}

export interface CollectionSchema {
  id: string;
  name: string;
  slug: string;
  description: string;
  fields: FieldDefinition[];
  createdAt: string;
  updatedAt: string;
}

export type RecordData = {
  [key: string]: any;
};

export interface CollectionRecord {
  id: string;
  collectionId: string;
  data: RecordData;
  createdAt: string;
  updatedAt: string;
}

// Import collection schema and data
import schemaData from '../data/schema.json';
import productsData from '../data/products.json';
import customersData from '../data/customers.json';
import blogPostsData from '../data/blog-posts.json';
import eventsData from '../data/events.json';
import tasksData from '../data/tasks.json';
import feedbackData from '../data/feedback.json';

// Initialize collections from JSON data
let collections: CollectionSchema[] = [...schemaData] as CollectionSchema[];

// Initialize records from JSON data
let records: { [collectionId: string]: CollectionRecord[] } = {
  "1": productsData,
  "2": customersData,
  "3": blogPostsData,
  "4": eventsData,
  "5": tasksData,
  "6": feedbackData
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const collectionService = {
  // Collection schema operations
  getCollections: async (): Promise<CollectionSchema[]> => {
    await delay(300); // Simulate API delay
    return [...collections];
  },

  getCollection: async (idOrSlug: string): Promise<CollectionSchema | null> => {
    await delay(200);
    const collection = collections.find(c => 
      c.id === idOrSlug || c.slug === idOrSlug
    );
    return collection ? { ...collection } : null;
  },

  getCollectionBySlug: async (slug: string): Promise<CollectionSchema | null> => {
    await delay(200);
    const collection = collections.find(c => c.slug === slug);
    return collection ? { ...collection } : null;
  },

  createCollection: async (collection: Omit<CollectionSchema, 'id' | 'createdAt' | 'updatedAt'>): Promise<CollectionSchema> => {
    await delay(500);
    const newCollection: CollectionSchema = {
      ...collection,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    collections = [...collections, newCollection];
    records[newCollection.id] = [];
    return newCollection;
  },

  updateCollection: async (idOrSlug: string, updates: Partial<Omit<CollectionSchema, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CollectionSchema> => {
    await delay(500);
    const collection = collections.find(c => c.id === idOrSlug || c.slug === idOrSlug);
    
    if (!collection) throw new Error("Collection not found");
    
    collections = collections.map(c => 
      (c.id === idOrSlug || c.slug === idOrSlug)
        ? { 
            ...c, 
            ...updates, 
            updatedAt: new Date().toISOString() 
          } 
        : c
    );
    
    const updated = collections.find(c => c.id === collection.id);
    if (!updated) throw new Error("Collection not found after update");
    return updated;
  },

  deleteCollection: async (idOrSlug: string): Promise<void> => {
    await delay(500);
    const collection = collections.find(c => c.id === idOrSlug || c.slug === idOrSlug);
    if (!collection) throw new Error("Collection not found");
    
    collections = collections.filter(c => c.id !== collection.id);
    delete records[collection.id];
  },

  // Records operations
  getRecords: async (collectionIdOrSlug: string): Promise<CollectionRecord[]> => {
    await delay(300);
    
    // First find the collection by ID or slug
    const collection = collections.find(c => 
      c.id === collectionIdOrSlug || c.slug === collectionIdOrSlug
    );
    
    if (!collection) return [];
    
    return records[collection.id] ? [...records[collection.id]] : [];
  },

  getRecord: async (collectionIdOrSlug: string, recordId: string): Promise<CollectionRecord | null> => {
    await delay(200);
    
    // First find the collection by ID or slug
    const collection = collections.find(c => 
      c.id === collectionIdOrSlug || c.slug === collectionIdOrSlug
    );
    
    if (!collection) return null;
    
    const record = records[collection.id]?.find(r => r.id === recordId);
    return record ? { ...record } : null;
  },

  createRecord: async (collectionIdOrSlug: string, data: RecordData): Promise<CollectionRecord> => {
    await delay(500);
    
    // First find the collection by ID or slug
    const collection = collections.find(c => 
      c.id === collectionIdOrSlug || c.slug === collectionIdOrSlug
    );
    
    if (!collection) throw new Error("Collection not found");
    
    const newRecord: CollectionRecord = {
      id: `${collection.id}-${Date.now()}`,
      collectionId: collection.id,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    if (!records[collection.id]) {
      records[collection.id] = [];
    }
    
    records[collection.id] = [...records[collection.id], newRecord];
    return newRecord;
  },

  updateRecord: async (collectionIdOrSlug: string, recordId: string, data: RecordData): Promise<CollectionRecord> => {
    await delay(500);
    
    // First find the collection by ID or slug
    const collection = collections.find(c => 
      c.id === collectionIdOrSlug || c.slug === collectionIdOrSlug
    );
    
    if (!collection) throw new Error("Collection not found");
    
    const collectionRecords = records[collection.id];
    if (!collectionRecords) throw new Error("Collection records not found");
    
    records[collection.id] = collectionRecords.map(r => 
      r.id === recordId 
        ? { 
            ...r, 
            data: { ...data }, 
            updatedAt: new Date().toISOString() 
          } 
        : r
    );
    
    const updated = records[collection.id].find(r => r.id === recordId);
    if (!updated) throw new Error("Record not found");
    return updated;
  },

  deleteRecord: async (collectionIdOrSlug: string, recordId: string): Promise<void> => {
    await delay(500);
    
    // First find the collection by ID or slug
    const collection = collections.find(c => 
      c.id === collectionIdOrSlug || c.slug === collectionIdOrSlug
    );
    
    if (!collection) return;
    
    const collectionRecords = records[collection.id];
    if (!collectionRecords) return;
    
    records[collection.id] = collectionRecords.filter(r => r.id !== recordId);
  }
};
