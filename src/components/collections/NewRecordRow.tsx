import { memo } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { FieldDefinition, CollectionSchema } from "@/services/shared/types/schema";
import { RecordData } from "@/services/shared/types/collection";
import FieldInput from "./field-input";

// Component for a new record row
const NewRecordRow = memo(({
  collection,
  formData,
  onFieldChange,
  onSave,
  onCancel
}: {
  collection: CollectionSchema;
  formData: RecordData;
  onFieldChange: (field: FieldDefinition, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
}) => {
  return (
    <TableRow className="bg-secondary">
      {collection.fields.map((field) => (
        <TableCell key={`new-${field.id}`} className="text-xs p-2">
          <FieldInput
            field={field}
            value={formData[field.name]}
            onChange={onFieldChange}
          />
        </TableCell>
      ))}
      <TableCell className="text-right space-x-1 p-2 sticky right-0 z-10 bg-secondary">
        <Button
          size="sm"
          variant="ghost"
          onClick={onSave}
          className="h-6 w-6 p-0 text-primary hover:text-primary"
        >
          <Save size={14} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="h-6 w-6 p-0 text-muted-foreground"
        >
          <X size={14} />
        </Button>
      </TableCell>
    </TableRow>
  );
});

export default NewRecordRow;
