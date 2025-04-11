import { memo } from 'react';

interface LoaderProps {
  size?: number;
  className?: string;
}

/**
 * Reusable loading spinner component
 */
const Loader = memo(({ size = 8, className = "text-primary/70" }: LoaderProps) => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className={`h-${size} w-${size} animate-spin ${className}`} />
    </div>
  );
});

export default Loader;
