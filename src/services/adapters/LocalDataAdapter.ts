import { DataAdapter } from './index';
import type { CollectionSchema, FieldDefinition } from '../schemaService';
import type { CollectionRecord } from '../collectionService';

export class LocalDataAdapter implements DataAdapter {
  private loadedCollections: Record<string, CollectionRecord[]> = {};

  async getSchema(): Promise<CollectionSchema[]> {
    try {
      const schemaModule = await import('@/data/schema.json');
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

    const collections = await this.getSchema();
    const collectionSchema = collections.find(c => c.slug === slug);

    if (!collectionSchema) {
      console.warn(`LocalDataAdapter: Collection schema not found for slug: ${slug}`);
      return [];
    }

    try {
      const dataModule = await import(`@/data/${slug}.json`);
      const data = dataModule.default;

      if (!Array.isArray(data)) {
        throw new Error(`Invalid data format in ${slug}.json - expected array`);
      }

      const requiredFields = collectionSchema.fields.filter(f => f.required).map(f => f.name);
      const hasInvalidRecords = data.some((item: any) => {
        if (!item || typeof item.data !== 'object' || item.data === null) return true;
        return requiredFields.some(fieldName =>
          !(fieldName in item.data) || item.data[fieldName] === null || item.data[fieldName] === undefined || item.data[fieldName] === ''
        );
      });

      if (hasInvalidRecords) {
        console.error(`Malformed data in ${slug}.json - some records are missing required fields.`);
        throw new Error(`Malformed data in ${slug}.json - some records are missing required fields`);
      }

      const records = data as CollectionRecord[];
      this.loadedCollections[slug] = records;
      return [...records];

    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to fetch dynamically imported module')) {
        this.loadedCollections[slug] = [];
        return [];
      } else {
        console.error(`Failed to load local ${slug}.json`, error);
        throw new Error(`Failed to load local ${slug}.json: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  async updateSchema(schemaData: CollectionSchema[]): Promise<void> {
    console.warn('LocalDataAdapter: updateSchema called - Mock update, no file persistence.');
    return Promise.resolve();
  }

  async updateCollectionData(slug: string, records: CollectionRecord[]): Promise<void> {
    console.warn(`LocalDataAdapter: updateCollectionData called for slug ${slug} - Mock update, no file persistence.`);
    this.loadedCollections[slug] = JSON.parse(JSON.stringify(records));
    return Promise.resolve();
  }

  getRawDataUrl(slug: string): string {
    // For local data, the raw JSON is served via our API endpoint
    return `/api/collections/${slug}/json`;
  }
}
