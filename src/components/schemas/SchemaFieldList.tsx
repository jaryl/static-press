import React from 'react';
import { Button } from '@/components/ui/button';
import { ListChecks, Plus } from 'lucide-react';
import { Field } from '@/types';
import { DndContext, closestCenter, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { SortableField } from './SortableField'; // Assuming SortableField is in the same directory

// --- SchemaFieldList Component --- //

export interface SchemaFieldListProps {
  fields: Field[];
  sensors: ReturnType<typeof useSensors>; // Use the actual type from useSensors
  onDragEnd: (event: DragEndEvent) => void;
  onFieldChange: (index: number, field: Partial<Field>) => void;
  onRemoveField: (index: number) => void;
  onAddField: () => void;
}

export const SchemaFieldList: React.FC<SchemaFieldListProps> = ({ fields, sensors, onDragEnd, onFieldChange, onRemoveField, onAddField }) => {
  return (
    <div className="space-y-4 mt-6 border-t pt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <ListChecks size={20} className="mr-2 text-primary" />
          Fields
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddField}
        >
          <Plus size={16} className="mr-1" />
          Add Field
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-muted-foreground italic text-center py-4">No fields defined yet. Add one above.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          modifiers={[restrictToParentElement]}
        >
          <SortableContext
            items={fields.map(field => field.id)}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field, index) => (
              <SortableField
                key={field.id}
                field={field}
                index={index}
                onFieldChange={onFieldChange}
                onRemoveField={onRemoveField}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
