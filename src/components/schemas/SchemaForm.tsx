import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collection, Field } from "@/types";
import { useCollection } from "@/contexts/CollectionContext";
import { Card, CardContent } from "@/components/ui/card";
import { Grip, Plus, Trash2, FileJson, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { generateSlug } from "@/lib/utils";

interface SchemaFormProps {
  collection: Collection;
}

const FIELD_TYPES: Field['type'][] = ['text', 'number', 'boolean', 'date', 'datetime', 'email', 'url', 'select', 'image'];

interface SortableFieldProps {
  field: Field;
  index: number;
  onFieldChange: (index: number, field: Partial<Field>) => void;
  onRemoveField: (index: number) => void;
}

const SortableField = ({ field, index, onFieldChange, onRemoveField }: SortableFieldProps) => {
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
    <Card ref={setNodeRef} style={style} className="relative mb-4">
      <CardContent className="p-4">
        <div className="grid grid-cols-[30px_1fr] gap-4">
          <div className="flex items-center">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none"
            >
              <Grip size={18} className="text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-4">
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
                      type: value as Field['type'],
                      ...(field.type === 'select' && value !== 'select' ? { options: undefined } : {})
                    }
                  )}
                >
                  <SelectTrigger id={`field-type-${index}`}>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {renderFieldOptions()}

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`field-required-${index}`}
                checked={field.required}
                onCheckedChange={(checked) => onFieldChange(index, { required: !!checked })}
              />
              <Label
                htmlFor={`field-required-${index}`}
                className="cursor-pointer text-xs"
              >
                Required field
              </Label>
            </div>
          </div>

          <div className="absolute bottom-2 right-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onRemoveField(index)}
            >
              <Trash2 size={16} className="text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function SchemaForm({ collection }: SchemaFormProps) {
  const navigate = useNavigate();
  const { updateCollection } = useCollection();
  const [schema, setSchema] = useState<Collection>({
    ...collection
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSchema((prev) => {
        const oldIndex = prev.fields.findIndex((f) => f.id === active.id);
        const newIndex = prev.fields.findIndex((f) => f.id === over.id);

        return {
          ...prev,
          fields: arrayMove(prev.fields, oldIndex, newIndex),
        };
      });
    }
  };

  const handleNameChange = (value: string) => {
    setSchema({
      ...schema,
      name: value,
      slug: generateSlug(value)
    });
  };

  const handleSlugChange = (value: string) => {
    setSchema({
      ...schema,
      slug: value
    });
  };

  const handleDescriptionChange = (value: string) => {
    setSchema({
      ...schema,
      description: value
    });
  };

  const handleFieldChange = (index: number, field: Partial<Field>) => {
    const updatedFields = [...schema.fields];
    updatedFields[index] = {
      ...updatedFields[index],
      ...field
    };

    setSchema({
      ...schema,
      fields: updatedFields
    });
  };

  const handleAddField = () => {
    const newField: Field = {
      id: `field-${Date.now()}`,
      name: '',
      type: 'text',
      required: false
    };

    setSchema({
      ...schema,
      fields: [...schema.fields, newField]
    });
  };

  const handleRemoveField = (index: number) => {
    const updatedFields = schema.fields.filter((_, i) => i !== index);

    setSchema({
      ...schema,
      fields: updatedFields
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateCollection(schema.id, {
        name: schema.name,
        slug: schema.slug,
        description: schema.description,
        fields: schema.fields.map(field => ({
          ...field,
          required: field.required === true // Ensure required is always a boolean
        }))
      });

      navigate(`/collections/${schema.id}`);
    } catch (error) {
      console.error("Error updating schema:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Collection Details */}
      <div className="space-y-6">
        <h2 className="text-base font-medium">Collection Details</h2>
        <div className="space-y-5">
          <div>
            <Label htmlFor="name" className="text-xs cursor-pointer mb-2 block">Name</Label>
            <Input
              id="name"
              value={schema.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="text-xs"
            />
          </div>
          <div>
            <Label htmlFor="slug" className="text-xs cursor-pointer mb-2 block">Slug (URL identifier)</Label>
            <div className="relative">
              <Input
                id="slug"
                value={schema.slug}
                readOnly
                className="bg-muted text-xs text-muted-foreground rounded-md pl-8 border border-muted-foreground/20"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Auto-generated from name. Cannot be edited.
            </p>
          </div>
          <div>
            <Label htmlFor="description" className="text-xs cursor-pointer mb-2 block">Description</Label>
            <Textarea
              id="description"
              value={schema.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              rows={3}
              className="text-xs"
            />
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium">Fields</h2>
          <Button type="button" variant="outline" size="sm" onClick={handleAddField}>
            <Plus size={16} className="mr-1" />
            Add Field
          </Button>
        </div>

        {schema.fields.length === 0 ? (
          <div className="flex flex-col flex-1 items-center justify-center bg-muted/20 p-8 rounded-lg border border-dashed border-muted">
            <div className="bg-primary/5 p-4 rounded-full mb-5">
              <FileJson className="h-10 w-10 text-primary/60" />
            </div>
            <h3 className="text-lg font-medium mb-2">No fields defined yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Click "Add Field" to define data structure
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToParentElement]}
          >
            <SortableContext
              items={schema.fields.map(field => field.id)}
              strategy={verticalListSortingStrategy}
            >
              {schema.fields.map((field, index) => (
                <SortableField
                  key={field.id}
                  field={field}
                  index={index}
                  onFieldChange={handleFieldChange}
                  onRemoveField={handleRemoveField}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          className="mr-2"
          onClick={() => navigate(`/collections/${schema.id}`)}
        >
          Cancel
        </Button>
        <Button type="submit">Save Schema</Button>
      </div>
    </form>
  );
}
