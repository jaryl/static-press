import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from 'lucide-react';

interface AddItemFormProps {
  newItem: string;
  setNewItem: (value: string) => void;
  onAddItem: () => void;
  disabled: boolean;
}

const AddItemForm: React.FC<AddItemFormProps> = ({
  newItem,
  setNewItem,
  onAddItem,
  disabled
}) => {
  return (
    <div className="flex items-center gap-2 mt-4">
      <div className="flex-1">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Enter new item"
          disabled={disabled}
          className="text-sm w-full"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddItem();
            }
          }}
        />
      </div>
      <Button
        type="button"
        size="sm"
        onClick={onAddItem}
        disabled={newItem.trim() === '' || disabled}
        className="shrink-0"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add
      </Button>
    </div>
  );
};

export default AddItemForm;
