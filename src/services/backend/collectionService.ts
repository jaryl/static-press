import { v4 as uuidv4 } from 'uuid';
import { createStorageAdapter } from './adapters';
import { schemaService } from './schemaService';
import type { CollectionRecord, RecordData } from '../shared/types/collection';

const storageAdapter = createStorageAdapter();
let recordsCache: Record<string, CollectionRecord[]> = {};

export const collectionService = {
  async getCollectionRecords(slug: string): Promise<CollectionRecord[]> {
    const collectionExists = await schemaService.getCollection(slug);
    if (!collectionExists) {
      console.warn(`Collection with slug '${slug}' not found.`);
      return [];
    }
    if (!recordsCache[slug]) {
      recordsCache[slug] = await storageAdapter.getCollectionData(slug);
    }
    return [...(recordsCache[slug] || [])];
  },

  async getRecords(slug: string): Promise<CollectionRecord[]> {
    return this.getCollectionRecords(slug);
  },

  async getRecord(slug: string, recordId: string): Promise<CollectionRecord | null> {
    const records = await this.getCollectionRecords(slug);
    const record = records.find(r => r.id === recordId);
    return record ? { ...record } : null;
  },

  async createRecord(slug: string, data: RecordData): Promise<CollectionRecord> {
    const collection = await schemaService.getCollection(slug);
    if (!collection) throw new Error(`Collection with slug '${slug}' not found. Cannot create record.`);

    const newRecord: CollectionRecord = {
      id: uuidv4(),
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!recordsCache[slug]) {
      recordsCache[slug] = [];
    }
    recordsCache[slug] = [...recordsCache[slug], newRecord];

    await storageAdapter.saveCollectionData(slug, recordsCache[slug]);

    return { ...newRecord };
  },

  async updateRecord(slug: string, recordId: string, data: RecordData): Promise<CollectionRecord> {
    const records = await this.getCollectionRecords(slug);
    let updatedRecord: CollectionRecord | null = null;

    recordsCache[slug] = records.map(r => {
      if (r.id === recordId) {
        updatedRecord = { ...r, data: { ...data }, updatedAt: new Date().toISOString() };
        return updatedRecord;
      }
      return r;
    });

    if (!updatedRecord) throw new Error(`Record with id '${recordId}' not found in collection '${slug}'.`);

    await storageAdapter.saveCollectionData(slug, recordsCache[slug]);

    return { ...updatedRecord };
  },

  async deleteRecord(slug: string, recordId: string): Promise<void> {
    const records = await this.getCollectionRecords(slug);
    const initialLength = records.length;

    recordsCache[slug] = records.filter(r => r.id !== recordId);

    if (recordsCache[slug].length === initialLength) {
      console.warn(`Record with id '${recordId}' not found in collection '${slug}' for deletion.`);
      return;
    }

    await storageAdapter.saveCollectionData(slug, recordsCache[slug]);
  },

  getRawCollectionDataUrl(slug: string): string {
    return storageAdapter.getRawDataUrl(slug);
  },

  /**
   * Gets the full URL for an image path based on the current storage adapter's strategy
   * @param imagePath The path to the image
   * @returns The full URL to the image
   */
  getImageUrl(imagePath: string): string {
    return storageAdapter.getImageUrl(imagePath);
  }
};
