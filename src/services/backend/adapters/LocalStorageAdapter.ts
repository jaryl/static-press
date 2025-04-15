import type { StorageAdapter } from './StorageAdapter';
import type { CollectionSchema } from '../../shared/types/schema';
import type { CollectionRecord } from '../../shared/types/collection';

const validFieldTypes = [
  'text', 'number', 'boolean', 'date', 'datetime',
  'email', 'url', 'select', 'image', 'array', 'coordinates'
] as const;

export class LocalStorageAdapter implements StorageAdapter {
  private loadedCollections: Record<string, CollectionRecord[]> = {};
  private schema: CollectionSchema[] = [];

  async getSchema(): Promise<CollectionSchema[]> {
    if (this.schema.length > 0) {
      return [...this.schema];
    }

    try {
      const schemaModule = await import('@data/schema.json');
      const rawSchema = schemaModule.default;

      if (!Array.isArray(rawSchema)) {
        throw new Error('Invalid schema format in schema.json - expected array');
      }

      this.schema = rawSchema.map(item => {
        const processedFields = item.fields.map(field => {
          const isValidType = validFieldTypes.includes(field.type as any);

          if (!isValidType) {
            console.warn(`Field '${field.name}' has invalid type '${field.type}', defaulting to 'text'`);
            return { ...field, type: 'text' as const };
          }

          return { ...field, type: field.type as any };
        });

        return {
          ...item,
          fields: processedFields
        } as CollectionSchema;
      });

      return [...this.schema];
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
        console.warn(`LocalStorageAdapter: Data file not found for slug '${slug}'. Returning empty array.`);
        this.loadedCollections[slug] = [];
        return [];
      } else {
        console.error(`Failed to load local ${slug}.json`, error);
        throw new Error(`Failed to load local ${slug}.json: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  async updateSchema(schemaData: CollectionSchema[]): Promise<void> {
    console.log('[LocalStorageAdapter] Updating schema (local only, not persisted)');
    this.schema = [...schemaData];
    return Promise.resolve();
  }

  async saveCollectionData(slug: string, records: CollectionRecord[]): Promise<void> {
    console.log(`[LocalStorageAdapter] Updating collection '${slug}' (local only, not persisted)`);
    this.loadedCollections[slug] = [...records];
    return Promise.resolve();
  }

  getRawDataUrl(slug: string): string {
    console.warn(`LocalStorageAdapter: getRawDataUrl called for slug '${slug}'. Returning empty string as local data is not served directly.`);
    return '';
  }
}
