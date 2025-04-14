import React from 'react';
import { format, parseISO } from 'date-fns';
import { DateTimeFieldDisplayProps } from './types';

const DateTimeFieldDisplay: React.FC<DateTimeFieldDisplayProps> = ({ field, value }) => {
  try {
    const date = parseISO(value);
    const formatString = field.timezoneAware ? 'MMM d, yyyy h:mm a z' : 'MMM d, yyyy h:mm a';
    return <>{format(date, formatString)}</>;
  } catch (error) {
    return <span className="text-red-500 text-xs italic">Invalid Date</span>;
  }
};

export default DateTimeFieldDisplay;
