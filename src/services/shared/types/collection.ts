export interface CollectionRecord {
  id: string;
  data: RecordData;
  createdAt: string;
  updatedAt: string;
}

export type RecordData = {
  [key: string]: any;
};
