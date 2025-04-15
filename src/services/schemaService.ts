/**
 * @deprecated This file is deprecated. Use services/backend/schemaService.ts instead.
 * This file now re-exports from the backend service for backward compatibility.
 */

import { schemaService } from './backend/schemaService';
export { schemaService };

// Re-export types from shared types
export type { CollectionSchema, FieldDefinition } from './shared/types/schema';
