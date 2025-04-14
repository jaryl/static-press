import React from 'react';
import DataDisplayModal from './DataDisplayModal';
import { Button } from '@/components/ui/button';
import { Maximize2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TruncatedTextWithTooltipProps {
  text: string;
  maxLength?: number;
}

const TruncatedTextWithTooltip: React.FC<TruncatedTextWithTooltipProps> = ({
  text,
  maxLength = 100
}) => {
  if (typeof text !== 'string') {
    return <span>{String(text)}</span>;
  }

  const shouldShowModal = text.length > maxLength;
  const displayText = shouldShowModal ? `${text.substring(0, maxLength)}...` : text;

  if (shouldShowModal) {
    return (
      <div className="flex items-center justify-between gap-1 w-full">
        <span className="truncate flex-grow min-w-0">{displayText}</span>

        <div className="flex-shrink-0">
          <DataDisplayModal
            title="Full Text"
            content={text}
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                title="View full text"
              >
                <Maximize2 size={14} />
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="truncate flex-grow min-w-0 cursor-help">{displayText}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="break-words">{text}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default TruncatedTextWithTooltip;
