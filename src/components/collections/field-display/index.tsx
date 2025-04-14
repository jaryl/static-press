import { memo } from 'react';
import BooleanFieldDisplay from './BooleanFieldDisplay';
import DateFieldDisplay from './DateFieldDisplay';
import DateTimeFieldDisplay from './DateTimeFieldDisplay';
import ImageFieldDisplay from './ImageFieldDisplay';
import CoordinateFieldDisplay from './CoordinateFieldDisplay';
import ArrayFieldDisplay from './ArrayFieldDisplay';
import TruncatedTextWithTooltip from './TruncatedTextWithTooltip';
import { FieldDisplayProps } from './types';

const FieldDisplay = memo(({ field, value }: FieldDisplayProps) => {
  if (value === undefined || value === null) {
    return <span className="text-gray-400">—</span>;
  }

  switch (field.type) {
    case 'boolean':
      return <BooleanFieldDisplay field={field} value={value} />;
    case 'date':
      return <DateFieldDisplay value={value} />;
    case 'datetime':
      return <DateTimeFieldDisplay field={field} value={value} />;
    case 'image':
      return <ImageFieldDisplay
        imagePath={String(value)}
        showMetadata={true}
        lazyLoad={true}
      />;
    case 'array':
      return <ArrayFieldDisplay field={field} value={value} />;
    case 'coordinates':
      return <CoordinateFieldDisplay value={value} />;
    default:
      return <TruncatedTextWithTooltip text={String(value)} />;
  }
});

FieldDisplay.displayName = 'FieldDisplay';

export default FieldDisplay;
