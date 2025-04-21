import { createStorageAdapter } from './adapters';
import { ApiAdapterError } from './adapters/ApiStorageAdapter';
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

const storageAdapter = createStorageAdapter();
let collectionsCache: CollectionSchema[] = [];
const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const schemaService = {
  async initialize(): Promise<void> {
    try {
      collectionsCache = await storageAdapter.getSchema();
    } catch (error) {
      console.error('[schemaService] Error loading schema:', error);
      if (error instanceof ApiAdapterError) {
        throw error;
      } else {
        throw new Error('Failed to initialize schema service.');
      }
    }
  },

  async getCollections(): Promise<CollectionSchema[]> {
    console.log('[schemaService] getCollections called'); await delay(300);
    if (collectionsCache.length === 0) {
      await this.initialize();
    }
    return [...collectionsCache];
  },

  async getCollection(slug: string): Promise<CollectionSchema | null> {
    await delay(200);
    if (collectionsCache.length === 0) {
      await this.initialize();
    }
    const collection = collectionsCache.find(c => c.slug === slug);
    return collection ? { ...collection } : null;
  },

  async createCollection(data: Omit<CollectionSchema, 'createdAt' | 'updatedAt'>): Promise<CollectionSchema> {
    await delay(500);
    const newCollection: CollectionSchema = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    collectionsCache = [...collectionsCache, newCollection];
    await storageAdapter.updateSchema(collectionsCache);
    return { ...newCollection };
  },

  async updateCollection(slug: string, updates: Partial<CollectionSchema>): Promise<CollectionSchema> {
    await delay(500);
    let updatedCollection: CollectionSchema | null = null;
    collectionsCache = collectionsCache.map(c => {
      if (c.slug === slug) {
        updatedCollection = { ...c, ...updates, updatedAt: new Date().toISOString() };
        return updatedCollection;
      }
      return c;
    });

    if (!updatedCollection) {
      console.error(`[schemaService] Collection not found for update: ${slug}`);
      throw new Error("Collection not found for update");
    }
    await storageAdapter.updateSchema(collectionsCache);
    return { ...updatedCollection };
  },

  async deleteCollection(slug: string): Promise<void> {
    await delay(500);
    const initialLength = collectionsCache.length;
    collectionsCache = collectionsCache.filter(c => c.slug !== slug);

    if (collectionsCache.length === initialLength) {
      console.error(`[schemaService] Collection not found for delete: ${slug}`);
      throw new Error("Collection not found for delete");
    }
    await storageAdapter.updateSchema(collectionsCache);
  },

  async getSchemaFileMetadata(apiBaseUrl: string): Promise<SchemaMetadata> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication token not found.');
    }
    if (!apiBaseUrl) {
      throw new Error('API Base URL is not configured.');
    }

    const response = await fetch(`${apiBaseUrl}/schema/metadata`, {
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

    const response = await fetch(`${apiBaseUrl}/schema/presigned-url`, {
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

    const response = await fetch(`${apiBaseUrl}/schema/make-private`, {
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
