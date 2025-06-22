// Shared observer patterns to reduce observer overhead
// Multiple modules can register callbacks instead of creating individual observers

class SharedIntersectionObserver {
  constructor(options = {}) {
    this.callbacks = new Map();
    this.observer = null;
    this.options = options;
  }

  // Register a callback for a specific element
  observe(element, callback, id) {
    if (!element) return;

    // Create observer if it doesn't exist
    if (!this.observer) {
      this.observer = new IntersectionObserver(
        entries => this.handleIntersection(entries),
        this.options
      );
    }

    // Store callback
    this.callbacks.set(element, { callback, id });
    this.observer.observe(element);
  }

  // Remove observation for a specific element
  unobserve(element) {
    if (!element || !this.observer) return;

    this.observer.unobserve(element);
    this.callbacks.delete(element);

    // Clean up observer if no more callbacks
    if (this.callbacks.size === 0) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  // Handle intersection changes
  handleIntersection(entries) {
    entries.forEach(entry => {
      const callbackData = this.callbacks.get(entry.target);
      if (callbackData) {
        callbackData.callback(entry, callbackData.id);
      }
    });
  }

  // Cleanup all observations
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.callbacks.clear();
  }
}

class SharedVisibilityObserver {
  constructor() {
    this.callbacks = new Map();
    this.isListening = false;
    this.boundHandler = null;
  }

  // Register a visibility change callback
  register(callback, id) {
    this.callbacks.set(id, callback);

    // Start listening if not already
    if (!this.isListening) {
      this.boundHandler = () => this.handleVisibilityChange();
      document.addEventListener('visibilitychange', this.boundHandler, { passive: true });
      this.isListening = true;
    }
  }

  // Unregister a callback
  unregister(id) {
    this.callbacks.delete(id);

    // Stop listening if no more callbacks
    if (this.callbacks.size === 0 && this.isListening) {
      document.removeEventListener('visibilitychange', this.boundHandler);
      this.isListening = false;
      this.boundHandler = null;
    }
  }

  // Handle visibility change
  handleVisibilityChange() {
    const isVisible = !document.hidden;
    this.callbacks.forEach((callback, id) => {
      callback(isVisible, id);
    });
  }

  // Cleanup all callbacks
  disconnect() {
    if (this.isListening) {
      document.removeEventListener('visibilitychange', this.boundHandler);
      this.isListening = false;
      this.boundHandler = null;
    }
    this.callbacks.clear();
  }
}

// Export shared instances
export const sharedIntersectionObserver = new SharedIntersectionObserver({
  threshold: 0.25,
});

export const sharedVisibilityObserver = new SharedVisibilityObserver();

// Export for custom threshold observers
export { SharedIntersectionObserver, SharedVisibilityObserver };
