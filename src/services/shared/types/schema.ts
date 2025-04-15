export interface FieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'email' | 'url' | 'select' | 'image' | 'array' | 'coordinates';
  required: boolean;
  options?: string[];
  timezoneAware?: boolean;
}

export interface CollectionSchema {
  name: string;
  slug: string;
  description: string;
  fields: FieldDefinition[];
  createdAt: string;
  updatedAt: string;
}
