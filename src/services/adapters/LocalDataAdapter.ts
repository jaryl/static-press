export class LocalDataAdapter {
  private loadedCollections: Record<string, any> = {};

  async getSchema(): Promise<any[]> {
    try {
      const schema = await import('@/data/schema.json');
      if (!Array.isArray(schema.default)) {
        throw new Error('Invalid schema format - expected array');
      }
      return [...schema.default];
    } catch (error) {
      console.error('Failed to load schema.json', error);
      throw error;
    }
  }

  async getCollectionData(collectionId: string): Promise<any[]> {
    if (!this.loadedCollections[collectionId]) {
      const collections = await this.getSchema();
      const collection = collections.find(c => c.id === collectionId);

      if (!collection?.slug) {
        const error = new Error(`Collection ${collectionId} not found in schema`);
        console.error(error);
        throw error;
      }

      try {
        const data = await import(`@/data/${collection.slug}.json`);

        // Validate data format
        if (!Array.isArray(data.default)) {
          throw new Error(`Invalid data format for ${collection.slug}.json - expected array`);
        }

        // Check if any required fields are missing in the data
        const hasInvalidRecords = data.default.some((item: any) => {
          // Check for missing required fields based on schema
          return collection.fields
            .filter(field => field.required)
            .some(field => {
              const fieldExists = Object.prototype.hasOwnProperty.call(item, field.name);
              const fieldHasValue = item[field.name] !== null && item[field.name] !== undefined && item[field.name] !== '';
              return !fieldExists || !fieldHasValue;
            });
        });

        if (hasInvalidRecords) {
          throw new Error(`Malformed data in ${collection.slug}.json - some records are missing required fields`);
        }

        // Format the raw data into the expected record shape
        this.loadedCollections[collectionId] = data.default.map((item: any) => {
          // If the item already has the expected shape, return it as is
          if (item.data && item.id && item.collectionId) {
            return item;
          }

          // Otherwise, transform it to the expected shape
          return {
            id: item.id || `${collectionId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            collectionId: collectionId,
            data: item,
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString()
          };
        });
      } catch (error) {
        console.error(`Failed to load ${collection.slug}.json`, error);
        throw error;
      }
    }
    return [...this.loadedCollections[collectionId]];
  }
}
