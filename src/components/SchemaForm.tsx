
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CollectionSchema, FieldDefinition } from "@/services/collectionService";
import { useCollection } from "@/contexts/CollectionContext";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Grip, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SchemaFormProps {
  collection: CollectionSchema;
}

const FIELD_TYPES = ['text', 'number', 'boolean', 'date', 'email', 'url', 'select'];

export function SchemaForm({ collection }: SchemaFormProps) {
  const [schema, setSchema] = useState<CollectionSchema>({ ...collection });
  const { updateCollection } = useCollection();
  const navigate = useNavigate();

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

  const handleFieldChange = (index: number, field: Partial<FieldDefinition>) => {
    const updatedFields = [...schema.fields];
    updatedFields[index] = { ...updatedFields[index], ...field };
    
    setSchema({
      ...schema,
      fields: updatedFields
    });
  };

  const handleAddField = () => {
    const newField: FieldDefinition = {
      id: `${schema.id}-${Date.now()}`,
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
        fields: schema.fields
      });
      
      navigate(`/collections/${schema.id}`);
    } catch (error) {
      console.error("Error updating schema:", error);
    }
  };

  const renderFieldOptions = (index: number, field: FieldDefinition) => {
    if (field.type === 'select') {
      return (
        <div className="mt-2">
          <Label>Options (comma separated)</Label>
          <Input 
            value={field.options?.join(", ") || ""}
            onChange={(e) => {
              const options = e.target.value.split(",").map(opt => opt.trim()).filter(Boolean);
              handleFieldChange(index, { options });
            }}
            placeholder="Option1, Option2, Option3"
          />
        </div>
      );
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Collection Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Collection Details</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={schema.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug (URL identifier)</Label>
            <Input
              id="slug"
              value={schema.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={schema.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Fields */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Fields</h2>
          <Button type="button" variant="outline" size="sm" onClick={handleAddField}>
            <Plus size={16} className="mr-1" />
            Add Field
          </Button>
        </div>

        {schema.fields.length === 0 ? (
          <div className="text-center py-6 bg-muted/30 rounded-md">
            <p className="text-muted-foreground">No fields defined yet</p>
            <p className="text-sm text-muted-foreground">Click "Add Field" to define data structure</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schema.fields.map((field, index) => (
              <Card key={field.id} className="relative">
                <CardContent className="p-4">
                  <div className="grid grid-cols-[20px_1fr] gap-3">
                    <div className="flex items-center">
                      <Grip size={16} className="text-muted-foreground/50" />
                    </div>
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`field-name-${index}`}>Field Name</Label>
                          <Input
                            id={`field-name-${index}`}
                            value={field.name}
                            onChange={(e) => handleFieldChange(index, { name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`field-type-${index}`}>Field Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) => handleFieldChange(
                              index, 
                              { 
                                type: value as FieldDefinition['type'],
                                // Reset options if changing from select type
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

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`required-${index}`}
                          checked={field.required}
                          onCheckedChange={(checked) => 
                            handleFieldChange(index, { required: checked === true })
                          }
                        />
                        <Label htmlFor={`required-${index}`}>Required field</Label>
                      </div>

                      {renderFieldOptions(index, field)}
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveField(index)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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
