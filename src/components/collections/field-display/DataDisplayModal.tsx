import React from 'react';
import StandardDialog from "@/components/ui/standard-dialog";
import { Maximize2 } from "lucide-react";

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

  // Create the footer info element
  const footerInfo = (
    <>
      <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
      <span className="mx-2">•</span>
      <span>{characterCount} {characterCount === 1 ? 'character' : 'characters'}</span>
    </>
  );

  return (
    <StandardDialog
      trigger={trigger}
      title={title}
      icon={Maximize2}
      footerInfo={footerInfo}
      maxWidth="lg"
      className="max-h-[80vh] flex flex-col"
    >
      <blockquote className="border-l-4 pl-4 text-sm whitespace-pre-wrap break-words text-foreground">
        {safeContent}
      </blockquote>

    </StandardDialog>
  );
};

export default DataDisplayModal;
