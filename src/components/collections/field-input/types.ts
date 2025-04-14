import { FieldDefinition } from "@/services/schemaService";

export interface FieldInputProps {
  field: FieldDefinition;
  value: any;
  onChange: (field: FieldDefinition, value: any) => void;
}
