import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldDefinition } from "@/services/collectionService";

// Component to render a field input based on its type
const FieldInput = memo(({
  field,
  value,
  onChange
}: {
  field: FieldDefinition;
  value: any;
  onChange: (field: FieldDefinition, value: any) => void;
}) => {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'url':
      return (
        <Input
          type={field.type}
          value={value !== undefined ? value : ''}
          onChange={(e) => onChange(field, e.target.value)}
          className="h-8 text-xs py-0 w-full"
        />
      );
    case 'number':
      return (
        <Input
          type="number"
          value={value !== undefined ? value : ''}
          onChange={(e) => onChange(field, e.target.value ? Number(e.target.value) : null)}
          className="h-8 text-xs py-0 w-full"
        />
      );
    case 'date':
      return (
        <Input
          type="date"
          value={value !== undefined ? value : ''}
          onChange={(e) => onChange(field, e.target.value)}
          className="h-8 text-xs py-0 w-full"
        />
      );
    case 'boolean':
      return (
        <Checkbox
          checked={!!value}
          onCheckedChange={(checked) => onChange(field, checked)}
        />
      );
    case 'select':
      return (
        <Select
          value={value ? String(value) : undefined}
          onValueChange={(value) => onChange(field, value)}
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
    default:
      return (
        <Textarea
          value={value !== undefined ? value : ''}
          onChange={(e) => onChange(field, e.target.value)}
          className="text-xs min-h-0 h-8 py-1.5 resize-none w-full"
        />
      );
  }
});

export default FieldInput;
