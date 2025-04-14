import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter, // Import DialogFooter
} from "@/components/ui/dialog";

interface DataDisplayModalProps {
  trigger: React.ReactNode; // The element that opens the modal
  title: string;            // Title for the modal header
  content: string;          // The full content to display
}

const DataDisplayModal: React.FC<DataDisplayModalProps> = ({
  trigger,
  title,
  content
}) => {
  // Ensure content is a string before counting
  const safeContent = String(content || '');

  // Calculate counts
  const characterCount = safeContent.length;
  // Simple word count: split by whitespace, filter empty strings
  const wordCount = safeContent.trim().split(/\s+/).filter(Boolean).length;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <blockquote className="border-l-4 pl-4 text-sm whitespace-pre-wrap break-words text-foreground">
            {safeContent}
          </blockquote>
        </div>

        <DialogFooter className="border-t pt-3 mt-2">
          <div className="text-xs text-muted-foreground">
            <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
            <span className="mx-2">•</span>
            <span>{characterCount} {characterCount === 1 ? 'character' : 'characters'}</span>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DataDisplayModal;
