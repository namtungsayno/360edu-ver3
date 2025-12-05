// src/components/ui/ImageWithFallback.jsx
import { useState, useEffect } from "react";

export function ImageWithFallback({ src, alt, className = "", fallbackSrc = "/assets/images/banner.jpg", ...props }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Reset state when src prop changes
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}

export default ImageWithFallback;
