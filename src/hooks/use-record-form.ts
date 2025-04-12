import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { RecordData, FieldDefinition, CollectionSchema } from "@/services/collectionService";

type RecordFormProps = {
  validateRecord: (data: RecordData, fields: FieldDefinition[]) => string[];
  createRecord: (slug: string, data: RecordData) => Promise<any>;
  updateRecord: (slug: string, recordId: string, data: RecordData) => Promise<any>;
};

export function useRecordForm({ validateRecord, createRecord, updateRecord }: RecordFormProps) {
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [newRecordId, setNewRecordId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RecordData>({});
  const [errors, setErrors] = useState<string[]>([]);

  const startEditing = (recordId: string, initialData: RecordData = {}) => {
    setEditingRecordId(recordId);
    setFormData({ ...initialData });
    setErrors([]);
  };

  const cancelEditing = () => {
    setEditingRecordId(null);
    setNewRecordId(null);
    setErrors([]);
  };

  const createNewRecord = (collection: CollectionSchema) => {
    if (!collection) return;

    const tempId = `new-${uuidv4()}`;
    setNewRecordId(tempId);

    // Initialize with empty values
    const initialData: RecordData = {};
    collection.fields.forEach(field => {
      if (field.type === 'boolean') {
        initialData[field.name] = false;
      } else if (field.type === 'datetime') {
        // Initialize datetime fields with current datetime in the format expected by datetime-local input
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        initialData[field.name] = `${year}-${month}-${day}T${hours}:${minutes}`;
      } else {
        initialData[field.name] = '';
      }
    });

    setFormData(initialData);
  };

  const handleFieldChange = (field: FieldDefinition, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field.name]: value
    }));
    setErrors([]);
  };

  const saveRecord = async (slug: string, collection: CollectionSchema) => {
    if (!collection) return;

    const validationErrors = validateRecord(formData, collection.fields);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return false;
    }

    try {
      if (newRecordId) {
        await createRecord(slug, formData);
        setNewRecordId(null);
      } else if (editingRecordId) {
        await updateRecord(slug, editingRecordId, formData);
        setEditingRecordId(null);
      }
      return true;
    } catch (error) {
      console.error("Error saving record:", error);
      return false;
    }
  };

  return {
    editingRecordId,
    newRecordId,
    formData,
    errors,
    isEditing: !!editingRecordId || !!newRecordId,
    startEditing,
    cancelEditing,
    createNewRecord,
    handleFieldChange,
    saveRecord
  };
}
