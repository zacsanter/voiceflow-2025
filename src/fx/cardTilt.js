import { CONFIG } from '../config.js';

export const CardTilt = {
  eventListeners: [],
  gsapAnimations: [],

  init() {
    const cards = [...document.querySelectorAll('.glance-testimonial_card')];

    cards.forEach(card => {
      const target = card.querySelector('.glance-testimonial_card-inner') || card;
      let isAnimating = false;
      let pendingAnimation = null;

      const throttledMove = e => {
        if (isAnimating && CONFIG.performance.throttleAnimations) {
          // Store the latest values for the next animation
          pendingAnimation = e;
          return;
        }

        isAnimating = true;
        const b = card.getBoundingClientRect();
        const x = (e.clientX - b.left) / b.width - 0.5;
        const y = (e.clientY - b.top) / b.height - 0.5;

        const animation = gsap.to(target, {
          rotateX: y * 4,
          rotateY: -x * 4,
          scale: 1.0035,
          duration: CONFIG.timing.cardTiltDuration,
          ease: 'power2.out',
          onComplete: () => {
            isAnimating = false;
            // If there's a pending animation, process it
            if (pendingAnimation) {
              const event = pendingAnimation;
              pendingAnimation = null;
              throttledMove(event);
            }
          },
        });

        this.gsapAnimations.push(animation);
      };

      const pointerLeave = () => {
        // Cancel any pending animations
        pendingAnimation = null;

        const animation = gsap.to(target, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: CONFIG.timing.cardTiltResetDuration,
          ease: 'power3.out',
          onComplete: () => {
            isAnimating = false;
          },
        });

        this.gsapAnimations.push(animation);
      };

      card.addEventListener('pointermove', throttledMove);
      card.addEventListener('pointerleave', pointerLeave);

      // Store event listeners for cleanup
      this.eventListeners.push({ element: card, event: 'pointermove', handler: throttledMove });
      this.eventListeners.push({ element: card, event: 'pointerleave', handler: pointerLeave });
    });
  },

  destroy() {
    // Remove all event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];

    // Kill all GSAP animations
    this.gsapAnimations.forEach(animation => {
      if (animation && animation.kill) {
        animation.kill();
      }
    });
    this.gsapAnimations = [];
  },
};
