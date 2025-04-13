import { s3Client, bucketName } from '../../lib/s3Client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import type { DataAdapter } from './index';
import type { CollectionSchema } from '../schemaService';
import type { CollectionRecord } from '../collectionService';

export class RemoteDataAdapter implements DataAdapter {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_DATA_URL || '';
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
    if (!bucketName) {
      throw new Error('S3 bucket name is not configured.');
    }
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: 'schema.json',
      Body: JSON.stringify(schemaData, null, 2),
      ContentType: 'application/json',
    });

    try {
      await s3Client.send(command);
    } catch (error) {
      console.error('Error updating schema.json in S3:', error);
      throw error;
    }
  }

  async updateCollectionData(slug: string, records: CollectionRecord[]): Promise<void> {
    if (!bucketName) {
      throw new Error('S3 bucket name is not configured.');
    }
    const key = `${slug}.json`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(records, null, 2),
      ContentType: 'application/json',
    });

    try {
      await s3Client.send(command);
    } catch (error) {
      console.error(`Error updating ${key} in S3:`, error);
      throw error;
    }
  }
}
