import { v4 as uuidv4 } from 'uuid';
import { createStorageAdapter } from './adapters';
import { schemaService } from './schemaService';
import type { CollectionRecord, RecordData } from '../shared/types/collection';

const storageAdapter = createStorageAdapter();
let recordsCache: Record<string, CollectionRecord[]> = {};

export const collectionService = {
  adapter: storageAdapter,

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

  /**
   * Gets the raw data URL for a collection
   * @param slug The collection slug
   * @returns The URL to the raw JSON data
   */
  getRawCollectionDataUrl(slug: string): string {
    return this.adapter.getRawDataUrl(slug);
  },

  /**
   * Gets the full URL for an image path based on the active adapter's storage strategy
   * @param imagePath The path to the image
   * @returns The full URL to the image (may be a Promise if using local storage)
   */
  getImageUrl(imagePath: string): string | Promise<string> {
    return this.adapter.getImageUrl(imagePath);
  },

  /**
   * Checks if the active adapter is using remote storage
   * @returns True if using remote storage, false if using local storage
   */
  isRemoteStorage(): boolean {
    return this.adapter.isRemoteStorage();
  }
};
