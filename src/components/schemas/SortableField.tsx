import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FieldDefinition, FieldType } from "@/types";
import { Grip, Trash2 } from "lucide-react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Available field types - consider moving to a shared constants file if used elsewhere
const FIELD_TYPES: FieldType[] = ['text', 'number', 'boolean', 'date', 'datetime', 'email', 'url', 'select', 'image', 'array', 'coordinates'];

export interface SortableFieldProps {
  field: FieldDefinition;
  index: number;
  onFieldChange: (index: number, field: Partial<FieldDefinition>) => void;
  onRemoveField: (index: number) => void;
}

export const SortableField = ({ field, index, onFieldChange, onRemoveField }: SortableFieldProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Helper to render options input for 'select' type
  const renderFieldOptions = () => {
    if (field.type === 'select') {
      return (
        <div className="mt-4">
          <Label htmlFor={`field-options-${index}`} className="cursor-pointer">Options (comma separated)</Label>
          <Input
            id={`field-options-${index}`}
            value={field.options?.join(", ") || ""}
            onChange={(e) => {
              const options = e.target.value.split(",").map(opt => opt.trim()).filter(Boolean);
              onFieldChange(index, { options });
            }}
            placeholder="Option1, Option2, Option3"
            className="mt-1"
          />
        </div>
      );
    }
    return null;
  };

  return (
    <Card ref={setNodeRef} style={style} className="mb-4 group overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Drag Handle Area */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-center px-2 cursor-grab active:cursor-grabbing touch-none bg-muted/20 group-hover:bg-muted/40 transition-colors"
          >
            <Grip size={18} className="text-muted-foreground" />
          </div>

          {/* Field Inputs Area*/}
          <div className="space-y-4 flex-grow p-4">
            {/* Name and Type Inputs */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`field-name-${index}`} className="text-xs cursor-pointer mb-2 block">Field Name</Label>
                <Input
                  id={`field-name-${index}`}
                  value={field.name}
                  onChange={(e) => onFieldChange(index, { name: e.target.value })}
                  required
                  className="text-xs"
                />
              </div>
              <div>
                <Label htmlFor={`field-type-${index}`} className="text-xs cursor-pointer mb-2 block">Field Type</Label>
                <Select
                  value={field.type}
                  onValueChange={(value) => onFieldChange(
                    index,
                    {
                      type: value as FieldType,
                      // Reset specific options if type changes away from select/datetime
                      ...(field.type === 'select' && value !== 'select' ? { options: undefined } : {}),
                      ...(field.type === 'datetime' && value !== 'datetime' ? { timezoneAware: undefined } : {}),
                    }
                  )}
                >
                  <SelectTrigger id={`field-type-${index}`} className="text-xs">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map(type => (
                      <SelectItem key={type} value={type} className="text-xs">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Conditional Options (Select, etc.) */}
            {renderFieldOptions()}

            {/* Checkboxes (Required, Timezone Aware) & Remove Button */}
            <div className="flex items-center justify-between pt-2">
              {/* Group checkboxes */}
              <div className="flex items-center space-x-6">
                {/* Required Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`field-required-${index}`}
                    checked={field.required}
                    onCheckedChange={(checked) => onFieldChange(index, { required: !!checked })}
                  />
                  <Label htmlFor={`field-required-${index}`} className="text-xs cursor-pointer font-normal">
                    Required
                  </Label>
                </div>

                {/* Timezone Aware Checkbox (only for datetime) */}
                {field.type === 'datetime' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`field-timezone-${index}`}
                      checked={field.timezoneAware}
                      onCheckedChange={(checked) => onFieldChange(index, { timezoneAware: !!checked })}
                    />
                    <Label htmlFor={`field-timezone-${index}`} className="text-xs cursor-pointer font-normal">
                      Timezone Aware
                    </Label>
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => onRemoveField(index)}
                title="Remove field"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
