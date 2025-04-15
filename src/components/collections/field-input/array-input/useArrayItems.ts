import { useState } from "react";
import { FieldDefinition } from "@/services/shared/types/schema";

export interface UseArrayItemsProps {
  initialValue: string[];
  field: FieldDefinition;
  onChange: (field: FieldDefinition, value: any) => void;
}

export interface UseArrayItemsReturn {
  items: string[];
  removedIndices: number[];
  editingIndex: number | null;
  editingValue: string;
  newItem: string;
  setNewItem: (value: string) => void;
  setEditingValue: (value: string) => void;
  handleAddItem: () => void;
  handleRemoveItem: (index: number) => void;
  handleRestoreItem: (index: number) => void;
  handleStartEdit: (index: number) => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
  handleSave: () => void;
  resetState: (newValue?: string[]) => void;
}

export const useArrayItems = ({
  initialValue,
  field,
  onChange
}: UseArrayItemsProps): UseArrayItemsReturn => {
  const [items, setItems] = useState<string[]>(initialValue);
  const [removedIndices, setRemovedIndices] = useState<number[]>([]);
  const [newItem, setNewItem] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const resetState = (newValue: string[] = initialValue) => {
    setItems(newValue);
    setRemovedIndices([]);
    setNewItem('');
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleAddItem = () => {
    if (newItem.trim() !== '') {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    setRemovedIndices([...removedIndices, index]);
  };

  const handleRestoreItem = (index: number) => {
    setRemovedIndices(removedIndices.filter(i => i !== index));
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(items[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      if (editingValue.trim() !== '') {
        const newItems = [...items];
        newItems[editingIndex] = editingValue.trim();
        setItems(newItems);
      }
      setEditingIndex(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleSave = () => {
    const filteredItems = items.filter((_, index) => !removedIndices.includes(index));
    onChange(field, filteredItems);
  };

  return {
    items,
    removedIndices,
    editingIndex,
    editingValue,
    newItem,
    setNewItem,
    setEditingValue,
    handleAddItem,
    handleRemoveItem,
    handleRestoreItem,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleSave,
    resetState
  };
};
