import { Input } from "@/components/ui/input";
import { FieldInputProps } from "./types";

const NumberInput = ({ field, value, onChange }: FieldInputProps) => (
  <Input
    type="number"
    value={value}
    onChange={(e) => onChange(field, e.target.value ? Number(e.target.value) : '')}
    className="h-8 text-xs py-0 w-full"
  />
);

export default NumberInput;
