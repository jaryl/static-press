import { memo, useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldDefinition } from "@/services/schemaService";
import { Label } from "@/components/ui/label";
import { MapPin, List, Plus, Trash2, Check, X } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);
  // Local state for dialog inputs
  const [items, setItems] = useState<string[]>([]);
  const [removedIndices, setRemovedIndices] = useState<number[]>([]);
  const [newItem, setNewItem] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [initialEditSetup, setInitialEditSetup] = useState(false);
  const editableRef = useRef<HTMLDivElement | null>(null);

  // Ensure value is an array
  const arrayValue = Array.isArray(value) ? value : [];

  // Function to set dialog state when opening
  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Initialize dialog state with current value
      setItems(Array.isArray(value) ? [...value] : []);
      setRemovedIndices([]);
      setNewItem('');
      setEditingIndex(null);
    }
    setIsOpen(open);
  };

  // Function to add a new item to the array
  const handleAddItem = () => {
    if (newItem.trim() !== '') {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  // Function to remove an item from the array
  const handleRemoveItem = (index: number) => {
    // Mark as removed instead of actually removing
    setRemovedIndices([...removedIndices, index]);
  };

  // Function to restore a removed item
  const handleRestoreItem = (index: number) => {
    setRemovedIndices(removedIndices.filter(i => i !== index));
  };

  // Function to save changes
  const handleSave = () => {
    // Filter out removed items before saving
    const filteredItems = items.filter((_, index) => !removedIndices.includes(index));
    onChange(field, filteredItems);
    setIsOpen(false);
  };

  // Function to start editing an item
  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(items[index]);
    setInitialEditSetup(false); // Reset the flag when starting a new edit
  };

  // Function to save an edited item
  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      // Only update if the value is not empty
      if (editingValue.trim() !== '') {
        const newItems = [...items];
        newItems[editingIndex] = editingValue.trim();
        setItems(newItems);
      }
      setEditingIndex(null);
    }
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  // Effect to set up the initial content and cursor position only once when editing begins
  useEffect(() => {
    if (editingIndex !== null && !initialEditSetup && editableRef.current) {
      const el = editableRef.current;
      el.textContent = editingValue;
      el.focus();

      // Set cursor at the end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);

      // Mark setup as complete
      setInitialEditSetup(true);
    }
  }, [editingIndex, editingValue, initialEditSetup]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs h-8 w-full justify-start font-normal">
          {arrayValue.length > 0 ? (
            <span className="inline-flex items-center gap-1">
              <List className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              {`${arrayValue.length} items`}
            </span>
          ) : (
            "Add Items"
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] md:max-w-[650px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            <DialogTitle>Edit {field.name}</DialogTitle>
          </div>
          <DialogDescription>
            Add or remove items from the list.
          </DialogDescription>
        </DialogHeader>

        {/* Current items list */}
        <div className="max-h-[300px] overflow-y-auto py-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No items added yet</p>
          ) : (
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li
                  key={index}
                  className={`flex items-start justify-between text-sm rounded-md border ${removedIndices.includes(index)
                    ? 'bg-destructive/10 text-muted-foreground line-through'
                    : editingIndex === index
                      ? 'border-primary'
                      : 'border-transparent bg-muted/50'
                    }`}
                >
                  {editingIndex === index ? (
                    <div className="flex-1 flex items-start justify-between pt-2 pb-1.5 px-3">
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className="flex-1 whitespace-pre-wrap break-words outline-none min-h-[1.5rem] pt-0.5"
                        onInput={(e) => setEditingValue(e.currentTarget.textContent || '')}
                        onKeyDown={(e) => {
                          // Only handle specific keys and let the browser handle the rest
                          if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
                            e.preventDefault();
                            handleSaveEdit();
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            e.stopPropagation(); // Prevent the event from bubbling up to the Dialog
                            handleCancelEdit();
                          }
                          // Let all other key combinations pass through for normal editing behavior
                        }}
                        ref={editableRef}
                      />
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 ml-1 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50/50"
                          onClick={handleSaveEdit}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-start justify-between pt-2 pb-1.5 px-3">
                      <div
                        className="whitespace-pre-wrap break-words flex-1 cursor-pointer hover:text-primary min-h-[1.5rem] pt-0.5"
                        onClick={() => !removedIndices.includes(index) && handleStartEdit(index)}
                      >
                        {item}
                      </div>
                      {removedIndices.includes(index) ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 shrink-0 text-xs ml-1"
                          onClick={() => handleRestoreItem(index)}
                        >
                          Restore
                        </Button>
                      ) : (
                        <div className="flex">
                          <div className="flex-1 w-7 h-7"></div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 ml-1 shrink-0 text-muted-foreground hover:text-foreground"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add new item section */}
        <div className="flex items-center gap-2 py-2 border-t border-b">
          <div className="flex-1">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Enter new item"
              disabled={editingIndex !== null}
              className="text-sm w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem();
                }
              }}
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleAddItem}
            disabled={newItem.trim() === '' || editingIndex !== null}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        <DialogFooter className="mt-2 items-center">
          <div className="text-xs text-muted-foreground mr-auto flex items-center">
            {items.length - removedIndices.length} item{items.length - removedIndices.length !== 1 ? 's' : ''}
          </div>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={items.length === 0 || (items.length === removedIndices.length)}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
