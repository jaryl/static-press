import type { CollectionSchema } from '../../shared/types/schema';
import type { CollectionRecord } from '../../shared/types/collection';

/**
 * StorageAdapter interface - For CRUD operations
 * Used by the backend stack to manage content
 */
export interface StorageAdapter {
  // Read operations
  getSchema(): Promise<CollectionSchema[]>;
  getCollectionData(slug: string): Promise<CollectionRecord[]>;

  // Write operations
  saveCollectionData(slug: string, data: CollectionRecord[]): Promise<void>;
  updateSchema(schemaData: CollectionSchema[]): Promise<void>;

  // Utility methods
  getRawDataUrl(slug: string): string;
}
