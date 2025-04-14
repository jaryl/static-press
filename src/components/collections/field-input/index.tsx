import React from 'react';
import TextInput from './TextInput';
import NumberInput from './NumberInput';
import DateInput from './DateInput';
import BooleanInput from './BooleanInput';
import SelectInput from './SelectInput';
import ImageInput from './ImageInput';
import CoordinateInput from './CoordinateInput';
import ArrayInput from './ArrayInput';
import { FieldInputProps } from './types';

const FieldInput: React.FC<FieldInputProps> = ({ field, value, onChange }) => {
  const renderInput = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return <TextInput field={field} value={value} onChange={onChange} />;
      case 'number':
        return <NumberInput field={field} value={value} onChange={onChange} />;
      case 'date':
      case 'datetime':
        return <DateInput field={field} value={value} onChange={onChange} />;
      case 'boolean':
        return <BooleanInput field={field} value={value} onChange={onChange} />;
      case 'select':
        return <SelectInput field={field} value={value} onChange={onChange} />;
      case 'image':
        return <ImageInput field={field} value={value} onChange={onChange} />;
      case 'coordinates':
        return <CoordinateInput field={field} value={value} onChange={onChange} />;
      case 'array':
        return <ArrayInput field={field} value={value} onChange={onChange} />;
      default:
        return <div>Unsupported field type: {field.type}</div>;
    }
  };

  return (
    <div>
      {renderInput()}
    </div>
  );
};

export default FieldInput;
