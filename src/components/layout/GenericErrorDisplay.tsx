import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface GenericErrorDisplayProps {
    title: string;
    description?: React.ReactNode;
    errorMessage: string;
    actionButtonLabel?: string;
    // Pass the Lucide icon component itself as a prop
    ActionButtonIcon?: React.ElementType;
    onActionClick?: () => void;
    // Allow passing additional classes for the container, e.g., for height
    containerClassName?: string;
}

/**
 * A generic component for displaying centered error messages with an icon,
 * description, details, and an optional action button.
 */
export const GenericErrorDisplay: React.FC<GenericErrorDisplayProps> = ({
    title,
    description,
    errorMessage,
    actionButtonLabel,
    ActionButtonIcon = ArrowLeft, // Default to Back icon
    onActionClick,
    containerClassName = "w-full" // Default width, height determined by parent
}) => {
    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center ${containerClassName}`}>
            <div className="bg-destructive/10 p-4 rounded-lg mb-4 inline-flex">
                <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                    {description}
                </p>
            )}
            <p className="text-xs text-destructive mb-6 max-w-md font-mono bg-muted p-2 rounded overflow-auto">
                {errorMessage}
            </p>
            {onActionClick && actionButtonLabel && (
                <Button
                    onClick={onActionClick}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <ActionButtonIcon className="h-4 w-4" />
                    {actionButtonLabel}
                </Button>
            )}
        </div>
    );
};
