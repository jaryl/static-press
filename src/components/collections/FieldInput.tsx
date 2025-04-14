import { memo, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldDefinition } from "@/services/schemaService";
import { Label } from "@/components/ui/label";
import { MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Props type definition
interface FieldInputProps {
  field: FieldDefinition;
  value: any;
  onChange: (field: FieldDefinition, value: any) => void;
}

// --- Renderer Functions for each Field Type --- //

const renderTextInput = (field: FieldDefinition, value: any, onChange: FieldInputProps['onChange']) => (
  <Input
    type={field.type as 'text' | 'email' | 'url'}
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
    type={field.type as 'date' | 'datetime'}
    value={value}
    onChange={(e) => onChange(field, e.target.value)}
    className="h-8 text-xs py-0 w-full"
    placeholder={field.type === 'datetime' && field.timezoneAware ? 'YYYY-MM-DDTHH:mm:ssZ' : ''}
  />
);

const renderBooleanInput = (field: FieldDefinition, value: any, onChange: FieldInputProps['onChange']) => (
  <Checkbox
    checked={!!value}
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
    type="text"
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

const renderCoordinateInput = (field: FieldDefinition, value: any, onChange: FieldInputProps['onChange']) => {
  const [isOpen, setIsOpen] = useState(false);
  // Local state for dialog inputs
  const [tempLat, setTempLat] = useState('');
  const [tempLng, setTempLng] = useState('');

  // Ensure value is an object, default to empty lat/lng if not
  const coordinate = typeof value === 'object' && value !== null ? value : { lat: '', lng: '' };
  const lat = coordinate.lat ?? '';
  const lng = coordinate.lng ?? '';

  // Function to set dialog state when opening
  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Initialize dialog state with current value
      setTempLat(String(lat));
      setTempLng(String(lng));
    }
    setIsOpen(open);
  };

  const handleSave = () => {
    const parsedLat = parseFloat(tempLat);
    const parsedLng = parseFloat(tempLng);

    // Basic validation: check if both are valid numbers
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      onChange(field, { lat: parsedLat, lng: parsedLng });
      setIsOpen(false);
    } else {
      // Handle invalid input - maybe show an error message?
      // For now, just don't save or close
      console.error("Invalid latitude or longitude input");
      // Alternatively, save null or the original value if inputs are cleared/invalid?
      // If inputs are empty strings, maybe save null?
      if (tempLat.trim() === '' && tempLng.trim() === '') {
        onChange(field, null);
        setIsOpen(false);
      } else {
        // TODO: Add user feedback for invalid numbers
        alert("Please enter valid numbers for Latitude and Longitude.");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs h-8 w-full justify-start font-normal">
          {lat !== '' && lng !== '' ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              {`${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`}
            </span>
          ) : (
            "Set Coordinates"
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Coordinates</DialogTitle>
          <DialogDescription>
            Enter the latitude and longitude values.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          <Label htmlFor={`${field.id}-lat-dialog`} className="text-xs">
            Latitude
          </Label>
          <Input
            id={`${field.id}-lat-dialog`}
            type="number"
            step="any"
            value={tempLat} onChange={(e) => setTempLat(e.target.value)}
            placeholder="e.g., 40.7128"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${field.id}-lng-dialog`} className="text-xs">
            Longitude
          </Label>
          <Input
            id={`${field.id}-lng-dialog`}
            type="number"
            step="any"
            value={tempLng} onChange={(e) => setTempLng(e.target.value)}
            placeholder="e.g., -74.0060"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="button" onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  'coordinates': renderCoordinateInput,
  'default': renderDefaultInput
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
