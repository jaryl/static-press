import { memo } from 'react';

interface ErrorDisplayProps {
  title?: string;
  errors: string[];
}

/**
 * Component for displaying validation or other errors in a consistent way
 */
const ErrorDisplay = memo(({ title = "Please fix the following errors:", errors }: ErrorDisplayProps) => {
  if (!errors || errors.length === 0) return null;
  
  return (
    <div className="mx-6 my-3 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
      <p className="font-medium text-xs text-destructive mb-1">{title}</p>
      <ul className="list-disc pl-5 text-xs text-destructive">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
});

export default ErrorDisplay;
