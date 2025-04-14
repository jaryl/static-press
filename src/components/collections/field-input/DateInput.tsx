import { Input } from "@/components/ui/input";
import { FieldInputProps } from "./types";

const DateInput = ({ field, value, onChange }: FieldInputProps) => (
  <Input
    type={field.type as 'date' | 'datetime'}
    value={value}
    onChange={(e) => onChange(field, e.target.value)}
    className="h-8 text-xs py-0 w-full"
    placeholder={field.type === 'datetime' && field.timezoneAware ? 'YYYY-MM-DDTHH:mm:ssZ' : ''}
  />
);

export default DateInput;
