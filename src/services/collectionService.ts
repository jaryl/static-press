/**
 * @deprecated This file is deprecated. Use services/backend/collectionService.ts instead.
 * This file now re-exports from the backend service for backward compatibility.
 */

import { collectionService } from './backend/collectionService';
export { collectionService };

// Re-export types from shared types
export type { CollectionRecord, RecordData } from './shared/types/collection';
