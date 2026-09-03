import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt = '', className, fallbackSrc, onError, ...props }, ref) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (!hasError && fallbackSrc) {
        setHasError(true);
        setImgSrc(fallbackSrc);
      }
      onError?.(e);
    };

    return (
      <img
        ref={ref}
        src={imgSrc}
        alt={alt}
        onError={handleError}
        loading="lazy"
        className={cn('transition-opacity duration-300', className)}
        {...props}
      />
    );
  }
);

Image.displayName = 'Image';
