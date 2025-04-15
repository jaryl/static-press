import { ContentAdapter } from './ContentAdapter';
import type { CollectionSchema } from '../../shared/types/schema';
import type { CollectionRecord } from '../../shared/types/collection';

export class LocalContentAdapter implements ContentAdapter {
  private loadedCollections: Record<string, CollectionRecord[]> = {};

  async getSchema(): Promise<CollectionSchema[]> {
    try {
      const schemaModule = await import('@data/schema.json');
      const schema = schemaModule.default;

      if (!Array.isArray(schema)) {
        throw new Error('Invalid schema format in schema.json - expected array');
      }
      return schema as CollectionSchema[];
    } catch (error) {
      console.error('Failed to load local schema.json', error);
      throw new Error(`Failed to load local schema.json: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getCollectionData(slug: string): Promise<CollectionRecord[]> {
    if (this.loadedCollections[slug]) {
      return [...this.loadedCollections[slug]];
    }

    try {
      const dataModule = await import(`@data/${slug}.json`);
      const data = dataModule.default;

      if (!Array.isArray(data)) {
        throw new Error(`Invalid data format in ${slug}.json - expected array`);
      }

      const records = data as CollectionRecord[];
      this.loadedCollections[slug] = records;
      return [...records];
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to fetch dynamically imported module')) {
        console.warn(`LocalContentAdapter: Data file not found for slug '${slug}'. Returning empty array.`);
        this.loadedCollections[slug] = [];
        return [];
      } else {
        console.error(`Failed to load local ${slug}.json`, error);
        throw new Error(`Failed to load local ${slug}.json: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  getRawDataUrl(slug: string): string {
    return '';
  }
}
