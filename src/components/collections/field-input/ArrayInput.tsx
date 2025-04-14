import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { List, Plus, Trash2, Check, X } from 'lucide-react';
import StandardDialog from "@/components/ui/standard-dialog";
import { FieldInputProps } from "./types";

const ArrayInput = ({ field, value, onChange }: FieldInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // Local state for dialog inputs
  const [items, setItems] = useState<string[]>([]);
  const [removedIndices, setRemovedIndices] = useState<number[]>([]);
  const [newItem, setNewItem] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [initialEditSetup, setInitialEditSetup] = useState(false);
  const editableRef = useRef<HTMLDivElement | null>(null);

  // Ensure value is an array
  const arrayValue = Array.isArray(value) ? value : [];

  // Function to set dialog state when opening
  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Initialize dialog state with current value
      setItems(Array.isArray(value) ? [...value] : []);
      setRemovedIndices([]);
      setNewItem('');
      setEditingIndex(null);
    }
    setIsOpen(open);
  };

  // Function to add a new item to the array
  const handleAddItem = () => {
    if (newItem.trim() !== '') {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  // Function to remove an item from the array
  const handleRemoveItem = (index: number) => {
    // Mark as removed instead of actually removing
    setRemovedIndices([...removedIndices, index]);
  };

  // Function to restore a removed item
  const handleRestoreItem = (index: number) => {
    setRemovedIndices(removedIndices.filter(i => i !== index));
  };

  // Function to save changes
  const handleSave = () => {
    // Filter out removed items before saving
    const filteredItems = items.filter((_, index) => !removedIndices.includes(index));
    onChange(field, filteredItems);
    setIsOpen(false);
  };

  // Function to start editing an item
  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(items[index]);
    setInitialEditSetup(false); // Reset the flag when starting a new edit
  };

  // Function to save an edited item
  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      // Only update if the value is not empty
      if (editingValue.trim() !== '') {
        const newItems = [...items];
        newItems[editingIndex] = editingValue.trim();
        setItems(newItems);
      }
      setEditingIndex(null);
    }
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  // Effect to set up the initial content and cursor position only once when editing begins
  useEffect(() => {
    if (editingIndex !== null && !initialEditSetup && editableRef.current) {
      const el = editableRef.current;
      el.textContent = editingValue;
      el.focus();

      // Set cursor at the end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);

      // Mark setup as complete
      setInitialEditSetup(true);
    }
  }, [editingIndex, editingValue, initialEditSetup]);

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
        onClick={handleSave}
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
                    ? 'border-dashed border-muted-foreground/30 bg-muted/30'
                    : 'border-border bg-muted/50'
                  }`}
              >
                {editingIndex === index ? (
                  <div className="flex items-center justify-between p-2">
                    <div
                      ref={editingIndex === index ? editableRef : undefined}
                      contentEditable={true}
                      className="flex-1 text-sm px-2 py-1.5 rounded-md border border-input focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      onInput={(e) => setEditingValue(e.currentTarget.textContent || '')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSaveEdit();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          handleCancelEdit();
                        }
                      }}
                    ></div>
                    <div className="flex ml-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 ml-1 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50/50"
                        onClick={handleSaveEdit}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-start justify-between pt-2 pb-1.5 px-3">
                    <div
                      className="whitespace-pre-wrap break-words flex-1 cursor-pointer hover:text-primary min-h-[1.5rem] pt-0.5"
                      onClick={() => !removedIndices.includes(index) && handleStartEdit(index)}
                    >
                      {item}
                    </div>
                    {removedIndices.includes(index) ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 shrink-0 text-xs ml-1"
                        onClick={() => handleRestoreItem(index)}
                      >
                        Restore
                      </Button>
                    ) : (
                      <div className="flex">
                        <div className="flex-1 w-7 h-7"></div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 ml-1 shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add new item section */}
      <div className="flex items-center gap-2 mt-4">
        <div className="flex-1">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Enter new item"
            disabled={editingIndex !== null}
            className="text-sm w-full"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddItem();
              }
            }}
          />
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleAddItem}
          disabled={newItem.trim() === '' || editingIndex !== null}
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
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
