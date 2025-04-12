import { memo } from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: number;
  className?: string;
}

/**
 * Reusable loading spinner component
 */
const Spinner = memo(({ size = 8, className = "text-primary/70" }: SpinnerProps) => {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className={`h-${size} w-${size} animate-spin ${className}`} />
    </div>
  );
});

export { Spinner };
