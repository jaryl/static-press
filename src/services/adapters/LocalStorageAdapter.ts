import type { StorageAdapter } from './StorageAdapter';
import type { CollectionSchema, CollectionRecord } from '@/types';
import { importImage } from '@/lib/imageLoader';

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
      const schemaModule = await import('@sample/schema.json');
      const rawSchema = schemaModule.default;

      if (!Array.isArray(rawSchema)) {
        console.error('[LocalStorageAdapter] Invalid schema format:', rawSchema);
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
      console.error('[LocalStorageAdapter] Failed to load local schema.json', error);
      throw new Error(`Failed to load local schema.json: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getCollectionData(slug: string): Promise<CollectionRecord[]> {
    if (this.loadedCollections[slug]) {
      return [...this.loadedCollections[slug]];
    }

    try {
      const dataModule = await import(`@sample/collections/${slug}.json`);
      const data = dataModule.default;

      if (!Array.isArray(data)) {
        console.error(`[LocalStorageAdapter] Invalid data format for ${slug}:`, data);
        throw new Error(`Invalid data format in ${slug}.json - expected array`);
      }

      const records = data as CollectionRecord[];
      this.loadedCollections[slug] = records;
      return [...records];
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to fetch dynamically imported module')) {
        console.warn(`[LocalStorageAdapter] Data file not found for slug '${slug}'. Returning empty array.`);
        this.loadedCollections[slug] = [];
        return [];
      } else {
        console.error(`[LocalStorageAdapter] Failed to load local ${slug}.json`, error);
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
    console.warn(`[LocalStorageAdapter] getRawDataUrl called for slug '${slug}'. Returning empty string as local data is not served directly.`);
    return '';
  }

  /**
   * Gets the full URL for an image path based on the local storage strategy
   * @param imagePath The path to the image
   * @returns A promise that resolves to the image URL
   */
  async getImageUrl(imagePath: string): Promise<string> {
    if (!imagePath) {
      return '';
    }

    // Remove leading slash if present for consistency
    const normalizedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

    // For local strategy, use the dynamic import mechanism
    try {
      return await importImage(normalizedPath);
    } catch (error) {
      console.error(`[LocalStorageAdapter] Failed to load image: ${normalizedPath}`, error);
      return '';
    }
  }

  /**
   * Checks if the adapter is using remote storage
   * @returns Always false for LocalStorageAdapter
   */
  isRemoteStorage(): boolean {
    return false;
  }

  /**
   * Makes a collection public - no-op for local storage
   * @param slug The slug of the collection to make public
   */
  async makeCollectionPublic(slug: string): Promise<void> {
    console.log(`[LocalStorageAdapter] makeCollectionPublic called for ${slug} - this is a no-op in local storage mode`);
    // No-op for local storage as there's no concept of public/private permissions
    return Promise.resolve();
  }
}
