import React from 'react';
import { format, parseISO } from 'date-fns';
import { DateFieldDisplayProps } from './types';

const DateFieldDisplay: React.FC<DateFieldDisplayProps> = ({ value }) => {
  try {
    const date = parseISO(value);
    return <>{format(date, 'MMM d, yyyy')}</>;
  } catch (error) {
    return <span className="text-red-500 text-xs italic">Invalid Date</span>;
  }
};

export default DateFieldDisplay;
