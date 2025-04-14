import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, Check, X, RotateCcw } from 'lucide-react';

interface ArrayItemProps {
  item: string;
  index: number;
  isEditing: boolean;
  isRemoved: boolean;
  editingValue: string;
  onStartEdit: (index: number) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemove: (index: number) => void;
  onRestore: (index: number) => void;
  setEditingValue: (value: string) => void;
}

const ArrayItem: React.FC<ArrayItemProps> = ({
  item,
  index,
  isEditing,
  isRemoved,
  editingValue,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemove,
  onRestore,
  setEditingValue
}) => {
  const editableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.textContent = editingValue;

      // Focus and set cursor at the end
      editableRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editableRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing, editingValue]);

  return (
    <div className={`flex-1 flex items-start justify-between pt-2 pb-1.5 pl-3 pr-2 ${isEditing ? 'border border-primary rounded-md bg-background outline-none' : 'border border-muted-foreground/10'}`}>
      <div
        ref={editableRef}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        className={`whitespace-pre-wrap break-words flex-1 min-h-[1.5rem] pt-0.5 ${isEditing
          ? 'outline-none'
          : isRemoved
            ? 'line-through cursor-default'
            : 'hover:text-primary cursor-pointer'
          }`}
        onClick={() => !isEditing && !isRemoved && onStartEdit(index)}
        onInput={isEditing ? (e) => setEditingValue(e.currentTarget.textContent || '') : undefined}
        onKeyDown={isEditing ? (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSaveEdit();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            onCancelEdit();
          }
        } : undefined}
      >
        {!isEditing ? item : null}
      </div>

      <div className="flex ml-2 shrink-0">
        {isEditing ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              onClick={onCancelEdit}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50/50"
              onClick={onSaveEdit}
            >
              <Check className="h-4 w-4" />
            </Button>
          </>
        ) : isRemoved ? (
          <>
            <div className="w-7"></div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onRestore(index)}
              title="Restore item"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <div className="w-7"></div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => onRemove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ArrayItem;
