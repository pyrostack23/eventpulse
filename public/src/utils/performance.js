/**
 * Performance Utilities
 * Collection of functions to optimize app performance
 */

/**
 * Debounce function - delays execution until after wait time
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function - limits execution to once per wait time
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Request Idle Callback polyfill
 * Executes callback when browser is idle
 */
export const requestIdleCallback =
  window.requestIdleCallback ||
  function (cb) {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
      });
    }, 1);
  };

export const cancelIdleCallback =
  window.cancelIdleCallback ||
  function (id) {
    clearTimeout(id);
  };

/**
 * Lazy load images using Intersection Observer
 * @param {string} selector - CSS selector for images
 * @param {object} options - Intersection Observer options
 */
export const lazyLoadImages = (selector = 'img[data-src]', options = {}) => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.01,
    ...options
  });

  document.querySelectorAll(selector).forEach(img => imageObserver.observe(img));
};

/**
 * Preload critical resources
 * @param {Array} resources - Array of resource URLs
 * @param {string} type - Resource type (image, script, style)
 */
export const preloadResources = (resources = [], type = 'image') => {
  resources.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    document.head.appendChild(link);
  });
};

/**
 * Optimize animations using requestAnimationFrame
 * @param {Function} callback - Animation callback
 * @returns {number} - Animation frame ID
 */
export const optimizedAnimation = (callback) => {
  let ticking = false;
  
  return (...args) => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback(...args);
        ticking = false;
      });
      ticking = true;
    }
  };
};

/**
 * Measure performance of a function
 * @param {Function} func - Function to measure
 * @param {string} label - Label for the measurement
 */
export const measurePerformance = (func, label = 'Function') => {
  return async (...args) => {
    const start = performance.now();
    const result = await func(...args);
    const end = performance.now();
    console.log(`${label} took ${(end - start).toFixed(2)}ms`);
    return result;
  };
};

/**
 * Batch DOM updates
 * @param {Array} updates - Array of update functions
 */
export const batchDOMUpdates = (updates = []) => {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
};

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} - True if in viewport
 */
export const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Optimize scroll handler
 * @param {Function} callback - Scroll callback
 * @param {number} delay - Throttle delay
 */
export const optimizedScroll = (callback, delay = 100) => {
  let ticking = false;
  let lastScrollY = window.scrollY;

  const handleScroll = throttle(() => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback(window.scrollY, lastScrollY);
        lastScrollY = window.scrollY;
        ticking = false;
      });
      ticking = true;
    }
  }, delay);

  return handleScroll;
};

/**
 * Memoize expensive function results
 * @param {Function} func - Function to memoize
 */
export const memoize = (func) => {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Chunk large arrays for processing
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 */
export const chunkArray = (array, size = 10) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Process large arrays in chunks with idle callback
 * @param {Array} items - Items to process
 * @param {Function} processor - Processing function
 * @param {number} chunkSize - Items per chunk
 */
export const processInChunks = async (items, processor, chunkSize = 10) => {
  const chunks = chunkArray(items, chunkSize);
  
  for (const chunk of chunks) {
    await new Promise(resolve => {
      requestIdleCallback(() => {
        chunk.forEach(processor);
        resolve();
      });
    });
  }
};

/**
 * Detect slow network
 * @returns {boolean} - True if slow network
 */
export const isSlowNetwork = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!connection) return false;
  
  return connection.saveData || 
         connection.effectiveType === 'slow-2g' || 
         connection.effectiveType === '2g';
};

/**
 * Get device performance tier
 * @returns {string} - 'high', 'medium', or 'low'
 */
export const getPerformanceTier = () => {
  const memory = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 2;
  
  if (memory >= 8 && cores >= 4) return 'high';
  if (memory >= 4 && cores >= 2) return 'medium';
  return 'low';
};

/**
 * Optimize images based on device
 * @param {string} url - Image URL
 * @returns {string} - Optimized URL
 */
export const optimizeImageUrl = (url) => {
  const tier = getPerformanceTier();
  const isSlowNet = isSlowNetwork();
  
  if (tier === 'low' || isSlowNet) {
    // Return lower quality or smaller size
    return url.replace(/\.(jpg|jpeg|png)$/, '-small.$1');
  }
  
  return url;
};

export default {
  debounce,
  throttle,
  requestIdleCallback,
  cancelIdleCallback,
  lazyLoadImages,
  preloadResources,
  optimizedAnimation,
  measurePerformance,
  batchDOMUpdates,
  isInViewport,
  optimizedScroll,
  memoize,
  chunkArray,
  processInChunks,
  isSlowNetwork,
  getPerformanceTier,
  optimizeImageUrl
};
