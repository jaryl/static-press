import { createContentAdapter } from './adapters';
import type { CollectionSchema } from '../shared/types/schema';

const contentAdapter = createContentAdapter();
let collectionsCache: CollectionSchema[] = [];

export const schemaService = {
  async initialize(): Promise<void> {
    collectionsCache = await contentAdapter.getSchema();
  },

  async getCollections(): Promise<CollectionSchema[]> {
    if (collectionsCache.length === 0) {
      await this.initialize();
    }
    // Return a copy to prevent direct modification of the cache
    return [...collectionsCache];
  },

  async getCollection(slug: string): Promise<CollectionSchema | null> {
    // Ensure cache is loaded if empty
    if (collectionsCache.length === 0) {
      await this.initialize();
    }
    const collection = collectionsCache.find(c => c.slug === slug);
    // Return a copy
    return collection ? { ...collection } : null;
  }
};
