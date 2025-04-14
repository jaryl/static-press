import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldInputProps } from "./types";

const SelectInput = ({ field, value, onChange }: FieldInputProps) => (
  <Select
    value={value}
    onValueChange={(newValue) => onChange(field, newValue)}
  >
    <SelectTrigger className="h-8 text-xs w-full">
      <SelectValue placeholder="Select..." />
    </SelectTrigger>
    <SelectContent>
      {field.options?.map((option) => (
        <SelectItem key={option} value={option}>
          {option}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default SelectInput;
