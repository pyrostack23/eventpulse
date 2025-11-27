import { useEffect } from 'react';

/**
 * Performance Monitor Component
 * Tracks and logs performance metrics in development
 */
const PerformanceMonitor = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Monitor page load performance
    const logPageLoadMetrics = () => {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
        const renderTime = timing.domComplete - timing.domLoading;

        console.group('📊 Page Load Performance');
        console.log(`Total Load Time: ${loadTime}ms`);
        console.log(`DOM Ready Time: ${domReadyTime}ms`);
        console.log(`Render Time: ${renderTime}ms`);
        console.groupEnd();
      }
    };

    // Monitor resource loading
    const logResourceMetrics = () => {
      if (window.performance && window.performance.getEntriesByType) {
        const resources = window.performance.getEntriesByType('resource');
        
        const resourcesByType = resources.reduce((acc, resource) => {
          const type = resource.initiatorType;
          if (!acc[type]) acc[type] = [];
          acc[type].push({
            name: resource.name.split('/').pop(),
            duration: Math.round(resource.duration),
            size: resource.transferSize
          });
          return acc;
        }, {});

        console.group('📦 Resource Loading');
        Object.entries(resourcesByType).forEach(([type, items]) => {
          const totalDuration = items.reduce((sum, item) => sum + item.duration, 0);
          const totalSize = items.reduce((sum, item) => sum + (item.size || 0), 0);
          console.log(`${type}: ${items.length} files, ${totalDuration}ms, ${(totalSize / 1024).toFixed(2)}KB`);
        });
        console.groupEnd();
      }
    };

    // Monitor long tasks
    const observeLongTasks = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              console.warn(`⚠️ Long Task detected: ${entry.duration.toFixed(2)}ms`);
            }
          });
          observer.observe({ entryTypes: ['longtask'] });
        } catch (e) {
          // Long task API not supported
        }
      }
    };

    // Monitor layout shifts
    const observeLayoutShifts = () => {
      if ('PerformanceObserver' in window) {
        try {
          let clsScore = 0;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsScore += entry.value;
              }
            }
            if (clsScore > 0.1) {
              console.warn(`⚠️ Cumulative Layout Shift: ${clsScore.toFixed(4)}`);
            }
          });
          observer.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          // Layout shift API not supported
        }
      }
    };

    // Monitor First Contentful Paint
    const observeFCP = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              console.log(`🎨 First Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
            }
          });
          observer.observe({ entryTypes: ['paint'] });
        } catch (e) {
          // Paint API not supported
        }
      }
    };

    // Monitor Largest Contentful Paint
    const observeLCP = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log(`🖼️ Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)}ms`);
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          // LCP API not supported
        }
      }
    };

    // Monitor First Input Delay
    const observeFID = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const delay = entry.processingStart - entry.startTime;
              console.log(`⚡ First Input Delay: ${delay.toFixed(2)}ms`);
            }
          });
          observer.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          // FID API not supported
        }
      }
    };

    // Run all monitors
    window.addEventListener('load', () => {
      setTimeout(() => {
        logPageLoadMetrics();
        logResourceMetrics();
      }, 0);
    });

    observeLongTasks();
    observeLayoutShifts();
    observeFCP();
    observeLCP();
    observeFID();

    // Monitor memory usage (Chrome only)
    if (performance.memory) {
      const logMemoryUsage = () => {
        const memory = performance.memory;
        console.group('💾 Memory Usage');
        console.log(`Used: ${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`);
        console.log(`Total: ${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`);
        console.log(`Limit: ${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`);
        console.groupEnd();
      };

      const memoryInterval = setInterval(logMemoryUsage, 30000); // Every 30 seconds
      return () => clearInterval(memoryInterval);
    }
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;
