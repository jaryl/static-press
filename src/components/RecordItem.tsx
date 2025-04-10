
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CollectionRecord, CollectionSchema } from "@/services/collectionService";
import { Edit, Trash2 } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RecordForm } from "@/components/RecordForm";
import { useCollection } from "@/contexts/CollectionContext";

interface RecordItemProps {
  record: CollectionRecord;
  collection: CollectionSchema;
}

export function RecordItem({ record, collection }: RecordItemProps) {
  const { deleteRecord } = useCollection();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteRecord(collection.id, record.id);
  };

  // Format special field types
  const formatFieldValue = (fieldName: string, value: any) => {
    const field = collection.fields.find(f => f.name === fieldName);
    
    if (!field) return String(value);
    
    if (value === undefined || value === null) {
      return <span className="text-gray-400">Empty</span>;
    }
    
    switch (field.type) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        try {
          return new Date(value).toLocaleDateString();
        } catch (e) {
          return value;
        }
      default:
        return String(value);
    }
  };

  return (
    <Card className="overflow-hidden border-gray-200 hover:shadow-sm transition-all duration-200">
      <CardContent className="p-4">
        <div className="grid grid-cols-[1fr_auto] gap-4">
          <div className="space-y-2">
            {collection.fields.map((field) => (
              <div key={field.id} className="grid grid-cols-[120px_1fr] gap-2">
                <div className="text-sm font-medium text-gray-500">{field.name}:</div>
                <div className="text-sm">
                  {formatFieldValue(field.name, record.data[field.name])}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit size={14} className="mr-1" />
              Edit
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-white w-full">
                  <Trash2 size={14} className="mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the record.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
          </DialogHeader>
          <RecordForm 
            collection={collection} 
            initialData={record.data} 
            recordId={record.id} 
            onComplete={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
