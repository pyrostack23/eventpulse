import React, { useState, useEffect, useRef } from 'react';

const LazyImage = ({ 
  src, 
  alt, 
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3C/svg%3E',
  className = '',
  style = {},
  onLoad,
  threshold = 0.1
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    let observer;
    let didCancel = false;

    if (imgRef.current && imageSrc === placeholder) {
      if (IntersectionObserver) {
        observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (!didCancel && (entry.intersectionRatio > 0 || entry.isIntersecting)) {
                setImageSrc(src);
                observer.unobserve(imgRef.current);
              }
            });
          },
          {
            threshold,
            rootMargin: '50px'
          }
        );
        observer.observe(imgRef.current);
      } else {
        // Fallback for browsers without IntersectionObserver
        setImageSrc(src);
      }
    }

    return () => {
      didCancel = true;
      if (observer && observer.unobserve && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, imageSrc, placeholder, threshold]);

  const handleLoad = () => {
    setImageLoaded(true);
    if (onLoad) onLoad();
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`lazy-image ${imageLoaded ? 'loaded' : 'loading'} ${className}`}
      style={{
        ...style,
        opacity: imageLoaded ? 1 : 0.5,
        transition: 'opacity 0.3s ease-in-out',
        filter: imageLoaded ? 'none' : 'blur(10px)',
        willChange: 'opacity, filter'
      }}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
};

export default LazyImage;
