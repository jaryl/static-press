
// This service manages collections and their records
// In a real app, this would connect to a backend API

export interface FieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'select';
  required: boolean;
  options?: string[]; // For select field types
}

export interface CollectionSchema {
  id: string;
  name: string;
  slug: string;
  description: string;
  fields: FieldDefinition[];
  createdAt: string;
  updatedAt: string;
}

export type RecordData = {
  [key: string]: any;
};

export interface CollectionRecord {
  id: string;
  collectionId: string;
  data: RecordData;
  createdAt: string;
  updatedAt: string;
}

// In-memory store for collections and records
let collections: CollectionSchema[] = [
  {
    id: "1",
    name: "Products",
    slug: "products",
    description: "Product catalog items",
    fields: [
      { id: "1-1", name: "name", type: "text", required: true },
      { id: "1-2", name: "price", type: "number", required: true },
      { id: "1-3", name: "inStock", type: "boolean", required: true },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Customers",
    slug: "customers",
    description: "Customer information",
    fields: [
      { id: "2-1", name: "name", type: "text", required: true },
      { id: "2-2", name: "email", type: "email", required: true },
      { id: "2-3", name: "joinDate", type: "date", required: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let records: { [collectionId: string]: CollectionRecord[] } = {
  "1": [
    {
      id: "1-1",
      collectionId: "1",
      data: { name: "Laptop", price: 1299, inStock: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "1-2",
      collectionId: "1",
      data: { name: "Smartphone", price: 799, inStock: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  "2": [
    {
      id: "2-1",
      collectionId: "2",
      data: { 
        name: "Jane Doe", 
        email: "jane@example.com", 
        joinDate: "2023-01-15" 
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const collectionService = {
  // Collection schema operations
  getCollections: async (): Promise<CollectionSchema[]> => {
    await delay(300); // Simulate API delay
    return [...collections];
  },

  getCollection: async (id: string): Promise<CollectionSchema | null> => {
    await delay(200);
    const collection = collections.find(c => c.id === id);
    return collection ? { ...collection } : null;
  },

  createCollection: async (collection: Omit<CollectionSchema, 'id' | 'createdAt' | 'updatedAt'>): Promise<CollectionSchema> => {
    await delay(500);
    const newCollection: CollectionSchema = {
      ...collection,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    collections = [...collections, newCollection];
    records[newCollection.id] = [];
    return newCollection;
  },

  updateCollection: async (id: string, updates: Partial<Omit<CollectionSchema, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CollectionSchema> => {
    await delay(500);
    collections = collections.map(c => 
      c.id === id 
        ? { 
            ...c, 
            ...updates, 
            updatedAt: new Date().toISOString() 
          } 
        : c
    );
    const updated = collections.find(c => c.id === id);
    if (!updated) throw new Error("Collection not found");
    return updated;
  },

  deleteCollection: async (id: string): Promise<void> => {
    await delay(500);
    collections = collections.filter(c => c.id !== id);
    delete records[id];
  },

  // Records operations
  getRecords: async (collectionId: string): Promise<CollectionRecord[]> => {
    await delay(300);
    return records[collectionId] ? [...records[collectionId]] : [];
  },

  getRecord: async (collectionId: string, recordId: string): Promise<CollectionRecord | null> => {
    await delay(200);
    const record = records[collectionId]?.find(r => r.id === recordId);
    return record ? { ...record } : null;
  },

  createRecord: async (collectionId: string, data: RecordData): Promise<CollectionRecord> => {
    await delay(500);
    const newRecord: CollectionRecord = {
      id: `${collectionId}-${Date.now()}`,
      collectionId,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    if (!records[collectionId]) {
      records[collectionId] = [];
    }
    
    records[collectionId] = [...records[collectionId], newRecord];
    return newRecord;
  },

  updateRecord: async (collectionId: string, recordId: string, data: RecordData): Promise<CollectionRecord> => {
    await delay(500);
    const collectionRecords = records[collectionId];
    if (!collectionRecords) throw new Error("Collection not found");
    
    records[collectionId] = collectionRecords.map(r => 
      r.id === recordId 
        ? { 
            ...r, 
            data: { ...data }, 
            updatedAt: new Date().toISOString() 
          } 
        : r
    );
    
    const updated = records[collectionId].find(r => r.id === recordId);
    if (!updated) throw new Error("Record not found");
    return updated;
  },

  deleteRecord: async (collectionId: string, recordId: string): Promise<void> => {
    await delay(500);
    const collectionRecords = records[collectionId];
    if (!collectionRecords) return;
    
    records[collectionId] = collectionRecords.filter(r => r.id !== recordId);
  }
};
