import React from 'react';
import { Button } from "@/components/ui/button";
import { List } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrayFieldDisplayProps } from './types';

const ArrayFieldDisplay: React.FC<ArrayFieldDisplayProps> = ({ field, value }) => {
  const arrayValue = Array.isArray(value) ? value : [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group flex items-center gap-1 cursor-pointer">
          <List className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
          <Button
            variant="link"
            className="text-xs text-muted-foreground group-hover:text-foreground p-0 h-auto no-underline hover:no-underline"
          >
            {arrayValue.length} items
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] md:max-w-[650px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            <DialogTitle>{field.name}</DialogTitle>
          </div>
          <DialogDescription>
            {arrayValue.length} items in this list
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[300px] overflow-y-auto py-3">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArrayFieldDisplay;
