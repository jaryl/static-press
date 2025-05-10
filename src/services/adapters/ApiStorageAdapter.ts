import type { StorageAdapter } from './StorageAdapter';
import type { CollectionSchema, CollectionRecord } from '@/types';
import { authService } from '@/services/authService';

// Custom error class for adapter-specific issues
export class ApiAdapterError extends Error {
  errorType: string;
  status?: number;

  constructor(message: string, errorType: string, status?: number) {
    super(message);
    this.name = 'ApiAdapterError';
    this.errorType = errorType;
    this.status = status;
  }
}

export class ApiStorageAdapter implements StorageAdapter {
  private currentSiteId: string = 'default';
  private baseUrl: string;

  constructor(siteId: string = 'default') {
    this.currentSiteId = siteId;
    // Construct the base URL from S3 configuration
    const s3Endpoint = import.meta.env.VITE_S3_ENDPOINT_URL;
    const s3Bucket = import.meta.env.VITE_S3_BUCKET_NAME;

    // Ensure endpoint doesn't have trailing slash
    const cleanEndpoint = s3Endpoint.endsWith('/') ? s3Endpoint.slice(0, -1) : s3Endpoint;

    // Construct the base URL for collection files with site path
    this.baseUrl = `${cleanEndpoint}/${s3Bucket}/sites/${this.currentSiteId}/collections`;

    console.log(`[ApiStorageAdapter] Initialized with data URL: ${this.baseUrl}`);
  }

  /**
   * Private helper method to make authenticated API requests
   * @param relativePath The relative path to fetch
   * @param options Additional fetch options
   * @returns Promise with the fetch response
   */
  private async fetchWithAuth(
    relativePath: string,
    options: RequestInit = {}
  ): Promise<Response> {
    // Get the auth token
    const token = authService.getToken();

    // Prepare headers with authentication
    const headers = {
      ...options.headers,
      'Authorization': token ? `Bearer ${token}` : '',
    };

    // If we're sending JSON data, add the Content-Type header
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    // Construct the full URL using the relative path
    // The browser will use the current origin (localhost:5173 or production domain)
    const url = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

    // Make the authenticated request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  }

  // Set current site ID
  setSiteId(siteId: string): void {
    this.currentSiteId = siteId || 'default';
    // Reconstruct the base URL with new site ID
    const s3Endpoint = import.meta.env.VITE_S3_ENDPOINT_URL;
    const s3Bucket = import.meta.env.VITE_S3_BUCKET_NAME;
    const cleanEndpoint = s3Endpoint.endsWith('/') ? s3Endpoint.slice(0, -1) : s3Endpoint;
    this.baseUrl = `${cleanEndpoint}/${s3Bucket}/sites/${this.currentSiteId}/collections`;
    console.log(`[ApiStorageAdapter] Switched to site: ${this.currentSiteId}, new data URL: ${this.baseUrl}`);
  }

  // Get current site ID
  getSiteId(): string {
    return this.currentSiteId;
  }

  // Read operations
  async getSchema(): Promise<CollectionSchema[]> {
    try {
      // Use the API to fetch the schema with site ID
      const schemaPath = `/api/schema?siteId=${this.currentSiteId}`;
      console.log(`[ApiStorageAdapter] Fetching schema from API: ${schemaPath}`);

      const response = await this.fetchWithAuth(schemaPath);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status} fetching schema from API`);

      const schema = await response.json();
      if (!Array.isArray(schema)) {
        throw new Error('Invalid schema format from API - expected array');
      }

      return schema as CollectionSchema[];
    } catch (error) {
      console.error('[ApiStorageAdapter] Failed to load schema from API', error);
      throw error;
    }
  }

  async getCollectionData(slug: string): Promise<CollectionRecord[]> {
    if (!this.baseUrl) {
      // This is a configuration error, should ideally not happen if constructor runs ok
      throw new ApiAdapterError(
        `[ApiStorageAdapter] Base URL could not be constructed. Cannot fetch data for ${slug} from remote source.`,
        'CONFIGURATION_ERROR'
      );
    }

    const dataUrl = `${this.baseUrl}/${slug}.json`;
    console.log(`[ApiStorageAdapter] Fetching data from ${dataUrl}`);

    try {
      // Note: This is a direct S3 request, not an API request, so we don't use fetchWithAuth
      const response = await fetch(dataUrl);

      // Handle Not Found
      if (response.status === 404) {
        console.warn(`[ApiStorageAdapter] Data file not found for ${slug} at ${dataUrl}`);
        throw new ApiAdapterError(
          `Collection data file (${slug}.json) not found.`,
          'COLLECTION_DATA_NOT_FOUND',
          404
        );
      }

      // Handle other non-successful responses
      if (!response.ok) {
        throw new ApiAdapterError(
          `HTTP error fetching collection data for ${slug}. Status: ${response.status}`,
          'FETCH_ERROR',
          response.status
        );
      }

      // Try parsing the JSON response
      try {
        const data = await response.json();
        if (!Array.isArray(data)) {
          // Treat non-array response as malformed data
          throw new Error(`Invalid data format for ${slug}.json - expected array`);
        }
        return data as CollectionRecord[];
      } catch (parseError) {
        // Handle JSON parsing errors
        console.error(`[ApiStorageAdapter] Failed to parse JSON for ${slug}.json from ${dataUrl}`, parseError);
        throw new ApiAdapterError(
          `Failed to parse collection data file (${slug}.json). It might be malformed.`,
          'COLLECTION_DATA_MALFORMED',
          response.status // Keep the original status if available
        );
      }
    } catch (error) {
      // Catch fetch errors (network issues) or re-throw specific ApiAdapterErrors
      if (error instanceof ApiAdapterError) {
        // Re-throw the specific error we created
        throw error;
      } else {
        // Catch generic fetch/network errors
        console.error(`[ApiStorageAdapter] Network or unexpected error fetching ${slug}.json from remote`, error);
        throw new ApiAdapterError(
          `Failed to fetch collection data for ${slug} due to a network or unexpected error.`,
          'FETCH_ERROR'
          // No status code available here usually
        );
      }
    }
  }

  // Write operations
  async updateSchema(schemaData: CollectionSchema[]): Promise<void> {
    const schemaPath = `/api/schema?siteId=${this.currentSiteId}`;
    console.log(`[ApiStorageAdapter] Sending schema update to ${schemaPath}`);
    try {
      const response = await this.fetchWithAuth(schemaPath, {
        method: 'PUT',
        body: JSON.stringify(schemaData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error! status: ${response.status} - ${errorData.message || 'Failed to update schema'}`);
      }
      console.log('[ApiStorageAdapter] Schema update successful (via API)');
    } catch (error) {
      console.error('[ApiStorageAdapter] Error updating schema via API:', error);
      throw error;
    }
  }

  async saveCollectionData(slug: string, records: CollectionRecord[]): Promise<void> {
    const collectionPath = `/api/collections/${slug}`;
    console.log(`[ApiStorageAdapter] Sending collection data update to ${collectionPath}`);
    try {
      const response = await this.fetchWithAuth(collectionPath, {
        method: 'PUT',
        body: JSON.stringify(records),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error! status: ${response.status} - ${errorData.message || `Failed to update collection ${slug}`}`);
      }
      console.log(`[ApiStorageAdapter] Collection '${slug}' update successful (via API)`);
    } catch (error) {
      console.error(`[ApiStorageAdapter] Error updating collection ${slug} via API:`, error);
      throw error;
    }
  }

  async makeCollectionPublic(slug: string): Promise<void> {
    const path = `/api/collections/make-public/${slug}`;
    console.log(`[ApiStorageAdapter] Making collection public via API: PUT ${path}`);
    try {
      const response = await this.fetchWithAuth(path, {
        method: 'PUT',
        // No body needed for this request
      });

      if (!response.ok) {
        // Attempt to get more details from the error response
        const errorData = await response.json().catch(() => ({})); // Default to empty object if parsing fails
        const errorMessage = errorData.message || `API error! status: ${response.status}`;
        const errorType = errorData.errorCode || (response.status === 404 ? 'NOT_FOUND' : 'API_ERROR');

        console.error(`[ApiStorageAdapter] Failed to make collection ${slug} public: ${errorMessage} (Status: ${response.status})`);
        throw new ApiAdapterError(
          errorMessage,
          errorType,
          response.status
        );
      }
      console.log(`[ApiStorageAdapter] Collection '${slug}' made public successfully (via API)`);
    } catch (error) {
      // Re-throw ApiAdapterErrors, wrap others
      if (error instanceof ApiAdapterError) {
        throw error;
      }
      console.error(`[ApiStorageAdapter] Unexpected error making collection ${slug} public via API:`, error);
      throw new ApiAdapterError(
        error instanceof Error ? error.message : `An unexpected error occurred`,
        'UNEXPECTED_ERROR'
      );
    }
  }

  getRawDataUrl(slug: string): string {
    if (!this.baseUrl) {
      console.warn('[ApiStorageAdapter] Base URL could not be constructed, cannot generate raw data URL.');
      return '';
    }

    // Collections are always in the data directory (already included in baseUrl)
    return `${this.baseUrl}/${slug}.json`;
  }

  /**
   * Gets the full URL for an image path based on the remote storage strategy
   * @param imagePath The path to the image
   * @returns The full URL to the image
   */
  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return '';
    }

    // Handle absolute URLs (starting with http:// or https://)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    if (!this.baseUrl) {
      return '';
    }

    // Remove leading slash if present for consistency
    const normalizedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

    // Extract the base URL without the 'collections' part to get to the site root
    const baseUrlWithoutCollections = this.baseUrl.replace(/\/collections$/, '');

    // Images are always in the images directory
    return `${baseUrlWithoutCollections}/images/${normalizedPath}`;
  }

  /**
   * Checks if the adapter is using remote storage
   * @returns Always true for ApiStorageAdapter
   */
  isRemoteStorage(): boolean {
    return true;
  }
}
