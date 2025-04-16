// dev-api/core-api.ts
// Boundary file that consolidates all imports from outside the dev-api directory

// Import handlers from the core application logic
import { getSchema, updateSchema } from '../lib/api-logic/handlers/schema';
import { updateCollection } from '../lib/api-logic/handlers/collection';
import { handleLogin } from '../lib/api-logic/handlers/auth';

// Re-export them for use within the dev-api directory
export {
  // Schema handlers
  getSchema,
  updateSchema,

  // Collection handlers
  updateCollection,

  // Auth handlers
  handleLogin,
};
