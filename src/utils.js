// Core utility functions - $ returns single element, $$ returns array
export const $ = (selector, context = document) => context.querySelector(selector);
export const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

export const isReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const debounce = (func, wait) => {
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

// Simple logging utility for development
const Logger = {
  error: (message, error = null, context = 'Unknown') => {
    console.error(`[${context}] ${message}`, error);
  },

  warn: (message, context = 'Unknown') => {
    console.warn(`[${context}] ${message}`);
  },

  info: (message, context = 'Unknown') => {
    console.info(`[${context}] ${message}`);
  },
};

// Standardized error handling with proper logging
export const safeInit = (module, moduleName) => {
  try {
    module.init();
    return true;
  } catch (error) {
    Logger.error(`Initialization failed`, error, moduleName);
    return false;
  }
};

// safeExecute removed - not used in critical path

// Simplified error boundary for critical path
export const ErrorBoundary = {
  // Global error handler for unhandled errors
  setupGlobalErrorHandling() {
    window.addEventListener('error', event => {
      Logger.error(`Unhandled error: ${event.message}`, event.error, 'Global');
      event.preventDefault();
      return true;
    });

    window.addEventListener('unhandledrejection', event => {
      Logger.error(`Unhandled promise rejection`, event.reason, 'Global');
      event.preventDefault();
    });
  },

  // Basic fallback wrapper
  withFallback(fn, fallback = () => null, context = 'Unknown') {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        Logger.error(`Function failed, using fallback`, error, context);
        return fallback(...args);
      }
    };
  },

  // Simple retry for critical operations
  async withRetry(fn, maxRetries = 3, delay = 1000, context = 'Unknown') {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) {
          Logger.error(`All retry attempts exhausted`, error, context);
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  },
};

export { Logger };

// Shared element cache to prevent duplicate queries
class ElementCache {
  constructor() {
    this.cache = new Map();
  }

  get(selector, context = document) {
    const key = `${selector}_${context === document ? 'document' : 'custom'}`;

    if (!this.cache.has(key)) {
      const element = context.querySelector(selector);
      this.cache.set(key, element);
    }

    return this.cache.get(key);
  }

  getAll(selector, context = document) {
    const key = `all_${selector}_${context === document ? 'document' : 'custom'}`;

    if (!this.cache.has(key)) {
      const elements = [...context.querySelectorAll(selector)];
      this.cache.set(key, elements);
    }

    return this.cache.get(key);
  }

  clear() {
    this.cache.clear();
  }

  invalidate(selector) {
    // Remove all cached entries containing the selector
    for (const key of this.cache.keys()) {
      if (key.includes(selector)) {
        this.cache.delete(key);
      }
    }
  }
}

export const elementCache = new ElementCache();
