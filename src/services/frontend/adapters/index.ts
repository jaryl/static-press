import { ContentAdapter } from './ContentAdapter';
import { LocalContentAdapter } from './LocalContentAdapter';
import { PublicContentAdapter } from './PublicContentAdapter';

export function createContentAdapter(): ContentAdapter {
  try {
    // Use environment variable to decide which adapter to use
    const useRemote = !!import.meta.env.VITE_DATA_URL;

    return useRemote
      ? new PublicContentAdapter()
      : new LocalContentAdapter();
  } catch (error) {
    console.error('Failed to initialize content adapter, falling back to local', error);
    // Fallback to LocalContentAdapter in case of error or missing env var
    return new LocalContentAdapter();
  }
}
