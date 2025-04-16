// packages/core-api.js

// Import handlers from the core application logic
const { updateCollection } = require('../src/lib/api-logic/handlers/collection');
const { getSchema, getSchemas, updateSchema } = require('../src/lib/api-logic/handlers/schema');
// Add other handlers here as needed...

// Re-export them for use within the packages directory
module.exports = {
  updateCollection,
  getSchema,
  getSchemas,
  updateSchema,
  // ...other handlers
};
