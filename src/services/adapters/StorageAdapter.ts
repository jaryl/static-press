import type { CollectionSchema, CollectionRecord } from '@/types';

/**
 * StorageAdapter interface - For CRUD operations
 * Used by the backend stack to manage content
 */
export interface StorageAdapter {
  // Read operations
  getSchema(): Promise<CollectionSchema[]>;
  getCollectionData(slug: string): Promise<CollectionRecord[]>;

  // Write operations
  updateSchema(schemaData: CollectionSchema[]): Promise<void>;
  saveCollectionData(slug: string, records: CollectionRecord[]): Promise<void>;

  // URL operations
  getRawDataUrl(slug: string): string;

  /**
   * Gets the full URL for an image path based on the storage strategy
   * @param imagePath The path to the image
   * @returns The full URL to the image
   */
  getImageUrl(imagePath: string): string | Promise<string>;

  /**
   * Checks if the adapter is using remote storage
   * @returns True if the adapter is using remote storage, false otherwise
   */
  isRemoteStorage(): boolean;

  /**
   * Makes a collection public
   * @param slug The slug of the collection to make public
   * @returns A promise that resolves when the operation is complete
   */
  makeCollectionPublic(slug: string): Promise<void>;
}
