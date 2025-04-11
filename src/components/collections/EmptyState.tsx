import { memo } from "react";
import { Button } from "@/components/ui/button";
import { FileJson, Plus } from "lucide-react";

interface EmptyStateProps {
  collectionName?: string;
  onCreateRecord: () => void;
}

/**
 * Empty state component displayed when a collection has no records
 */
const EmptyState = memo(({ collectionName, onCreateRecord }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center bg-muted/20 p-12 m-6 rounded-lg border border-dashed border-muted">
      <div className="bg-primary/5 p-4 rounded-full mb-5">
        <FileJson className="h-10 w-10 text-primary/60" />
      </div>
      <h3 className="text-lg font-medium mb-2">No records yet</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
        {collectionName ? `${collectionName} doesn't have any records yet.` : 'This collection is empty.'} Create your first record to start collecting data.
      </p>
      <Button onClick={onCreateRecord} className="flex items-center">
        <Plus className="mr-2 h-4 w-4" />
        Create your first record
      </Button>
    </div>
  );
});

export default EmptyState;
