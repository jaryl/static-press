import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { List } from 'lucide-react';
import StandardDialog from "@/components/ui/standard-dialog";
import { FieldInputProps } from "../types";
import ArrayItem from './ArrayItem';
import AddItemForm from './AddItemForm';
import { useArrayItems } from './useArrayItems';

const ArrayInput = ({ field, value, onChange }: FieldInputProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Ensure value is an array
  const arrayValue = Array.isArray(value) ? value : [];

  const {
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
  } = useArrayItems({
    initialValue: arrayValue,
    field,
    onChange
  });

  // Function to set dialog state when opening
  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Initialize dialog state with current value
      resetState(Array.isArray(value) ? [...value] : []);
    }
    setIsOpen(open);
  };

  // Create trigger element
  const trigger = (
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
  );

  // Create footer info
  const footerInfo = (
    <>{items.length - removedIndices.length} {items.length - removedIndices.length !== 1 ? 'items' : 'item'}</>
  );

  // Create footer buttons
  const footer = (
    <>
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button
        type="button"
        onClick={() => {
          handleSave();
          setIsOpen(false);
        }}
        disabled={items.length === 0 || (items.length === removedIndices.length)}
      >
        Save Changes
      </Button>
    </>
  );

  // Create main content
  const content = (
    <>
      {/* List of items */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No items in this list</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li
                key={index}
                className={`rounded-md border ${removedIndices.includes(index)
                  ? 'border-dashed border-destructive/40 bg-destructive/10 text-destructive/80'
                  : 'border-border bg-muted/50'
                  }`}
              >
                <ArrayItem
                  item={item}
                  index={index}
                  isEditing={editingIndex === index}
                  isRemoved={removedIndices.includes(index)}
                  editingValue={editingValue}
                  onStartEdit={handleStartEdit}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onRemove={handleRemoveItem}
                  onRestore={handleRestoreItem}
                  setEditingValue={setEditingValue}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add new item form */}
      <AddItemForm
        newItem={newItem}
        setNewItem={setNewItem}
        onAddItem={handleAddItem}
        disabled={editingIndex !== null}
      />
    </>
  );

  return (
    <StandardDialog
      trigger={trigger}
      title={`Edit ${field.name}`}
      description="Manage the items in this list"
      icon={List}
      footer={footer}
      footerInfo={footerInfo}
      open={isOpen}
      onOpenChange={handleOpenChange}
      maxWidth="md"
    >
      {content}
    </StandardDialog>
  );
};

export default ArrayInput;
