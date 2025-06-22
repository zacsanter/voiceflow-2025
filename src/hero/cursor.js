import { $, isReducedMotion } from '../utils.js';
import { CONFIG, SELECTOR_CURSOR_PAIRS } from '../config.js';
import { sharedIntersectionObserver, sharedVisibilityObserver } from '../utils/observers.js';
import { createAdaptiveThrottler } from '../performance.js';

export const CursorAnimation = {
  selectors: [],
  cursors: [],
  cursorData: [],
  animationId: null,
  isVisible: true,
  isInViewport: true,
  heroElement: null,
  eventListeners: [],
  intersectionObserver: null,
  adaptiveThrottler: null,

  init() {
    this.heroElement = $(CONFIG.selectors.heroSection);
    if (!this.heroElement) return;

    // Initialize adaptive throttling for performance
    this.adaptiveThrottler = createAdaptiveThrottler();

    this.selectors = SELECTOR_CURSOR_PAIRS.map(p => this.heroElement.querySelector(p.sel));
    this.cursors = SELECTOR_CURSOR_PAIRS.map(p => $(p.cur));
  },

  runTapStagger() {
    SELECTOR_CURSOR_PAIRS.forEach((pair, i) => {
      const el = this.selectors[i];
      if (!el) return;

      setTimeout(
        () => {
          el.style.color = pair.colour;
          el.classList.add('tap');

          setTimeout(() => {
            el.classList.remove('tap');
            el.style.color = '';
          }, CONFIG.animation.tapDur);
        },
        CONFIG.animation.tapDelay + i * CONFIG.animation.tapStagger
      );
    });
  },

  runCursorEntrance(callback) {
    if (isReducedMotion() || !this.heroElement) {
      callback?.();
      return;
    }

    const heroBox = this.heroElement.getBoundingClientRect();

    this.cursors.forEach((cur, i) => {
      if (!cur) return;
      const curElement = cur;

      const rect = curElement.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = cx - (heroBox.left + heroBox.width / 2);
      const dy = cy - (heroBox.top + heroBox.height / 2);
      const len = Math.hypot(dx, dy) || 1;

      const initialX = (dx / len) * CONFIG.animation.entrOffset;
      const initialY = (dy / len) * CONFIG.animation.entrOffset;

      curElement.style.setProperty('--entrX', `${initialX}px`);
      curElement.style.setProperty('--entrY', `${initialY}px`);
      curElement.classList.add('init');

      setTimeout(
        () => {
          requestAnimationFrame(() => {
            curElement.classList.add('enter');
            curElement.style.transform = 'translate(0px, 0px)';
            curElement.style.opacity = '1';
          });
        },
        CONFIG.animation.tapDelay + i * CONFIG.animation.tapStagger
      );
    });

    const totalDelay =
      CONFIG.animation.tapDelay +
      (SELECTOR_CURSOR_PAIRS.length - 1) * CONFIG.animation.tapStagger +
      CONFIG.animation.entrDur +
      50;
    setTimeout(callback, totalDelay);
  },

  enableMotion() {
    if (isReducedMotion() || !this.cursors.length) return;

    if (!this.heroElement) return;

    this.cursorData = this.cursors
      .map(cur => {
        if (!cur) return null;
        const rect = cur.getBoundingClientRect();
        return {
          cur,
          cx: rect.left + rect.width / 2,
          cy: rect.top + rect.height / 2,
          phaseX: Math.random() * 2 * Math.PI,
          phaseY: Math.random() * 2 * Math.PI,
          dx: 0,
          dy: 0,
          bx: 0,
          by: 0,
        };
      })
      .filter(Boolean);

    if (!this.cursorData.length) return;

    let inside = false,
      mx = 0,
      my = 0;

    const mouseEnterHandler = e => {
      inside = true;
      mx = e.clientX;
      my = e.clientY;
    };

    const mouseMoveHandler = e => {
      mx = e.clientX;
      my = e.clientY;
    };

    const mouseLeaveHandler = () => (inside = false);

    this.heroElement.addEventListener('mouseenter', mouseEnterHandler, { passive: true });
    this.heroElement.addEventListener('mousemove', mouseMoveHandler, { passive: true });
    this.heroElement.addEventListener('mouseleave', mouseLeaveHandler);

    // Store event listeners for cleanup
    this.eventListeners.push({
      element: this.heroElement,
      event: 'mouseenter',
      handler: mouseEnterHandler,
    });
    this.eventListeners.push({
      element: this.heroElement,
      event: 'mousemove',
      handler: mouseMoveHandler,
    });
    this.eventListeners.push({
      element: this.heroElement,
      event: 'mouseleave',
      handler: mouseLeaveHandler,
    });

    // Setup visibility observer to pause animation when not visible
    this.setupVisibilityObserver(this.heroElement);

    this.startAnimationLoop(inside, mx, my);
  },

  setupVisibilityObserver(heroElement) {
    // Use shared visibility observer for page visibility
    sharedVisibilityObserver.register(isVisible => {
      this.isVisible = isVisible && this.isInViewport;
      if (!this.isVisible) {
        this.pauseAnimation();
      } else {
        this.resumeAnimation();
      }
    }, 'cursor-animation');

    // Use shared intersection observer for viewport detection
    sharedIntersectionObserver.observe(
      heroElement,
      entry => {
        this.isInViewport = entry.isIntersecting;
        this.isVisible = this.isInViewport && !document.hidden;
        if (!this.isVisible) {
          this.pauseAnimation();
        } else {
          this.resumeAnimation();
        }
      },
      'cursor-animation'
    );
  },

  pauseAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  },

  resumeAnimation() {
    if (!this.animationId && this.cursorData?.length && this.isVisible) {
      this.startAnimationLoop();
    }
  },

  startAnimationLoop(inside, mx, my) {
    // Cancel any existing animation
    this.pauseAnimation();

    const t0 = performance.now();
    
    // Get adaptive throttler for current visibility state
    const throttler = this.adaptiveThrottler?.getThrottler() || (fn => fn);

    const animationLogic = (now) => {
      const t = now - t0;

      this.cursorData.forEach(d => {
        const wigX =
          Math.sin(d.phaseX + t * CONFIG.animation.wavySpeed) * CONFIG.animation.wavyAmpl;
        const wigY =
          Math.sin(d.phaseY + t * CONFIG.animation.wavySpeed) * CONFIG.animation.wavyAmpl;

        if (inside) {
          d.bx +=
            (Math.sign(mx - d.cx) * CONFIG.animation.pointerBias - d.bx) *
            CONFIG.animation.biasLerp;
          d.by +=
            (Math.sign(my - d.cy) * CONFIG.animation.pointerBias - d.by) *
            CONFIG.animation.biasLerp;
        } else {
          d.bx += -d.bx * CONFIG.animation.biasLerp;
          d.by += -d.by * CONFIG.animation.biasLerp;
        }

        d.dx = wigX + d.bx;
        d.dy = wigY + d.by;
        d.cur.style.transform = `translate(${d.dx}px, ${d.dy}px)`;
      });
    };

    // Throttled animation loop
    const throttledAnimation = throttler(animationLogic);

    const loop = now => {
      // Check if animation should continue
      if (!this.isVisible) {
        this.animationId = null;
        return;
      }

      throttledAnimation(now);
      this.animationId = requestAnimationFrame(loop);
    };

    this.animationId = requestAnimationFrame(loop);
  },

  destroy() {
    // Cancel animation loop
    this.pauseAnimation();

    // Remove all event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];

    // Unregister from shared observers
    sharedVisibilityObserver.unregister('cursor-animation');
    if (this.heroElement) {
      sharedIntersectionObserver.unobserve(this.heroElement);
    }

    // Clear data
    this.selectors = [];
    this.cursors = [];
    this.cursorData = [];
    this.heroElement = null;
    this.isVisible = true;
    this.isInViewport = true;
    this.intersectionObserver = null;
  },
};
