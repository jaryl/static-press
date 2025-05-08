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

export interface SelectOption {
  label: string;
  value: string;
}

export type FieldOptions = string[] | SelectOption[];

export interface ArrayField {
  name: string;
  type: FieldType;
  required: boolean;
  label?: string;
  placeholder?: string;
  description?: string;
  options?: FieldOptions;
}

export interface FieldDefinition {
  id?: string;
  name: string;
  type: FieldType;
  required: boolean;
  label?: string;
  placeholder?: string;
  description?: string;
  options?: FieldOptions;
  timezoneAware?: boolean;
  arrayFields?: ArrayField[];
}

export interface CollectionSchema {
  name: string;
  slug: string;
  description: string;
  fields: FieldDefinition[];
  createdAt: string;
  updatedAt: string;
  icon?: string;
  isPublic?: boolean;
}
