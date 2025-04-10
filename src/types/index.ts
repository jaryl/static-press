export interface Field {
  name: string;
  type: string;
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
