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

  async getCollectionData(slug: string): Promise<any[]> {
    if (!this.loadedCollections[slug]) {
      const collections = await this.getSchema();
      const collection = collections.find(c => c.slug === slug);

      if (!collection) {
        const error = new Error(`Collection ${slug} not found in schema`);
        console.error(error);
        throw error;
      }

      try {
        const data = await import(`@/data/${slug}.json`);

        // Validate data format
        if (!Array.isArray(data.default)) {
          throw new Error(`Invalid data format for ${slug}.json - expected array`);
        }

        // Check if any required fields are missing in the data
        const hasInvalidRecords = data.default.some((item: any) => {
          // Check for missing required fields based on schema
          return collection.fields
            .filter(field => field.required)
            .some(field => {
              const fieldExists = Object.prototype.hasOwnProperty.call(item.data, field.name);
              const fieldHasValue = item.data[field.name] !== null && item.data[field.name] !== undefined && item[field.name] !== '';
              return !fieldExists || !fieldHasValue;
            });
        });

        if (hasInvalidRecords) {
          throw new Error(`Malformed data in ${slug}.json - some records are missing required fields`);
        }

        // Format the raw data into the expected record shape
        this.loadedCollections[slug] = data.default.map((item: any) => {
          // If the item already has the expected shape, return it as is
          if (item.data && item.id && item.slug) {
            return item;
          }

          // Otherwise, transform it to the expected shape
          return {
            id: item.id || `${slug}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            slug,
            data: item,
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString()
          };
        });
      } catch (error) {
        console.error(`Failed to load ${slug}.json`, error);
        throw error;
      }
    }
    return [...this.loadedCollections[slug]];
  }
}
