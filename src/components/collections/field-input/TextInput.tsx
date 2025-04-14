import { Input } from "@/components/ui/input";
import { FieldInputProps } from "./types";

const TextInput = ({ field, value, onChange }: FieldInputProps) => (
  <Input
    type={field.type as 'text' | 'email' | 'url'}
    value={value}
    onChange={(e) => onChange(field, e.target.value)}
    className="h-8 text-xs py-0 w-full"
  />
);

export default TextInput;
