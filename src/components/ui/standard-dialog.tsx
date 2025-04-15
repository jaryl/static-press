import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LucideIcon } from 'lucide-react';

interface StandardDialogProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  icon?: LucideIcon;
  footer?: React.ReactNode;
  footerInfo?: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * StandardDialog - A consistent dialog component with standardized styling
 *
 * @param trigger - Element that triggers the dialog
 * @param title - Dialog title
 * @param description - Optional description text
 * @param icon - Optional Lucide icon component to display next to the title
 * @param footer - Optional footer content (typically buttons)
 * @param footerInfo - Optional informational text to display in the footer (left side)
 * @param children - Main dialog content
 * @param open - Optional controlled open state
 * @param onOpenChange - Optional callback for open state changes
 * @param maxWidth - Optional max width setting (sm, md, lg, xl)
 * @param className - Optional additional classes for the dialog content
 */
const StandardDialog: React.FC<StandardDialogProps> = ({
  trigger,
  title,
  description,
  icon: Icon,
  footer,
  footerInfo,
  children,
  open,
  onOpenChange,
  maxWidth = 'md',
  className,
}) => {
  // Determine max width class based on the prop
  const maxWidthClass = {
    sm: 'sm:max-w-[425px]',
    md: 'sm:max-w-[550px] md:max-w-[650px]',
    lg: 'sm:max-w-[600px] md:max-w-[700px]',
    xl: 'sm:max-w-[700px] md:max-w-[900px]',
  }[maxWidth];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={`${maxWidthClass} ${className || ''}`}>
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2 text-left">
            {Icon && <Icon className="h-4 w-4 text-primary" />}
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-left">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="max-h-[calc(80vh-180px)] overflow-y-auto py-3 px-5">
          {children}
        </div>

        {(footer || footerInfo) && (
          <DialogFooter className="border-t flex-row items-center py-4 px-5">
            {footerInfo && (
              <div className="text-xs text-muted-foreground mr-auto flex items-center min-h-[28px] w-full">
                {footerInfo}
              </div>
            )}
            <div className="flex justify-end gap-2 items-center w-full">
              {footer}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StandardDialog;
