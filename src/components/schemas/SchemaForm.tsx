import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collection, Field } from "@/types";
import { useCollection } from "@/contexts/CollectionContext";
import { Lock, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { generateSlug } from "@/lib/utils";
import { SchemaFieldList } from './SchemaFieldList';

interface SchemaFormProps {
  collection: Collection;
}

const FIELD_TYPES: Field['type'][] = ['text', 'number', 'boolean', 'date', 'datetime', 'email', 'url', 'select', 'image', 'array'];

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
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
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
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-sm sm:text-base font-medium flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" />
          Collection Details
        </h2>
        <div className="space-y-4 sm:space-y-5">
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
      <SchemaFieldList
        fields={schema.fields}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onFieldChange={handleFieldChange}
        onRemoveField={handleRemoveField}
        onAddField={handleAddField}
      />

      <div className="flex flex-row justify-end gap-2 pt-3 sm:pt-4">
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
