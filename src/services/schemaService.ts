import { createStorageAdapter } from './adapters';
import { ApiAdapterError, ApiStorageAdapter } from './adapters/ApiStorageAdapter';
import type { CollectionSchema } from '@/types';
import { authService } from './authService';

interface SchemaMetadata {
  lastModified: string;
  size: number;
  isPublic: boolean;
}

interface PresignedUrlResponse {
  presignedUrl: string;
}

const storageAdapter = createStorageAdapter() as ApiStorageAdapter;
let collectionsCache: Record<string, CollectionSchema[]> = {};
let currentSiteId = 'default';
const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const schemaService = {
  // Set the current site ID for schema operations
  setSiteId(siteId: string): void {
    const newSiteId = siteId || 'default';
    currentSiteId = newSiteId;
    // Update the storage adapter with the new site ID
    if (storageAdapter.setSiteId) {
      storageAdapter.setSiteId(newSiteId);
    }
    console.log(`[schemaService] Switched to site: ${newSiteId}`);
  },

  // Get the current site ID
  getSiteId(): string {
    return currentSiteId;
  },
  async initialize(): Promise<void> {
    try {
      collectionsCache[currentSiteId] = await storageAdapter.getSchema();
    } catch (error) {
      console.error(`[schemaService] Error loading schema for site ${currentSiteId}:`, error);
      if (error instanceof ApiAdapterError) {
        throw error;
      } else {
        throw new Error(`Failed to initialize schema service for site ${currentSiteId}.`);
      }
    }
  },

  async getCollections(): Promise<CollectionSchema[]> {
    console.log(`[schemaService] getCollections called for site ${currentSiteId}`); await delay(300);
    if (!collectionsCache[currentSiteId]) {
      await this.initialize();
    }
    return [...(collectionsCache[currentSiteId] || [])];
  },

  async getCollection(slug: string): Promise<CollectionSchema | null> {
    await delay(200);
    if (!collectionsCache[currentSiteId]) {
      await this.initialize();
    }
    const collection = collectionsCache[currentSiteId]?.find(c => c.slug === slug);
    return collection ? { ...collection } : null;
  },

  async createCollection(data: Omit<CollectionSchema, 'createdAt' | 'updatedAt'>): Promise<CollectionSchema> {
    await delay(500);
    const newCollection: CollectionSchema = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!collectionsCache[currentSiteId]) {
      collectionsCache[currentSiteId] = [];
    }
    collectionsCache[currentSiteId] = [...collectionsCache[currentSiteId], newCollection];
    await storageAdapter.updateSchema(collectionsCache[currentSiteId]);
    return { ...newCollection };
  },

  async updateCollection(slug: string, updates: Partial<CollectionSchema>): Promise<CollectionSchema> {
    await delay(500);
    if (!collectionsCache[currentSiteId]) {
      await this.initialize();
    }

    let updatedCollection: CollectionSchema | null = null;
    collectionsCache[currentSiteId] = collectionsCache[currentSiteId].map(c => {
      if (c.slug === slug) {
        updatedCollection = { ...c, ...updates, updatedAt: new Date().toISOString() };
        return updatedCollection;
      }
      return c;
    });

    if (!updatedCollection) {
      console.error(`[schemaService] Collection not found for update: ${slug} in site ${currentSiteId}`);
      throw new Error(`Collection not found for update in site ${currentSiteId}`);
    }
    await storageAdapter.updateSchema(collectionsCache[currentSiteId]);
    return { ...updatedCollection };
  },

  async deleteCollection(slug: string): Promise<void> {
    await delay(500);
    if (!collectionsCache[currentSiteId]) {
      await this.initialize();
    }

    const initialLength = collectionsCache[currentSiteId].length;
    collectionsCache[currentSiteId] = collectionsCache[currentSiteId].filter(c => c.slug !== slug);

    if (collectionsCache[currentSiteId].length === initialLength) {
      console.error(`[schemaService] Collection not found for delete: ${slug} in site ${currentSiteId}`);
      throw new Error(`Collection not found for delete in site ${currentSiteId}`);
    }
    await storageAdapter.updateSchema(collectionsCache[currentSiteId]);
  },

  async getSchemaFileMetadata(apiBaseUrl: string): Promise<SchemaMetadata> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication token not found.');
    }
    if (!apiBaseUrl) {
      throw new Error('API Base URL is not configured.');
    }

    const response = await fetch(`${apiBaseUrl}/schema/metadata?siteId=${currentSiteId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error fetching metadata: ${response.status}`);
    }
    return await response.json() as SchemaMetadata;
  },

  async getSchemaPresignedUrl(apiBaseUrl: string): Promise<PresignedUrlResponse> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication token not found.');
    }
    if (!apiBaseUrl) {
      throw new Error('API Base URL is not configured.');
    }

    const response = await fetch(`${apiBaseUrl}/schema/presigned-url?siteId=${currentSiteId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error getting presigned URL: ${response.status}`);
    }
    const data = await response.json();
    if (!data.presignedUrl) {
      throw new Error('No presigned URL received from server.');
    }
    return data as PresignedUrlResponse;
  },

  async makeSchemaPrivate(apiBaseUrl: string): Promise<void> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication token not found.');
    }
    if (!apiBaseUrl) {
      throw new Error('API Base URL is not configured.');
    }

    const response = await fetch(`${apiBaseUrl}/schema/make-private?siteId=${currentSiteId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error making schema private: ${response.status}`);
    }
    // No return value needed on success
  },
};
