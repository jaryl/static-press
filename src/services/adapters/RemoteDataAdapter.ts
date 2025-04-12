export class RemoteDataAdapter {
  private baseUrl: string;
  private loadedCollections: Record<string, any> = {};

  constructor() {
    this.baseUrl = import.meta.env.VITE_DATA_URL;
    if (!this.baseUrl) {
      throw new Error('VITE_DATA_URL environment variable is not set');
    }
  }

  async getSchema(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/schema.json`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const schema = await response.json();
      if (!Array.isArray(schema)) {
        throw new Error('Invalid schema format - expected array');
      }
      return [...schema];
    } catch (error) {
      console.error('Failed to load remote schema.json', error);
      throw error; // Re-throw the error instead of returning empty array
    }
  }

  async getCollectionData(slug: string): Promise<any[]> {
    if (!this.loadedCollections[slug]) {
      const schema = await this.getSchema();
      const collection = schema.find(c => c.slug === slug);

      if (!collection?.slug) {
        const error = new Error(`Collection ${slug} not found in schema`);
        console.error(error);
        throw error; // Throw error instead of returning empty array
      }

      try {
        const response = await fetch(`${this.baseUrl}/${collection.slug}.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        // Validate data format
        if (!Array.isArray(data)) {
          throw new Error(`Invalid data format for ${collection.slug}.json - expected array`);
        }

        // Check if any required fields are missing in the data
        const hasInvalidRecords = data.some((item: any) => {
          // Check for missing required fields based on schema

          return collection.fields
            .filter((field: any) => field.required)
            .some((field: any) => {
              const fieldExists = Object.prototype.hasOwnProperty.call(item.data, field.name);
              const fieldHasValue = item.data[field.name] !== null && item.data[field.name] !== undefined && item.data[field.name] !== '';
              return !fieldExists || !fieldHasValue;
            });
        });

        if (hasInvalidRecords) {
          throw new Error(`Malformed data in ${collection.slug}.json - some records are missing required fields`);
        }

        // Format the raw data into the expected record shape
        this.loadedCollections[slug] = Array.isArray(data)
          ? data.map((item: any) => {
            // If the item already has the expected shape, return it as is
            if (item && item.id) {
              return item;
            }

            // Otherwise, transform it to the expected shape
            return {
              id: item.id,
              data: item.data,
              createdAt: item.createdAt || new Date().toISOString(),
              updatedAt: item.updatedAt || new Date().toISOString()
            };
          })
          : [];
      } catch (error) {
        console.error(`Failed to load remote ${collection.slug}.json`, error);
        throw error; // Re-throw the error instead of returning empty array
      }
    }
    return [...this.loadedCollections[slug]];
  }
}
