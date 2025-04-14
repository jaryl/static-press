import React from 'react';
import ImagePreview from '../../collections/ImagePreview';
import { ImageFieldDisplayProps } from './types';

const ImageFieldDisplay: React.FC<ImageFieldDisplayProps> = ({
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
