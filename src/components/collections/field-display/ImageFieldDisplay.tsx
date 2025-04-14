import React, { FC } from 'react';
import ImagePreview from './ImagePreview';
import { ImageFieldDisplayProps } from './types';

const ImageFieldDisplay: FC<ImageFieldDisplayProps> = ({
  imagePath,
  showMetadata = true,
  lazyLoad = true
}) => {
  return (
    <ImagePreview
      imagePath={imagePath}
      showMetadata={showMetadata}
      lazyLoad={lazyLoad}
    />
  );
};

export default ImageFieldDisplay;
