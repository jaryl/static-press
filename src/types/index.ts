
export interface Field {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'select';
  required?: boolean;
  options?: string[];
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
