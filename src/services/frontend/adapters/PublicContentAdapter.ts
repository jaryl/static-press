import type { ContentAdapter } from './ContentAdapter';
import type { CollectionSchema } from '../../shared/types/schema';
import type { CollectionRecord } from '../../shared/types/collection';

export class PublicContentAdapter implements ContentAdapter {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_DATA_URL || '';
    if (!this.baseUrl) {
      console.warn('VITE_DATA_URL is not set. GET operations might fail if schema/data are not available.');
    }
  }

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

  getRawDataUrl(slug: string): string {
    if (!this.baseUrl) {
      console.warn('PublicContentAdapter: VITE_DATA_URL not set, cannot generate raw data URL.');
      return '';
    }
    return `${this.baseUrl}/${slug}.json`;
  }
}
