import React from 'react';
import { FieldDisplayProps } from './types';

const BooleanFieldDisplay: React.FC<FieldDisplayProps> = ({ value }) => {
  return <>{value ? 'Yes' : 'No'}</>;
};

export default BooleanFieldDisplay;
