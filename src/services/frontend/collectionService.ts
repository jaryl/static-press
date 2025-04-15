import { createContentAdapter } from './adapters';
import { schemaService } from './schemaService';
import type { CollectionRecord } from '../shared/types/collection';

const contentAdapter = createContentAdapter();
let recordsCache: Record<string, CollectionRecord[]> = {};
const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const frontendCollectionService = {
  async getCollectionRecords(slug: string): Promise<CollectionRecord[]> {
    const collectionExists = await schemaService.getCollection(slug);
    if (!collectionExists) {
      console.warn(`Collection with slug '${slug}' not found.`);
      return [];
    }
    if (!recordsCache[slug]) {
      recordsCache[slug] = await contentAdapter.getCollectionData(slug);
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

  getRawCollectionDataUrl(slug: string): string {
    return contentAdapter.getRawDataUrl(slug);
  }
};
