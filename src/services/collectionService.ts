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

import { createDataAdapter } from './adapters';
const dataAdapter = createDataAdapter();
let collectionsCache: CollectionSchema[] = [];
let recordsCache: Record<string, CollectionRecord[]> = {};
const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const collectionService = {
  async initialize(): Promise<void> {
    collectionsCache = await dataAdapter.getSchema();
  },

  async getCollections(): Promise<CollectionSchema[]> {
    await delay(300);
    if (collectionsCache.length === 0) {
      await this.initialize();
    }
    return [...collectionsCache];
  },

  async getCollection(idOrSlug: string): Promise<CollectionSchema | null> {
    await delay(200);
    const collections = await this.getCollections();
    const collection = collections.find(c =>
      c.id === idOrSlug || c.slug === idOrSlug
    );
    return collection ? { ...collection } : null;
  },

  async getCollectionBySlug(slug: string): Promise<CollectionSchema | null> {
    await delay(200);
    const collections = await this.getCollections();
    const collection = collections.find(c => c.slug === slug);
    return collection ? { ...collection } : null;
  },

  async createCollection(data: Omit<CollectionSchema, 'id' | 'createdAt' | 'updatedAt'>): Promise<CollectionSchema> {
    await delay(500);
    const newCollection: CollectionSchema = {
      ...data,
      id: `col-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    collectionsCache = [...collectionsCache, newCollection];
    recordsCache[newCollection.id] = [];
    return newCollection;
  },

  async updateCollection(idOrSlug: string, updates: Partial<CollectionSchema>): Promise<CollectionSchema> {
    await delay(500);
    const collection = await this.getCollection(idOrSlug);
    if (!collection) throw new Error("Collection not found");

    collectionsCache = collectionsCache.map(c =>
      (c.id === idOrSlug || c.slug === idOrSlug)
        ? { ...c, ...updates, updatedAt: new Date().toISOString() }
        : c
    );

    const updated = await this.getCollection(idOrSlug);
    if (!updated) throw new Error("Collection not found after update");
    return updated;
  },

  async deleteCollection(idOrSlug: string): Promise<void> {
    await delay(500);
    const collection = await this.getCollection(idOrSlug);
    if (!collection) throw new Error("Collection not found");

    collectionsCache = collectionsCache.filter(c => c.id !== collection.id);
    delete recordsCache[collection.id];
  },

  async getCollectionRecords(collectionId: string): Promise<CollectionRecord[]> {
    if (!recordsCache[collectionId]) {
      recordsCache[collectionId] = await dataAdapter.getCollectionData(collectionId);
    }
    return [...(recordsCache[collectionId] || [])];
  },

  async getRecords(collectionIdOrSlug: string): Promise<CollectionRecord[]> {
    await delay(300);
    const collection = await this.getCollection(collectionIdOrSlug);
    if (!collection) return [];
    return this.getCollectionRecords(collection.id);
  },

  async getRecord(collectionIdOrSlug: string, recordId: string): Promise<CollectionRecord | null> {
    await delay(200);
    const collection = await this.getCollection(collectionIdOrSlug);
    if (!collection) return null;
    const records = await this.getCollectionRecords(collection.id);
    const record = records.find(r => r.id === recordId);
    return record ? { ...record } : null;
  },

  async createRecord(collectionIdOrSlug: string, data: RecordData): Promise<CollectionRecord> {
    await delay(500);
    const collection = await this.getCollection(collectionIdOrSlug);
    if (!collection) throw new Error("Collection not found");

    const newRecord: CollectionRecord = {
      id: `${collection.id}-${Date.now()}`,
      collectionId: collection.id,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    recordsCache[collection.id] = [...(recordsCache[collection.id] || []), newRecord];
    return newRecord;
  },

  async updateRecord(collectionIdOrSlug: string, recordId: string, data: RecordData): Promise<CollectionRecord> {
    await delay(500);
    const collection = await this.getCollection(collectionIdOrSlug);
    if (!collection) throw new Error("Collection not found");

    const records = await this.getCollectionRecords(collection.id);
    if (!records) throw new Error("Collection records not found");

    recordsCache[collection.id] = records.map(r =>
      r.id === recordId
        ? { ...r, data: { ...data }, updatedAt: new Date().toISOString() }
        : r
    );

    const updated = recordsCache[collection.id].find(r => r.id === recordId);
    if (!updated) throw new Error("Record not found");
    return updated;
  },

  async deleteRecord(collectionIdOrSlug: string, recordId: string): Promise<void> {
    await delay(500);
    const collection = await this.getCollection(collectionIdOrSlug);
    if (!collection) return;

    const records = await this.getCollectionRecords(collection.id);
    if (!records) return;

    recordsCache[collection.id] = records.filter(r => r.id !== recordId);
  }
};
