export interface Field {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'email' | 'url' | 'select' | 'image' | 'array';
  required: boolean;
  options?: string[];
  timezoneAware?: boolean; // Added for datetime fields
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  fields: Field[];
}

export interface Record {
  id: string;
  data: { [key: string]: any };
}
