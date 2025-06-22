// Performance-first optimizations for Webflow
// Focuses on Core Web Vitals and loading speed

// GSAP loading removed - Webflow provides it natively

// Lazy load non-critical animations with intersection observer
export const lazyLoadAnimation = (element, animationFn, options = {}) => {
  if (!element || typeof animationFn !== 'function') return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Load animation when element comes into view
          requestIdleCallback(() => {
            animationFn(entry.target);
          });
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: options.threshold || 0.1,
      rootMargin: options.rootMargin || '50px',
    }
  );

  observer.observe(element);
  return observer;
};

// Performance monitoring for Core Web Vitals (moved to app bundle)
export const monitorCoreWebVitals = () => {
  if (typeof PerformanceObserver === 'undefined') return;

  // Largest Contentful Paint
  new PerformanceObserver(entryList => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.info(`[Performance] LCP: ${lastEntry.startTime.toFixed(2)}ms`);
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // First Input Delay
  new PerformanceObserver(entryList => {
    entryList.getEntries().forEach(entry => {
      console.info(`[Performance] FID: ${entry.processingStart - entry.startTime}ms`);
    });
  }).observe({ entryTypes: ['first-input'] });

  // Cumulative Layout Shift
  new PerformanceObserver(entryList => {
    entryList.getEntries().forEach(entry => {
      if (!entry.hadRecentInput) {
        console.info(`[Performance] CLS: ${entry.value}`);
      }
    });
  }).observe({ entryTypes: ['layout-shift'] });
};

// Resource hints for better loading performance
export const addResourceHints = () => {
  const hints = [
    // DNS prefetch for external domains
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
  ];

  hints.forEach(hint => {
    if (!document.querySelector(`link[href="${hint.href}"]`)) {
      const link = document.createElement('link');
      Object.assign(link, hint);
      document.head.appendChild(link);
    }
  });
};

// Optimize images with loading hints
export const optimizeImages = () => {
  const images = document.querySelectorAll('img[data-src], img:not([loading])');

  images.forEach((img, index) => {
    // Add loading="lazy" to images below the fold
    if (index > 2 && !img.hasAttribute('loading')) {
      img.loading = 'lazy';
    }

    // Add decode hint for better rendering performance
    if (!img.hasAttribute('decoding')) {
      img.decoding = 'async';
    }
  });
};

// Animation throttling for performance
export const createFrameThrottler = (targetFps = 60) => {
  const frameInterval = 1000 / targetFps;
  let lastFrameTime = 0;

  return (callback) => {
    return (currentTime) => {
      if (currentTime - lastFrameTime >= frameInterval) {
        lastFrameTime = currentTime;
        callback(currentTime);
      }
    };
  };
};

// Adaptive frame rate based on page visibility
export const createAdaptiveThrottler = () => {
  let isVisible = !document.hidden;
  let currentFps = 60;

  // Monitor visibility changes
  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
    currentFps = isVisible ? 60 : 15; // Reduce to 15fps when hidden
    console.info(`[Performance] Adaptive FPS: ${currentFps}`);
  });

  return {
    getThrottler: () => createFrameThrottler(currentFps),
    getCurrentFps: () => currentFps,
    isVisible: () => isVisible
  };
};

// Memory management for animations
export const createAnimationCleanup = () => {
  const animations = new Set();
  const adaptiveThrottler = createAdaptiveThrottler();

  return {
    register: animation => {
      animations.add(animation);
    },

    cleanup: () => {
      animations.forEach(animation => {
        if (animation.kill) animation.kill();
        if (animation.destroy) animation.destroy();
        if (animation.disconnect) animation.disconnect();
      });
      animations.clear();
    },

    // Pause/resume animations based on visibility
    setupAdaptiveAnimations: () => {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          console.info('[Performance] Page hidden, pausing animations');
          animations.forEach(animation => {
            if (animation.pause) animation.pause();
            if (animation.pauseAnimation) animation.pauseAnimation();
          });
        } else {
          console.info('[Performance] Page visible, resuming animations');
          animations.forEach(animation => {
            if (animation.play) animation.play();
            if (animation.resumeAnimation) animation.resumeAnimation();
          });
        }
      });
    },

    getAdaptiveThrottler: () => adaptiveThrottler
  };
};

// Simplified service worker registration for hero bundle
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
};

// Full service worker with update handling (for app bundle)
export const registerServiceWorkerWithUpdates = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.info('[Performance] Service Worker registered:', registration);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.info('[Performance] New service worker available, will activate on next visit');
            }
          });
        });
        
        // Check for updates periodically (every 10 minutes)
        setInterval(() => {
          registration.update();
        }, 10 * 60 * 1000);
        
      } catch (error) {
        console.warn('[Performance] Service Worker registration failed:', error);
      }
    });
  }
};

// Minimal performance init for hero bundle
export const initCriticalPerformance = () => {
  addResourceHints();
  registerServiceWorker();
  
  if (document.readyState !== 'loading') {
    optimizeImages();
  } else {
    document.addEventListener('DOMContentLoaded', optimizeImages);
  }
};

// Full performance init for app bundle
export const initPerformanceOptimizations = () => {
  // Run immediately
  addResourceHints();
  registerServiceWorkerWithUpdates();

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeImages();
      monitorCoreWebVitals();
    });
  } else {
    optimizeImages();
    monitorCoreWebVitals();
  }
};
