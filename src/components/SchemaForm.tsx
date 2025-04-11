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
import { Grip, Plus, Trash2, FileJson } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToParentElement } from '@dnd-kit/modifiers';

interface SchemaFormProps {
  collection: Collection;
}

const FIELD_TYPES: Field['type'][] = ['text', 'number', 'boolean', 'date', 'email', 'url', 'select'];

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
                <Label htmlFor={`field-name-${index}`} className="cursor-pointer mb-2 block">Field Name</Label>
                <Input
                  id={`field-name-${index}`}
                  value={field.name}
                  onChange={(e) => onFieldChange(index, { name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor={`field-type-${index}`} className="cursor-pointer mb-2 block">Field Type</Label>
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

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`required-${index}`}
                  checked={field.required}
                  onCheckedChange={(checked) =>
                    onFieldChange(index, { required: checked === true })
                  }
                />
                <Label htmlFor={`required-${index}`} className="cursor-pointer">Required field</Label>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => onRemoveField(index)}
              >
                <Trash2 size={18} />
              </Button>
            </div>

            {renderFieldOptions()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function SchemaForm({ collection }: SchemaFormProps) {
  const [schema, setSchema] = useState<Collection>({ ...collection });
  const { updateCollection } = useCollection();
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSchema((schema) => {
        const oldIndex = schema.fields.findIndex((field) => field.id === active.id);
        const newIndex = schema.fields.findIndex((field) => field.id === over.id);

        return {
          ...schema,
          fields: arrayMove(schema.fields, oldIndex, newIndex),
        };
      });
    }
  };

  const handleNameChange = (value: string) => {
    setSchema({
      ...schema,
      name: value
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
    updatedFields[index] = { ...updatedFields[index], ...field };

    setSchema({
      ...schema,
      fields: updatedFields
    });
  };

  const handleAddField = () => {
    const newField: Field = {
      id: `${schema.id}-field-${Date.now()}`,
      name: "",
      type: "text",
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
            <Label htmlFor="name" className="cursor-pointer mb-2 block">Name</Label>
            <Input
              id="name"
              value={schema.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="slug" className="cursor-pointer mb-2 block">Slug (URL identifier)</Label>
            <Input
              id="slug"
              value={schema.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description" className="cursor-pointer mb-2 block">Description</Label>
            <Textarea
              id="description"
              value={schema.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              rows={3}
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
