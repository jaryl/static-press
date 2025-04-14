import { FieldDefinition } from "@/services/schemaService";

export interface FieldDisplayProps {
  field: FieldDefinition;
  value: any;
}

export interface DateFieldDisplayProps {
  value: string;
}

export interface DateTimeFieldDisplayProps {
  field: FieldDefinition;
  value: string;
}

export interface ImageFieldDisplayProps {
  imagePath: string;
  showMetadata?: boolean;
  lazyLoad?: boolean;
}

export interface ArrayFieldDisplayProps {
  field: FieldDefinition;
  value: any[];
}

export interface CoordinateFieldDisplayProps {
  value: { lat: number; lng: number } | null | undefined;
}
