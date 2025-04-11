
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CollectionSchema, FieldDefinition, RecordData } from "@/services/collectionService";
import { useCollection } from "@/contexts/CollectionContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface RecordFormProps {
  collection: CollectionSchema;
  initialData?: RecordData;
  recordId?: string;
  onComplete?: () => void;
}

export function RecordForm({ collection, initialData = {}, recordId, onComplete }: RecordFormProps) {
  const [formData, setFormData] = useState<RecordData>(initialData);
  const [errors, setErrors] = useState<string[]>([]);
  const { createRecord, updateRecord, validateRecord } = useCollection();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the record
    const validationErrors = validateRecord(formData, collection.fields);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (recordId) {
        await updateRecord(collection.id, recordId, formData);
      } else {
        await createRecord(collection.id, formData);
      }
      onComplete?.();
    } catch (error) {
      console.error("Error saving record:", error);
    }
  };

  const handleChange = (field: FieldDefinition, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field.name]: value
    }));

    // Clear errors when user inputs new data
    setErrors([]);
  };

  const renderFieldInput = (field: FieldDefinition) => {
    const value = formData[field.name] !== undefined ? formData[field.name] : '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            id={field.id}
            type={field.type}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
          />
        );
      case 'number':
        return (
          <Input
            id={field.id}
            type="number"
            value={value}
            onChange={(e) => handleChange(field, e.target.value ? Number(e.target.value) : null)}
          />
        );
      case 'date':
        return (
          <Input
            id={field.id}
            type="date"
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
          />
        );
      case 'boolean':
        return (
          <Checkbox
            id={field.id}
            checked={!!value}
            onCheckedChange={(checked) => handleChange(field, checked)}
          />
        );
      case 'select':
        return (
          <Select
            value={value ? String(value) : undefined}
            onValueChange={(value) => handleChange(field, value)}
          >
            <SelectTrigger id={field.id}>
              <SelectValue placeholder="Select an option" />
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
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc pl-4">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {collection.fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id} className="flex items-center">
            {field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {renderFieldInput(field)}
        </div>
      ))}

      <div className="flex justify-end pt-4">
        {onComplete && (
          <Button type="button" variant="outline" onClick={onComplete} className="mr-2">
            Cancel
          </Button>
        )}
        <Button type="submit">
          {recordId ? 'Update' : 'Create'} Record
        </Button>
      </div>
    </form>
  );
}
