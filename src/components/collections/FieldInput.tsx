import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldDefinition } from "@/services/collectionService";
import ImagePreview from "./ImagePreview";

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
  const safeValue = value !== undefined && value !== null ? value : '';

  switch (field.type) {
    case 'text':
    case 'email':
    case 'url':
      return (
        <Input
          type={field.type}
          value={safeValue}
          onChange={(e) => onChange(field, e.target.value)}
          className="h-8 text-xs py-0 w-full"
        />
      );
    case 'number':
      return (
        <Input
          type="number"
          value={safeValue}
          onChange={(e) => onChange(field, e.target.value ? Number(e.target.value) : '')}
          className="h-8 text-xs py-0 w-full"
        />
      );
    case 'date':
      return (
        <Input
          type="date"
          value={safeValue}
          onChange={(e) => onChange(field, e.target.value)}
          className="h-8 text-xs py-0 w-full"
        />
      );
    case 'datetime':
      // Format the datetime value for the datetime-local input if it's a valid date
      let formattedDatetime = safeValue;

      // If empty and the field is being actively edited, provide the current datetime as default
      if (!formattedDatetime || formattedDatetime === '') {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        formattedDatetime = `${year}-${month}-${day}T${hours}:${minutes}`;
      } else if (formattedDatetime) {
        try {
          // If it's already a valid ISO string that datetime-local can handle, use it
          if (typeof formattedDatetime === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(formattedDatetime)) {
            // Already in the correct format
          } else {
            // Otherwise try to parse it as a date and format it
            const date = new Date(formattedDatetime);
            if (!isNaN(date.getTime())) {
              // Format as YYYY-MM-DDThh:mm
              formattedDatetime = date.toISOString().slice(0, 16);
            }
          }
        } catch (e) {
          console.error('Error formatting datetime:', e);
        }
      }

      return (
        <Input
          type="datetime-local"
          value={formattedDatetime}
          onChange={(e) => onChange(field, e.target.value)}
          className="h-8 text-xs py-0 w-full"
        />
      );
    case 'image':
      return (
        <div className="flex flex-col gap-2">
          <Input
            type="text"
            value={safeValue}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder="Enter image path"
            className="h-8 text-xs py-0 w-full"
          />
        </div>
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
          value={safeValue}
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
          value={safeValue}
          onChange={(e) => onChange(field, e.target.value)}
          className="text-xs min-h-0 h-8 py-1.5 resize-none w-full"
        />
      );
  }
});

export default FieldInput;
