import type { DataAdapter } from './index';
import type { CollectionSchema } from '../schemaService';
import type { CollectionRecord } from '../collectionService';

export class RemoteDataAdapter implements DataAdapter {
  private baseUrl: string;
  private apiBaseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_DATA_URL || '';
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    if (!this.baseUrl) {
      console.warn('VITE_DATA_URL is not set. GET operations might fail if schema/data are not in S3.');
    }
  }

  async getSchema(): Promise<CollectionSchema[]> {
    if (!this.baseUrl) throw new Error('VITE_DATA_URL must be set to fetch initial schema.');
    try {
      const response = await fetch(`${this.baseUrl}/schema.json`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status} fetching schema.json`);
      const schema = await response.json();
      if (!Array.isArray(schema)) {
        throw new Error('Invalid schema format - expected array');
      }
      return schema as CollectionSchema[];
    } catch (error) {
      console.error('Failed to load remote schema.json', error);
      throw error;
    }
  }

  async getCollectionData(slug: string): Promise<CollectionRecord[]> {
    if (!this.baseUrl) throw new Error(`VITE_DATA_URL must be set to fetch initial data for ${slug}.`);
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
      console.error(`Failed to load remote ${slug}.json`, error);
      throw error;
    }
  }

  async updateSchema(schemaData: CollectionSchema[]): Promise<void> {
    console.log(`[RemoteDataAdapter] Sending schema update to ${this.apiBaseUrl}/schema`);
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
      console.log('[RemoteDataAdapter] Schema update successful (via API)');
    } catch (error) {
      console.error('Error updating schema via API:', error);
      throw error;
    }
  }

  async updateCollectionData(slug: string, records: CollectionRecord[]): Promise<void> {
    const url = `${this.apiBaseUrl}/collections/${slug}`;
    console.log(`[RemoteDataAdapter] Sending collection data update to ${url}`);
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
      console.log(`[RemoteDataAdapter] Collection '${slug}' update successful (via API)`);
    } catch (error) {
      console.error(`Error updating collection ${slug} via API:`, error);
      throw error;
    }
  }
}
