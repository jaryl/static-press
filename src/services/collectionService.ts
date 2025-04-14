// This service manages collection records
import { v4 as uuidv4 } from 'uuid';
import { createDataAdapter } from './adapters';
import { schemaService } from './schemaService';

export interface CollectionRecord {
  id: string;
  data: RecordData;
  createdAt: string;
  updatedAt: string;
}

export type RecordData = {
  [key: string]: any;
};

const dataAdapter = createDataAdapter();
let recordsCache: Record<string, CollectionRecord[]> = {};
const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const collectionService = {
  async getCollectionRecords(slug: string): Promise<CollectionRecord[]> {
    const collectionExists = await schemaService.getCollection(slug);
    if (!collectionExists) {
      console.warn(`Collection with slug '${slug}' not found.`);
      return [];
    }
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

    await dataAdapter.updateCollectionData(slug, recordsCache[slug]);

    return { ...newRecord };
  },

  async updateRecord(slug: string, recordId: string, data: RecordData): Promise<CollectionRecord> {
    await delay(500);
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

    await dataAdapter.updateCollectionData(slug, recordsCache[slug]);

    return { ...updatedRecord };
  },

  async deleteRecord(slug: string, recordId: string): Promise<void> {
    await delay(500);
    const records = await this.getCollectionRecords(slug);
    const initialLength = records.length;

    recordsCache[slug] = records.filter(r => r.id !== recordId);

    if (recordsCache[slug].length === initialLength) {
      console.warn(`Record with id '${recordId}' not found in collection '${slug}' for deletion.`);
      return;
    }

    await dataAdapter.updateCollectionData(slug, recordsCache[slug]);
  },

  // New function to get the raw data URL from the adapter
  getRawCollectionDataUrl(slug: string): string {
    return dataAdapter.getRawDataUrl(slug);
  }
};
