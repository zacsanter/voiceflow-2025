// Critical path - runs immediately without defer
// Only import critical modules immediately
import { HeroAnimation } from './hero/heroAnimation.js';
import { MarqueeModule } from './hero/marquee.js';
import { $, safeInit, ErrorBoundary } from './utils.js';
import { CONFIG } from './config.js';
import { initCriticalPerformance, lazyLoadAnimation } from './performance.js';

// Setup global error handling and performance optimizations
ErrorBoundary.setupGlobalErrorHandling();
initCriticalPerformance();

// Setup hero animation when DOM is ready
window.heroReady = new Promise(resolve => {
  const initHero = () => {
    // Check if hero exists before proceeding
    const heroCheck = $(CONFIG.selectors.heroSection);

    if (!heroCheck) {
      // Retry once if hero not found immediately
      setTimeout(() => {
        const heroRetry = $(CONFIG.selectors.heroSection);
        if (heroRetry) {
          initializeAnimations();
        }
      }, CONFIG.timing.domRetryDelay);
    } else {
      initializeAnimations();
    }

    async function initializeAnimations() {
      // Make page visible
      const pageWrapper = $(CONFIG.selectors.pageWrapper);
      if (pageWrapper) {
        pageWrapper.style.opacity = '1';
      }

      // Initialize critical animations immediately
      safeInit(MarqueeModule, 'MarqueeModule');
      safeInit(HeroAnimation, 'HeroAnimation');

      // Lazy load non-critical animations when hero comes into view
      const heroElement = $(CONFIG.selectors.heroSection);
      if (heroElement) {
        lazyLoadAnimation(heroElement, async () => {
          // Dynamic import voice wave animation
          const { VoiceWaveAnimation } = await import('./hero/wave.js');
          safeInit(VoiceWaveAnimation, 'VoiceWaveAnimation');
          
          // Dynamic import cursor animation
          const { CursorAnimation } = await import('./hero/cursor.js');
          safeInit(CursorAnimation, 'CursorAnimation');
        }, { threshold: 0.1 });
      }

      resolve();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHero);
  } else {
    // Add small delay to ensure Webflow has rendered
    setTimeout(initHero, CONFIG.timing.webflowRenderDelay);
  }
});
