import { useState, useEffect } from "react";
import StandardDialog from "@/components/ui/standard-dialog";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink, ImageOff, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { collectionService } from "@/services/backend/collectionService";

interface ImageMetadata {
  width?: number;
  height?: number;
  loaded: boolean;
  error: boolean;
}

interface ImagePreviewProps {
  imagePath: string;
  showMetadata?: boolean;
  loadStrategy?: 'local' | 'remote';
  lazyLoad?: boolean;
}

const ImagePreview = ({
  imagePath,
  showMetadata = true,
  loadStrategy,
  lazyLoad = true
}: ImagePreviewProps) => {
  const [metadata, setMetadata] = useState<ImageMetadata>({
    loaded: false,
    error: false
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const isRemote = collectionService.isRemoteStorage();

  // Extract just the filename and extension from the path
  const getFilenameFromPath = (path: string) => {
    if (!path) return '';
    // Handle both URL and file path formats
    const parts = path.split(/[/\\]/);
    return parts[parts.length - 1];
  };

  const filename = getFilenameFromPath(imagePath);

  // Load the image URL when the component mounts or imagePath changes
  useEffect(() => {
    let isMounted = true;

    const loadImageUrl = async () => {
      if (!imagePath) {
        setImageUrl('');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const url = await collectionService.getImageUrl(imagePath);
        if (isMounted) {
          setImageUrl(url);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading image URL:', error);
        if (isMounted) {
          setImageUrl('');
          setIsLoading(false);
        }
      }
    };

    loadImageUrl();

    return () => {
      isMounted = false;
    };
  }, [imagePath]);

  // Load image metadata only when the dialog is opened or lazyLoad is false
  useEffect(() => {
    if (!imagePath || !imageUrl || (lazyLoad && !dialogOpen) || isLoading) return;

    const img = new Image();
    img.onload = () => {
      setMetadata({
        width: img.width,
        height: img.height,
        loaded: true,
        error: false
      });
    };
    img.onerror = () => {
      setMetadata({
        loaded: false,
        error: true
      });
    };
    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imagePath, imageUrl, dialogOpen, lazyLoad, isLoading]);

  // Create trigger element
  const trigger = (
    <div className="group flex items-center gap-2 cursor-pointer">
      {/* Filename text */}
      <div className="text-xs truncate max-w-[200px] text-muted-foreground group-hover:text-foreground">
        {filename}
        {!lazyLoad && metadata.loaded && showMetadata && (
          <span className="ml-1 text-xs text-muted-foreground group-hover:text-foreground">
            ({metadata.width}×{metadata.height})
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* Eye icon for preview */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground group-hover:text-foreground"
          title="View image"
        >
          <Eye size={14} />
        </Button>
      </div>
    </div>
  );

  // Create custom footer
  const footer = showMetadata ? (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn(
            "px-2 py-0 h-6 text-[10px] rounded-md",
            metadata.error && "text-destructive"
          )}
        >
          {isRemote ? 'REMOTE' : 'LOCAL'}
        </Badge>
        <span
          className={cn("truncate max-w-[300px] text-xs", metadata.error && "text-destructive")}
        >
          {imagePath}
        </span>
        {metadata.loaded && (
          <>
            <span>•</span>
            <span>{metadata.width}×{metadata.height}</span>
          </>
        )}
      </div>
      {!metadata.error && imageUrl && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={() => window.open(imageUrl, '_blank')}
        >
          <ExternalLink size={14} className="mr-1" />
          Open in new tab
        </Button>
      )}
    </div>
  ) : null;

  return (
    <StandardDialog
      trigger={trigger}
      title={filename}
      icon={ImageIcon}
      footer={footer}
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      maxWidth="xl"
      className="p-0 overflow-hidden"
    >
      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center px-6 py-12">
          <div className="bg-muted/20 p-4 rounded-full mb-4 animate-pulse">
            <ImageIcon className="h-10 w-10 text-muted/70" />
          </div>
          <h3 className="text-base font-medium mb-2">Loading image...</h3>
        </div>
      ) : metadata.error || !imageUrl ? (
        /* Error state */
        <div className="flex flex-col items-center justify-center px-6 py-12">
          <div className="bg-destructive/10 p-4 rounded-full mb-4">
            <ImageOff className="h-10 w-10 text-destructive/70" />
          </div>
          <h3 className="text-base font-medium mb-2">Image not found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
            The image could not be loaded. Please check the file path and try again.
          </p>
        </div>
      ) : (
        /* Image display */
        <div className="flex items-center justify-center bg-black/5">
          <img
            src={imageUrl}
            alt={filename}
            className="max-w-full max-h-[60vh] object-contain"
          />
        </div>
      )}
    </StandardDialog>
  );
};

export default ImagePreview;
