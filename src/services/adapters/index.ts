import { StorageAdapter } from './StorageAdapter';
import { ApiStorageAdapter } from './ApiStorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';

export { ApiStorageAdapter } from './ApiStorageAdapter';

export function createStorageAdapter(): StorageAdapter {
  try {
    const useRemoteData = import.meta.env.VITE_USE_REMOTE_DATA;
    const shouldUseRemoteData = useRemoteData === 'true' || useRemoteData === true;

    if (shouldUseRemoteData) {
      console.log('[Backend] Using ApiStorageAdapter with remote data source');
      return new ApiStorageAdapter();
    } else {
      console.log('[Backend] Using LocalStorageAdapter with local data source');
      return new LocalStorageAdapter();
    }
  } catch (error) {
    console.error('Failed to initialize storage adapter, falling back to local', error);
    return new LocalStorageAdapter();
  }
}
