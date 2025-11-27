import { useRef, useState, useEffect } from 'react';

const useSwipeGesture = (onSwipeLeft, onSwipeRight, threshold = 100) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [translateX, setTranslateX] = useState(0);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
      setIsSwiping(true);
    };

    const handleTouchMove = (e) => {
      if (!isSwiping) return;
      
      touchCurrentX.current = e.touches[0].clientX;
      const diff = touchCurrentX.current - touchStartX.current;
      
      // Apply resistance to swipe
      const resistance = 0.5;
      setTranslateX(diff * resistance);
      
      if (Math.abs(diff) > 10) {
        setSwipeDirection(diff > 0 ? 'right' : 'left');
      }
    };

    const handleTouchEnd = () => {
      const diff = touchCurrentX.current - touchStartX.current;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (diff < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
      
      // Reset
      setIsSwiping(false);
      setSwipeDirection(null);
      setTranslateX(0);
      touchStartX.current = 0;
      touchCurrentX.current = 0;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isSwiping, onSwipeLeft, onSwipeRight, threshold]);

  return {
    elementRef,
    isSwiping,
    swipeDirection,
    translateX
  };
};

export default useSwipeGesture;
