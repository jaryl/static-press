import React from 'react';
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
  const shouldTruncate = text.length > maxLength;
  const displayText = shouldTruncate ? `${text.substring(0, maxLength)}...` : text;

  if (shouldTruncate) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help">{displayText}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-md break-words">{text}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <span>{text}</span>;
};

export default TruncatedTextWithTooltip;
