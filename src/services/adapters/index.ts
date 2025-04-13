import { LocalDataAdapter } from './LocalDataAdapter';
import { RemoteDataAdapter } from './RemoteDataAdapter';
import type { CollectionSchema } from '../schemaService';
import type { CollectionRecord } from '../collectionService';

// Define a common interface for data adapters
export interface DataAdapter {
  getSchema(): Promise<CollectionSchema[]>;
  getCollectionData(slug: string): Promise<CollectionRecord[]>;
  updateSchema(schemaData: CollectionSchema[]): Promise<void>;
  updateCollectionData(slug: string, records: CollectionRecord[]): Promise<void>;
}

export function createDataAdapter(): DataAdapter {
  try {
    // Use environment variable to decide which adapter to use
    // Only check for VITE_DATA_URL now
    const useRemote = !!import.meta.env.VITE_DATA_URL;

    return useRemote
      ? new RemoteDataAdapter()
      : new LocalDataAdapter();
  } catch (error) {
    console.error('Failed to initialize data adapter, falling back to local', error);
    // Fallback to LocalDataAdapter in case of error or missing env var
    return new LocalDataAdapter();
  }
}
