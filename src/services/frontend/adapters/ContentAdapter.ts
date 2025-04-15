import type { CollectionSchema } from '../../shared/types/schema';
import type { CollectionRecord } from '../../shared/types/collection';

/**
 * ContentAdapter interface - For read-only operations to serve content
 * Used by the frontend stack to retrieve content for display
 */
export interface ContentAdapter {
  // Read operations
  getSchema(): Promise<CollectionSchema[]>;
  getCollectionData(slug: string): Promise<CollectionRecord[]>;

  // Utility methods
  getRawDataUrl(slug: string): string;
}
