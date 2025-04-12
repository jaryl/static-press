import {
  RecordData,
  FieldDefinition
} from '../services/collectionService';

/**
 * Validates record data against field definitions
 * @param data The record data to validate
 * @param fields The field definitions to validate against
 * @returns Array of validation error messages
 */
export const validateRecord = (data: RecordData, fields: FieldDefinition[]): string[] => {
  const errors: string[] = [];

  fields.forEach(field => {
    // Check required fields
    if (field.required && (data[field.name] === undefined || data[field.name] === null || data[field.name] === '')) {
      errors.push(`${field.name} is required`);
      return;
    }

    // Skip validation if value is empty and not required
    if (data[field.name] === undefined || data[field.name] === null || data[field.name] === '') {
      return;
    }

    // Type validations
    switch (field.type) {
      case 'number':
        if (isNaN(Number(data[field.name]))) {
          errors.push(`${field.name} must be a number`);
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(data[field.name]))) {
          errors.push(`${field.name} must be a valid email`);
        }
        break;
      case 'url':
        try {
          new URL(String(data[field.name]));
        } catch (e) {
          errors.push(`${field.name} must be a valid URL`);
        }
        break;
      case 'date':
        const date = new Date(data[field.name]);
        if (isNaN(date.getTime())) {
          errors.push(`${field.name} must be a valid date`);
        }
        break;
      case 'select':
        if (field.options && !field.options.includes(String(data[field.name]))) {
          errors.push(`${field.name} must be one of the available options`);
        }
        break;
    }
  });

  return errors;
};
