import { memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus } from "lucide-react";

interface CollectionHeaderProps {
  id: string;
  name: string;
  recordCount: number;
  hasRecords: boolean;
  isCreating: boolean;
  onCreateRecord: () => void;
}

const CollectionHeader = memo(({
  id,
  name,
  recordCount,
  hasRecords,
  isCreating,
  onCreateRecord
}: CollectionHeaderProps) => {
  return (
    <div className="page-header">
      <div className="flex items-center gap-4">
        <h1 className="text-base font-medium">{name}</h1>
        <Badge variant="outline" className="text-[10px] h-6">
          {recordCount} {recordCount === 1 ? 'record' : 'records'}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Link to={`/schema/${id}`}>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Edit className="mr-1 h-3.5 w-3.5" />
            Schema
          </Button>
        </Link>

        {hasRecords && (
          <Button
            size="sm"
            onClick={onCreateRecord}
            className="h-8 text-xs"
            disabled={isCreating}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            New Record
          </Button>
        )}
      </div>
    </div>
  );
});

export default CollectionHeader;
