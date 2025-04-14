import React from 'react';
import { Button } from "@/components/ui/button";
import { List } from 'lucide-react';
import StandardDialog from "@/components/ui/standard-dialog";
import { ArrayFieldDisplayProps } from './types';

const ArrayFieldDisplay: React.FC<ArrayFieldDisplayProps> = ({ field, value }) => {
  const arrayValue = Array.isArray(value) ? value : [];

  // Create the trigger element
  const trigger = (
    <div className="group flex items-center gap-1 cursor-pointer">
      <List className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
      <Button
        variant="link"
        className="text-xs text-muted-foreground group-hover:text-foreground p-0 h-auto no-underline hover:no-underline"
      >
        {arrayValue.length} items
      </Button>
    </div>
  );

  // Create the footer info element
  const footerInfo = (
    <>{arrayValue.length} {arrayValue.length === 1 ? 'item' : 'items'} in this list</>
  );

  return (
    <StandardDialog
      trigger={trigger}
      title={field.name}
      icon={List}
      footerInfo={footerInfo}
      maxWidth="md"
    >
      {arrayValue.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No items in this list</p>
      ) : (
        <ul className="space-y-2">
          {arrayValue.map((item, index) => (
            <li key={index} className="flex items-start justify-between text-sm rounded-md border border-transparent bg-muted/50 p-3">
              <div className="whitespace-pre-wrap break-words">{item}</div>
            </li>
          ))}
        </ul>
      )}
    </StandardDialog>
  );
};

export default ArrayFieldDisplay;
