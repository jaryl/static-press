import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink, ImageOff, Image as ImageIcon } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

  // Use the utility function to get the full image URL
  const imageUrl = getImageUrl(imagePath);

  // Extract just the filename and extension from the path
  const getFilenameFromPath = (path: string) => {
    if (!path) return '';
    // Handle both URL and file path formats
    const parts = path.split(/[\/\\]/);
    return parts[parts.length - 1];
  };

  const filename = getFilenameFromPath(imagePath);

  // Load image metadata only when the dialog is opened or lazyLoad is false
  useEffect(() => {
    if (!imagePath || (lazyLoad && !dialogOpen)) return;

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
  }, [imagePath, imageUrl, dialogOpen, lazyLoad]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
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
      </DialogTrigger>

      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        {/* Header with filename - always show this */}
        <div className="bg-primary p-3 text-primary-foreground flex items-center gap-2">
          <ImageIcon size={16} />
          <h3 className="font-bold text-sm truncate">{filename}</h3>
        </div>

        {/* Image container or error state */}
        {metadata.error ? (
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
          <div className="px-6 py-3 flex items-center justify-center bg-black/5">
            <img
              src={imageUrl}
              alt={filename}
              className="max-w-full max-h-[60vh] object-contain"
            />
          </div>
        )}

        {/* Footer with metadata - always show this */}
        {showMetadata && (
          <div className="p-4 border-t flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "px-2 py-0 h-6 text-[10px] rounded-md",
                  metadata.error && "text-destructive"
                )}
              >
                {imageUrl.startsWith('http') ? 'REMOTE' : 'LOCAL'}
              </Badge>
              <span
                className={cn("truncate max-w-[300px]", metadata.error && "text-destructive")}
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
            {!metadata.error && (
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreview;
