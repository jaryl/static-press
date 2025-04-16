/**
 * Represents the data structure submitted by the collection creation/editing form.
 */
export type CollectionFormData = {
  name: string;
  slug: string;
  description: string;
  // TODO: Define a more specific type for fields if possible
  fields?: any[];
};
