import { Checkbox } from "@/components/ui/checkbox";
import { FieldInputProps } from "./types";

const BooleanInput = ({ field, value, onChange }: FieldInputProps) => (
  <Checkbox
    checked={!!value}
    onCheckedChange={(checked) => onChange(field, !!checked)}
    className="mt-1"
  />
);

export default BooleanInput;
