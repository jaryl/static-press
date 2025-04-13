// This service manages collection schemas
import { createDataAdapter } from './adapters';

export interface FieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'email' | 'url' | 'select' | 'image' | 'array';
  required: boolean;
  options?: string[]; // For select field types
  timezoneAware?: boolean; // For datetime fields
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

const dataAdapter = createDataAdapter();
let collectionsCache: CollectionSchema[] = [];
const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const schemaService = {
  async initialize(): Promise<void> {
    collectionsCache = await dataAdapter.getSchema();
  },

  async getCollections(): Promise<CollectionSchema[]> {
    await delay(300);
    if (collectionsCache.length === 0) {
      await this.initialize();
    }
    // Return a copy to prevent direct modification of the cache
    return [...collectionsCache];
  },

  async getCollection(slug: string): Promise<CollectionSchema | null> {
    await delay(200);
    // Ensure cache is loaded if empty
    if (collectionsCache.length === 0) {
      await this.initialize();
    }
    const collection = collectionsCache.find(c => c.slug === slug);
    // Return a copy
    return collection ? { ...collection } : null;
  },

  async createCollection(data: Omit<CollectionSchema, 'createdAt' | 'updatedAt'>): Promise<CollectionSchema> {
    await delay(500);
    const newCollection: CollectionSchema = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    collectionsCache = [...collectionsCache, newCollection];
    // Persist the entire updated schema
    await dataAdapter.updateSchema(collectionsCache);
    // Return a copy
    return { ...newCollection };
  },

  async updateCollection(slug: string, updates: Partial<CollectionSchema>): Promise<CollectionSchema> {
    await delay(500);
    let updatedCollection: CollectionSchema | null = null;
    collectionsCache = collectionsCache.map(c => {
      if (c.slug === slug) {
        updatedCollection = { ...c, ...updates, updatedAt: new Date().toISOString() };
        return updatedCollection;
      }
      return c;
    });

    if (!updatedCollection) throw new Error("Collection not found for update");

    // Persist the entire updated schema
    await dataAdapter.updateSchema(collectionsCache);
    // Return a copy
    return { ...updatedCollection };
  },

  async deleteCollection(slug: string): Promise<void> {
    await delay(500);
    const initialLength = collectionsCache.length;
    collectionsCache = collectionsCache.filter(c => c.slug !== slug);

    if (collectionsCache.length === initialLength) {
      throw new Error("Collection not found for delete");
    }

    // Persist the entire updated schema
    await dataAdapter.updateSchema(collectionsCache);
  },
};
