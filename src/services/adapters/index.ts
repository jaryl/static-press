import { LocalDataAdapter } from './LocalDataAdapter';
import { RemoteDataAdapter } from './RemoteDataAdapter';

export function createDataAdapter() {
  try {
    return import.meta.env.VITE_DATA_URL 
      ? new RemoteDataAdapter()
      : new LocalDataAdapter();
  } catch (error) {
    console.error('Failed to initialize data adapter, falling back to local', error);
    return new LocalDataAdapter();
  }
}
