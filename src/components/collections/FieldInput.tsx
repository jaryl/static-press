import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldDefinition } from "@/services/schemaService";

// Props type definition
interface FieldInputProps {
  field: FieldDefinition;
  value: any;
  onChange: (field: FieldDefinition, value: any) => void;
}

// --- Renderer Functions for each Field Type --- //

const renderTextInput = (field: FieldDefinition, value: any, onChange: FieldInputProps['onChange']) => (
  <Input
    type={field.type as 'text' | 'email' | 'url'} // Cast for clarity
    value={value}
    onChange={(e) => onChange(field, e.target.value)}
    className="h-8 text-xs py-0 w-full"
  />
);

const renderNumberInput = (field: FieldDefinition, value: any, onChange: FieldInputProps['onChange']) => (
  <Input
    type="number"
    value={value}
    onChange={(e) => onChange(field, e.target.value ? Number(e.target.value) : '')}
    className="h-8 text-xs py-0 w-full"
  />
);

const renderDateInput = (field: FieldDefinition, value: any, onChange: FieldInputProps['onChange']) => (
  <Input
    type={field.type as 'date' | 'datetime'} // Cast for clarity
    value={value}
    onChange={(e) => onChange(field, e.target.value)}
    className="h-8 text-xs py-0 w-full"
    placeholder={field.type === 'datetime' && field.timezoneAware ? 'YYYY-MM-DDTHH:mm:ssZ' : ''}
  />
);

const renderBooleanInput = (field: FieldDefinition, value: any, onChange: FieldInputProps['onChange']) => (
  <Checkbox
    checked={!!value} // Ensure boolean
    onCheckedChange={(checked) => onChange(field, !!checked)}
    className="mt-1"
  />
);

const renderSelectInput = (field: FieldDefinition, value: any, onChange: FieldInputProps['onChange']) => (
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

const renderImageInput = (field: FieldDefinition, value: any, onChange: FieldInputProps['onChange']) => (
  <Input
    type="text" // Simplifed: Assuming URL input for image for now
    value={value}
    onChange={(e) => onChange(field, e.target.value)}
    placeholder="Enter image URL"
    className="h-8 text-xs py-0 w-full"
  />
  // TODO: Implement a proper file upload or image selection component later
);

const renderArrayInput = (field: FieldDefinition, value: any, onChange: FieldInputProps['onChange']) => {
  // Display array as comma-separated string
  const displayValue = Array.isArray(value) ? value.join(', ') : value;
  return (
    <Textarea
      value={displayValue}
      onChange={(e) => {
        // Parse comma-separated string into an array of strings
        const inputString = e.target.value;
        const parsedArray = inputString.split(',').map(item => item.trim()).filter(item => item !== '');
        onChange(field, parsedArray);
      }}
      placeholder="Enter values separated by commas"
      className="text-xs min-h-0 h-8 py-1.5 resize-none w-full"
    />
  );
};

const renderDefaultInput = (field: FieldDefinition, value: any, onChange: FieldInputProps['onChange']) => (
  // Fallback: Use Textarea for any unhandled or default case
  <Textarea
    value={value}
    onChange={(e) => onChange(field, e.target.value)}
    className="text-xs min-h-0 h-8 py-1.5 resize-none w-full"
  />
);

// --- Type-to-Renderer Map --- //

const fieldTypeRenderers: { [key in FieldDefinition['type'] | 'default']: (field: FieldDefinition, value: any, onChange: FieldInputProps['onChange']) => JSX.Element } = {
  'text': renderTextInput,
  'email': renderTextInput,
  'url': renderTextInput,
  'number': renderNumberInput,
  'date': renderDateInput,
  'datetime': renderDateInput,
  'boolean': renderBooleanInput,
  'select': renderSelectInput,
  'image': renderImageInput,
  'array': renderArrayInput,
  'default': renderDefaultInput // Fallback renderer
};

// --- Main Component --- //

const FieldInput = memo(({ field, value, onChange }: FieldInputProps) => {
  const safeValue = value !== undefined && value !== null ? value : '';

  // Select the appropriate renderer based on field type, or use default
  const renderer = fieldTypeRenderers[field.type] || fieldTypeRenderers.default;

  // Render the input using the selected renderer function
  return renderer(field, safeValue, onChange);
});

export default FieldInput;
