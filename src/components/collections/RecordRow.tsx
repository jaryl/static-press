import { memo } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Save, X } from "lucide-react";
import { RecordData, FieldDefinition, CollectionSchema, CollectionRecord } from "@/services/collectionService";
import FieldInput from "./FieldInput";
import FieldDisplay from "./FieldDisplay";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Component for an existing record row
const RecordRow = memo(({
  record,
  collection,
  isEditing,
  formData,
  onFieldChange,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
  disableActions
}: {
  record: CollectionRecord;
  collection: CollectionSchema;
  isEditing: boolean;
  formData: RecordData;
  onFieldChange: (field: FieldDefinition, value: any) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  disableActions: boolean;
}) => {
  return (
    <TableRow className={isEditing ? "bg-primary/5" : undefined}>
      {collection.fields.map((field) => (
        <TableCell key={`${record.id}-${field.id}`} className="text-xs px-4 py-2">
          {isEditing ? (
            <FieldInput
              field={field}
              value={formData[field.name]}
              onChange={onFieldChange}
            />
          ) : (
            <FieldDisplay
              field={field}
              value={record.data[field.name]}
              collection={collection}
            />
          )}
        </TableCell>
      ))}
      <TableCell className="text-right space-x-1 p-2">
        {isEditing ? (
          <>
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
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={onStartEdit}
              className="h-6 w-6 p-0"
              disabled={disableActions}
            >
              <Edit size={14} />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-destructive"
                  disabled={disableActions}
                >
                  <Trash2 size={14} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-base">Delete Record</AlertDialogTitle>
                  <AlertDialogDescription className="text-xs">
                    This action cannot be undone. This will permanently delete this record.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-xs h-7">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive hover:bg-destructive/90 text-xs h-7"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </TableCell>
    </TableRow>
  );
});

export default RecordRow;
