import React from 'react';

// Image optimization utilities

export const getOptimizedImageUrl = (url, width = 800) => {
  if (!url) return null;
  
  // If using a CDN or image service, add optimization parameters
  // Example for Cloudinary: url + '?w=' + width + '&f=webp&q=auto'
  return url;
};

export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const LazyImage = ({ src, alt, className, placeholder }) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder || '');
  const [imageRef, setImageRef] = React.useState();

  React.useEffect(() => {
    let observer;
    
    if (imageRef && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(imageRef);
            }
          });
        },
        { rootMargin: '50px' }
      );
      
      observer.observe(imageRef);
    } else {
      setImageSrc(src);
    }

    return () => {
      if (observer && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [src, imageRef]);

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};
