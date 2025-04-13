import { memo, useState, useRef, useEffect } from "react";
import { FieldDefinition } from "@/services/schemaService";
import ImagePreview from "./ImagePreview";
import { getImageLoadStrategy } from "@/lib/utils";
import { List } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Helper component for truncated text with tooltip
const TruncatedTextWithTooltip = ({ text, className }: { text: string, className?: string }) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const checkTruncation = () => {
      const element = textRef.current;
      if (element) {
        setIsTruncated(element.scrollWidth > element.clientWidth);
      }
    };

    // Check initially and on resize
    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [text]); // Re-check if text changes

  const content = (
    <span ref={textRef} className={cn("block truncate", className)}>
      {text}
    </span>
  );

  if (isTruncated) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs break-words">{text}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

// Component to format a field value for display
const FieldDisplay = memo(({
  field,
  value,
}: {
  field: FieldDefinition;
  value: any;
}) => {
  const loadStrategy = getImageLoadStrategy();

  if (value === undefined || value === null) {
    return <span className="text-gray-400">—</span>;
  }

  switch (field.type) {
    case 'boolean':
      return <>{value ? 'Yes' : 'No'}</>;
    case 'date':
      try {
        return <>{new Date(value).toLocaleDateString()}</>;
      } catch (e) {
        return <>{String(value)}</>;
      }
    case 'datetime':
      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) throw new Error('Invalid Date');

        // Check if timezone aware
        if (field.timezoneAware) {
          return <>{date.toLocaleString()}</>; // Display in user's local timezone
        } else {
          // Format as YYYY-MM-DD HH:mm (local time based on input string)
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return <>{`${year}-${month}-${day} ${hours}:${minutes}`}</>;
        }
      } catch (error) {
        return <span className="text-red-500">Invalid Datetime</span>;
      }
    case 'image':
      return <ImagePreview imagePath={String(value)} showMetadata={true} loadStrategy={loadStrategy} lazyLoad={true} />;
    case 'array':
      if (Array.isArray(value) && value.length > 0) {
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="p-0 h-auto text-xs font-normal text-muted-foreground hover:text-foreground hover:no-underline">
                <List size={14} className="mr-1 inline-block" />
                ({value.length} items)
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-0">
              {/* Header */}
              <div className="bg-primary p-3 text-primary-foreground flex items-center gap-2">
                <List size={16} />
                <h3 className="font-bold text-sm truncate">Items for '{field.name}'</h3>
              </div>

              {/* Content Area */}
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {Array.isArray(value) && value.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {value.map((item, index) => (
                      <li key={index}>{String(item)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No items in this array.</p>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t text-xs text-muted-foreground">
                Total: {Array.isArray(value) ? value.length : 0} items
              </div>
            </DialogContent>
          </Dialog>
        );
      }
      // Fallback for empty array or non-array value
      return <span className="text-gray-400">—</span>;
    default:
      // Use the helper component for default text display
      return <TruncatedTextWithTooltip text={String(value)} />;
  }
});

export default FieldDisplay;
