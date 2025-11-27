import { useEffect, useRef, useState } from 'react';

const usePullToRefresh = (onRefresh) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    let touchStartY = 0;
    let touchCurrentY = 0;

    const handleTouchStart = (e) => {
      // Only trigger if at top of page
      if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY;
        startY.current = touchStartY;
      }
    };

    const handleTouchMove = (e) => {
      if (window.scrollY === 0 && !isRefreshing) {
        touchCurrentY = e.touches[0].clientY;
        currentY.current = touchCurrentY;
        const distance = touchCurrentY - touchStartY;

        if (distance > 0) {
          setIsPulling(true);
          setPullDistance(Math.min(distance, 100));
          
          // Prevent default scroll when pulling
          if (distance > 10) {
            e.preventDefault();
          }
        }
      }
    };

    const handleTouchEnd = async () => {
      if (isPulling && pullDistance > 60 && !isRefreshing) {
        setIsRefreshing(true);
        setIsPulling(false);
        
        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh error:', error);
        } finally {
          setTimeout(() => {
            setIsRefreshing(false);
            setPullDistance(0);
          }, 500);
        }
      } else {
        setIsPulling(false);
        setPullDistance(0);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, isRefreshing, onRefresh]);

  return {
    isPulling,
    isRefreshing,
    pullDistance
  };
};

export default usePullToRefresh;
