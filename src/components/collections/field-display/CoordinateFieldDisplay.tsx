import React from 'react';
import { MapPin } from 'lucide-react';
import { CoordinateFieldDisplayProps } from './types';

const CoordinateFieldDisplay: React.FC<CoordinateFieldDisplayProps> = ({ value }) => {
  // Check if value is a valid coordinate object with lat and lng properties
  if (value && typeof value === 'object' && 'lat' in value && 'lng' in value &&
    typeof value.lat === 'number' && typeof value.lng === 'number') {
    return (
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${value.lat},${value.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
      >
        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
        {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
      </a>
    );
  }

  // Handle null or undefined value gracefully
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground text-xs italic">N/A</span>;
  }

  // Invalid or empty format
  return <span className="text-red-500 text-xs italic">Invalid Coordinates</span>;
};

export default CoordinateFieldDisplay;
