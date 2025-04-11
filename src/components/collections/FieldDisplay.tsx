import { memo } from "react";
import { FieldDefinition, CollectionSchema } from "@/services/collectionService";

// Component to format a field value for display
const FieldDisplay = memo(({
  field,
  value,
  collection
}: {
  field: FieldDefinition;
  value: any;
  collection: CollectionSchema;
}) => {
  if (value === undefined || value === null) {
    return <span className="text-gray-400">—</span>;
  }

  switch (field.type) {
    case 'boolean':
      return <>{value ? 'Yes' : 'No'}</>;
    case 'date':
      try {
        return <>{new Date(value).toLocaleDateString()}</>;
      } catch (e) {
        return <>{String(value)}</>;
      }
    default:
      return <>{String(value)}</>;
  }
});

export default FieldDisplay;
