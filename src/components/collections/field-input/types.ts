import { FieldDefinition } from "@/services/shared/types/schema";

export interface FieldInputProps {
  field: FieldDefinition;
  value: any;
  onChange: (field: FieldDefinition, value: any) => void;
}
