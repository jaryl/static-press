export interface FieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'email' | 'url' | 'select' | 'image' | 'array' | 'coordinates';
  required: boolean;
  options?: string[];
  timezoneAware?: boolean;
}

export interface CollectionSchema {
  id: string; // Required to maintain compatibility with existing code
  name: string;
  slug: string;
  description: string;
  fields: FieldDefinition[];
  createdAt: string;
  updatedAt: string;
}
