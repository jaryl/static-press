import { DataAdapter } from './index';
import type { CollectionSchema } from '../schemaService';
import type { CollectionRecord } from '../collectionService';

export class LocalDataAdapter implements DataAdapter {
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

    const collections = await this.getSchema();
    const collectionSchema = collections.find(c => c.slug === slug);

    if (!collectionSchema) {
      console.warn(`LocalDataAdapter: Collection schema not found for slug: ${slug}`);
      return [];
    }

    try {
      const dataModule = await import(`@data/${slug}.json`);
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
        // Handle case where the specific data file doesn't exist (normal for local demo)
        console.warn(`LocalDataAdapter: Data file not found for slug '${slug}'. Returning empty array.`);
        this.loadedCollections[slug] = [];
        return [];
      } else {
        console.error(`Failed to load local ${slug}.json`, error);
        throw new Error(`Failed to load local ${slug}.json: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  // --- Write Operations (Disabled for LocalDataAdapter) ---

  async saveCollectionData(slug: string, data: CollectionRecord[]): Promise<void> {
    console.warn(`LocalDataAdapter: Attempted to save collection '${slug}', but this adapter is read-only.`);
    // Do nothing, as local data is read-only in demo mode
    return Promise.resolve();
  }

  async updateSchema(schemaData: CollectionSchema[]): Promise<void> {
    console.warn(`LocalDataAdapter: Attempted to update schema, but this adapter is read-only.`);
    // Do nothing, as local data is read-only in demo mode
    return Promise.resolve();
  }

  getRawDataUrl(slug: string): string {
    // Local adapter doesn't have a meaningful 'raw data URL' in the same way
    // the remote one does (pointing to S3/CDN). Return empty or a placeholder.
    console.warn(`LocalDataAdapter: getRawDataUrl called for slug '${slug}'. Returning empty string as local data is not served directly.`);
    return '';
    // Or maybe return a relative path for debugging? `/data/${slug}.json`?
    // However, the consuming app shouldn't rely on this from LocalDataAdapter.
  }
}
