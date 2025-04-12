// This service manages collections and their records
// Loading data from JSON files
import { v4 as uuidv4 } from 'uuid';

export interface FieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'email' | 'url' | 'select';
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
  slug: string;
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

  async getCollection(slug: string): Promise<CollectionSchema | null> {
    await delay(200);
    const collections = await this.getCollections();
    const collection = collections.find(c => c.slug === slug);
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
    recordsCache[newCollection.slug] = [];
    return newCollection;
  },

  async updateCollection(slug: string, updates: Partial<CollectionSchema>): Promise<CollectionSchema> {
    await delay(500);
    const collection = await this.getCollection(slug);
    if (!collection) throw new Error("Collection not found");

    collectionsCache = collectionsCache.map(c =>
      c.slug === slug
        ? { ...c, ...updates, updatedAt: new Date().toISOString() }
        : c
    );

    const updated = await this.getCollection(slug);
    if (!updated) throw new Error("Collection not found after update");
    return updated;
  },

  async deleteCollection(slug: string): Promise<void> {
    await delay(500);
    const collection = await this.getCollection(slug);
    if (!collection) throw new Error("Collection not found");

    collectionsCache = collectionsCache.filter(c => c.slug !== slug);
    delete recordsCache[slug];
  },

  async getCollectionRecords(slug: string): Promise<CollectionRecord[]> {
    if (!recordsCache[slug]) {
      recordsCache[slug] = await dataAdapter.getCollectionData(slug);
    }
    return [...(recordsCache[slug] || [])];
  },

  async getRecords(slug: string): Promise<CollectionRecord[]> {
    await delay(300);
    return this.getCollectionRecords(slug);
  },

  async getRecord(slug: string, recordId: string): Promise<CollectionRecord | null> {
    await delay(200);
    const records = await this.getCollectionRecords(slug);
    const record = records.find(r => r.id === recordId);
    return record ? { ...record } : null;
  },

  async createRecord(slug: string, data: RecordData): Promise<CollectionRecord> {
    await delay(500);
    const collection = await this.getCollection(slug);
    if (!collection) throw new Error("Collection not found");

    const newRecord: CollectionRecord = {
      id: `${slug}-${uuidv4()}`,
      slug,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    recordsCache[slug] = [...(recordsCache[slug] || []), newRecord];
    return newRecord;
  },

  async updateRecord(slug: string, recordId: string, data: RecordData): Promise<CollectionRecord> {
    await delay(500);
    const records = await this.getCollectionRecords(slug);
    if (!records) throw new Error("Collection records not found");

    recordsCache[slug] = records.map(r =>
      r.id === recordId
        ? { ...r, data: { ...data }, updatedAt: new Date().toISOString() }
        : r
    );

    const updated = recordsCache[slug].find(r => r.id === recordId);
    if (!updated) throw new Error("Record not found");
    return updated;
  },

  async deleteRecord(slug: string, recordId: string): Promise<void> {
    await delay(500);
    const records = await this.getCollectionRecords(slug);
    if (!records) return;

    recordsCache[slug] = records.filter(r => r.id !== recordId);
  }
};
