// Define available field types
export type FieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'email'
  | 'url'
  | 'select'
  | 'image'
  | 'array'
  | 'coordinates';

export interface Field {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  timezoneAware?: boolean;
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
