import { StorageAdapter } from './StorageAdapter';
import { ApiStorageAdapter } from './ApiStorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';

export { ApiStorageAdapter } from './ApiStorageAdapter';

export function createStorageAdapter(): StorageAdapter {
  try {
    // Use environment variable to decide which adapter to use
    const useRemote = !!import.meta.env.VITE_API_BASE_URL;

    return useRemote
      ? new ApiStorageAdapter()
      : new LocalStorageAdapter();
  } catch (error) {
    console.error('Failed to initialize storage adapter, falling back to local', error);
    // Fallback to LocalStorageAdapter in case of error or missing env var
    return new LocalStorageAdapter();
  }
}
