// Blur overlay mouse tracking for shimmer effects
// Handles mouse movement for multiple blur overlay elements

import { $$, Logger } from '../utils.js';

export const BlurOverlay = {
  /**
   * Initialize blur overlay mouse tracking
   */
  init() {
    const blurSelectors = [
      '.key-highlights-left-blur',
      '.voice-agent-blur', 
      '.at-a-glance-left-blur',
      '.glance-inner-left-blur',
      '.glance-inner-centre-blur'
    ];

    // Find all blur overlay elements
    const blurElements = [];
    blurSelectors.forEach(selector => {
      const elements = $$(selector);
      blurElements.push(...elements);
    });

    if (blurElements.length === 0) {
      Logger.info('No blur overlay elements found', 'BlurOverlay');
      return;
    }

    this.setupMouseTracking(blurElements);
    Logger.info(`Initialized mouse tracking for ${blurElements.length} blur overlay elements`, 'BlurOverlay');
  },

  /**
   * Setup mouse tracking for blur overlay elements
   */
  setupMouseTracking(elements) {
    // Throttle mouse updates for performance
    let rafId = null;
    
    const updateMousePosition = (element, clientX, clientY) => {
      if (rafId) return; // Already scheduled
      
      rafId = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;
        
        // Clamp values to reasonable bounds
        const clampedX = Math.max(0, Math.min(100, x));
        const clampedY = Math.max(0, Math.min(100, y));
        
        element.style.setProperty('--mx', `${clampedX}%`);
        element.style.setProperty('--my', `${clampedY}%`);
        
        rafId = null;
      });
    };

    // Add mouse tracking to each element
    elements.forEach(element => {
      // Set initial position
      element.style.setProperty('--mx', '50%');
      element.style.setProperty('--my', '50%');

      // Mouse move handler
      const handleMouseMove = (e) => {
        updateMousePosition(element, e.clientX, e.clientY);
      };

      // Mouse leave handler - reset to center
      const handleMouseLeave = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        element.style.setProperty('--mx', '50%');
        element.style.setProperty('--my', '50%');
      };

      // Add event listeners with passive flag for performance
      element.addEventListener('mousemove', handleMouseMove, { passive: true });
      element.addEventListener('mouseleave', handleMouseLeave, { passive: true });
      
      // Store cleanup function for potential future use
      element._blurOverlayCleanup = () => {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', handleMouseLeave);
      };
    });
  },

  /**
   * Cleanup method for removing event listeners
   */
  destroy() {
    const blurSelectors = [
      '.key-highlights-left-blur',
      '.voice-agent-blur', 
      '.at-a-glance-left-blur',
      '.glance-inner-left-blur',
      '.glance-inner-centre-blur'
    ];

    blurSelectors.forEach(selector => {
      const elements = $$(selector);
      elements.forEach(element => {
        if (element._blurOverlayCleanup) {
          element._blurOverlayCleanup();
          delete element._blurOverlayCleanup;
        }
      });
    });

    Logger.info('Blur overlay tracking destroyed', 'BlurOverlay');
  }
};