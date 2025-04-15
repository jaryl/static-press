import type { StorageAdapter } from './StorageAdapter';
import type { CollectionSchema } from '../../shared/types/schema';
import type { CollectionRecord } from '../../shared/types/collection';

export class ApiStorageAdapter implements StorageAdapter {
  private baseUrl: string;
  private apiBaseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_DATA_URL || '';
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

    if (!this.baseUrl) {
      console.warn('VITE_DATA_URL is not set. GET operations might fail if schema/data are not in S3.');
    }
  }

  // Read operations (same as PublicContentAdapter)
  async getSchema(): Promise<CollectionSchema[]> {
    if (!this.baseUrl) throw new Error('VITE_DATA_URL must be set to fetch schema.');
    try {
      const response = await fetch(`${this.baseUrl}/schema.json`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status} fetching schema.json`);
      const schema = await response.json();
      if (!Array.isArray(schema)) {
        throw new Error('Invalid schema format - expected array');
      }
      return schema as CollectionSchema[];
    } catch (error) {
      console.error('Failed to load schema.json', error);
      throw error;
    }
  }

  async getCollectionData(slug: string): Promise<CollectionRecord[]> {
    if (!this.baseUrl) throw new Error(`VITE_DATA_URL must be set to fetch data for ${slug}.`);
    try {
      const response = await fetch(`${this.baseUrl}/${slug}.json`);
      if (response.status === 404) {
        return [];
      }
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status} fetching ${slug}.json`);
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error(`Invalid data format for ${slug}.json - expected array`);
      }
      return data as CollectionRecord[];
    } catch (error) {
      console.error(`Failed to load ${slug}.json`, error);
      throw error;
    }
  }

  // Write operations
  async updateSchema(schemaData: CollectionSchema[]): Promise<void> {
    console.log(`[ApiStorageAdapter] Sending schema update to ${this.apiBaseUrl}/schema`);
    try {
      const response = await fetch(`${this.apiBaseUrl}/schema`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schemaData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error! status: ${response.status} - ${errorData.message || 'Failed to update schema'}`);
      }
      console.log('[ApiStorageAdapter] Schema update successful (via API)');
    } catch (error) {
      console.error('Error updating schema via API:', error);
      throw error;
    }
  }

  async saveCollectionData(slug: string, records: CollectionRecord[]): Promise<void> {
    const url = `${this.apiBaseUrl}/collections/${slug}`;
    console.log(`[ApiStorageAdapter] Sending collection data update to ${url}`);
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(records),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error! status: ${response.status} - ${errorData.message || `Failed to update collection ${slug}`}`);
      }
      console.log(`[ApiStorageAdapter] Collection '${slug}' update successful (via API)`);
    } catch (error) {
      console.error(`Error updating collection ${slug} via API:`, error);
      throw error;
    }
  }

  getRawDataUrl(slug: string): string {
    if (!this.baseUrl) {
      console.warn('ApiStorageAdapter: VITE_DATA_URL not set, cannot generate raw data URL.');
      return '';
    }
    return `${this.baseUrl}/${slug}.json`;
  }
}
