import { memo } from "react";
import { FieldDefinition } from "@/services/collectionService";

// Component to format a field value for display
const FieldDisplay = memo(({
  field,
  value,
}: {
  field: FieldDefinition;
  value: any;
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
    case 'datetime':
      try {
        const date = new Date(value);
        return <>{date.toLocaleDateString()} {date.toLocaleTimeString()}</>;
      } catch (e) {
        return <>{String(value)}</>;
      }
    default:
      return <>{String(value)}</>;
  }
});

export default FieldDisplay;
