import { Logger } from '../utils.js';
import { sharedIntersectionObserver, sharedVisibilityObserver } from '../utils/observers.js';

const CONFIG = {
  INTERVAL: 7000,
  WRAPPER: '#key-highlights-tabs',
  TRANSITION: 300,
  PAUSE_ON_HOVER: false,
  PAUSE_ON_FOCUS: true,
  RESUME_DELAY: 1000,
  VIEW_THRESHOLD: 0.25,
  ARIA_LIVE: true,
  DEBUG: false,
};

class SingleTimer {
  constructor(cb) {
    this.cb = cb;
    this.id = null;
  }

  schedule(ms) {
    this.clear();
    this.id = setTimeout(() => {
      this.id = null;
      this.cb();
    }, ms);
  }

  clear() {
    if (this.id !== null) {
      clearTimeout(this.id);
      this.id = null;
    }
  }
}

class AutoTabs {
  constructor(el, cfg) {
    this.cfg = cfg;
    this.el = el;
    this.links = [...el.querySelectorAll('.w-tab-link')];
    this.panes = [...el.querySelectorAll('.w-tab-pane')];

    this.curr = this.links.findIndex(l => l.classList.contains('w--current'));
    if (this.curr < 0) this.curr = 0;

    this.lastTick = Date.now();
    this.remaining = cfg.INTERVAL;
    this.paused = true;
    this.inView = false;
    this.transing = false;

    this.loop = new SingleTimer(() => {
      this.next();
      this.loop.schedule(cfg.INTERVAL);
    });
    this.resumeJob = new SingleTimer(() => this.resumeImmediate());

    // Track event listeners for cleanup
    this.eventListeners = [];
    this.io = null;

    this.init();
  }

  init() {
    this.el.style.setProperty('--tab-duration', `${this.cfg.INTERVAL / 1000}s`);
    this.el.style.setProperty('--tab-transition', `${this.cfg.TRANSITION}ms`);
    this.el.classList.add('auto-tabs-ready');

    if (this.cfg.ARIA_LIVE) this.initLive();
    this.bindEvents();
    this.activate(this.curr, false);
    this.watchViewport();
  }

  watchViewport() {
    // Use shared intersection observer
    this.observerId = `auto-tabs-${this.el.id || Math.random()}`;
    sharedIntersectionObserver.observe(
      this.el,
      entry => {
        if (entry.isIntersecting) {
          this.inView = true;
          this.resumeImmediate();
        } else {
          this.inView = false;
          this.pause();
        }
      },
      this.observerId
    );
  }

  startLoop(ms = this.cfg.INTERVAL) {
    if (!this.inView) return;
    this.loop.schedule(ms);
    this.el.classList.add('auto-tabs-playing');
    this.ensureAnim();
    this.paused = false;
  }

  pause() {
    if (this.paused) return;
    this.remaining = Math.max(0, this.cfg.INTERVAL - (Date.now() - this.lastTick));
    this.paused = true;
    this.loop.clear();
    this.resumeJob.clear();
    this.el.classList.add('auto-tabs-paused');
    this.pauseAnim();
  }

  resumeImmediate() {
    if (!this.paused || !this.inView) return;
    this.paused = false;
    this.el.classList.remove('auto-tabs-paused');
    this.el.classList.add('auto-tabs-playing');

    const link = this.links[this.curr];
    if (link) {
      if (this.remaining === this.cfg.INTERVAL) {
        link.classList.remove('tab-anim');
        void link.offsetWidth;
        link.classList.add('tab-anim');
      } else {
        link.style.animationPlayState = 'running';
        if (!link.classList.contains('tab-anim')) link.classList.add('tab-anim');
      }
    }
    this.startLoop(this.remaining);
  }

  resumeAfter(ms) {
    this.resumeJob.schedule(ms);
  }

  next() {
    this.activate((this.curr + 1) % this.links.length, true);
  }

  activate(i, fade = true) {
    if (this.transing && fade) return;
    this.transing = true;

    this.links.forEach(l => {
      l.classList.remove('w--current', 'tab-anim');
      l.setAttribute('aria-selected', 'false');
      l.setAttribute('tabindex', '-1');
      l.style.animationPlayState = '';
    });
    this.panes.forEach(p => p.classList.remove('w--tab-active'));

    const link = this.links[i];
    link.classList.add('w--current');
    link.setAttribute('aria-selected', 'true');
    link.setAttribute('tabindex', '0');
    link.style.animationPlayState = 'running';
    this.panes[i].classList.add('w--tab-active');

    this.curr = i;
    this.lastTick = Date.now();
    this.remaining = this.cfg.INTERVAL;

    requestAnimationFrame(() => requestAnimationFrame(() => link.classList.add('tab-anim')));
    if (this.live) this.live.textContent = `${link.textContent || `Tab ${i + 1}`} selected`;
    setTimeout(() => {
      this.transing = false;
    }, this.cfg.TRANSITION);
  }

  bindEvents() {
    if (this.cfg.PAUSE_ON_HOVER) {
      this.addTrackedEventListener(this.el, 'mouseenter', () => this.pause());
      this.addTrackedEventListener(this.el, 'mouseleave', () =>
        this.resumeAfter(this.cfg.RESUME_DELAY)
      );
    }
    if (this.cfg.PAUSE_ON_FOCUS) {
      this.addTrackedEventListener(this.el, 'focusin', () => this.pause());
      this.addTrackedEventListener(this.el, 'focusout', e => {
        if (!this.el.contains(e.relatedTarget)) this.resumeAfter(this.cfg.RESUME_DELAY);
      });
    }

    this.links.forEach(l => {
      const mouseEnterHandler = () => {
        if (!this.inView) return;
        if (l.classList.contains('w--current')) l.style.animationPlayState = 'paused';
        this.pause();
      };

      const mouseLeaveHandler = () => {
        if (!this.inView) return;
        if (l.classList.contains('w--current')) l.style.animationPlayState = 'running';
        this.resumeImmediate();
      };

      this.addTrackedEventListener(l, 'mouseenter', mouseEnterHandler);
      this.addTrackedEventListener(l, 'mouseleave', mouseLeaveHandler);
    });

    this.links.forEach((l, i) => {
      const clickHandler = e => {
        e.preventDefault();
        if (this.transing) return;
        this.loop.clear();
        this.resumeJob.clear();

        this.paused = false;
        this.el.classList.remove('auto-tabs-paused');
        this.el.classList.add('auto-tabs-playing');

        this.activate(i, true);
        this.startLoop();
      };

      this.addTrackedEventListener(l, 'click', clickHandler);
    });

    const keydownHandler = e => {
      const map = { ArrowLeft: -1, ArrowRight: 1, Home: 'home', End: 'end' };
      if (!(e.key in map)) return;
      e.preventDefault();
      let idx;
      if (map[e.key] === 'home') idx = 0;
      else if (map[e.key] === 'end') idx = this.links.length - 1;
      else idx = (this.curr + map[e.key] + this.links.length) % this.links.length;

      this.loop.clear();
      this.resumeJob.clear();
      this.activate(idx, true);
      this.links[idx].focus();
      this.startLoop();
    };

    this.addTrackedEventListener(this.el, 'keydown', keydownHandler);

    // Use shared visibility observer instead of direct event listener
    this.visibilityId = `auto-tabs-visibility-${this.el.id || Math.random()}`;
    sharedVisibilityObserver.register(isVisible => {
      isVisible ? this.resumeImmediate() : this.pause();
    }, this.visibilityId);
  }

  ensureAnim() {
    const l = this.links[this.curr];
    if (l && !l.classList.contains('tab-anim')) l.classList.add('tab-anim');
  }

  pauseAnim() {
    const l = this.links[this.curr];
    if (l) l.style.animationPlayState = 'paused';
  }

  initLive() {
    this.live = document.createElement('div');
    Object.assign(this.live.style, {
      position: 'absolute',
      left: '-9999px',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
    });
    this.live.setAttribute('aria-live', 'polite');
    this.live.setAttribute('aria-atomic', 'true');
    this.el.appendChild(this.live);
  }

  log(m) {
    if (this.cfg.DEBUG) Logger.info(m, 'AutoTabs');
  }

  // Helper method to add event listeners with tracking
  addTrackedEventListener(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    this.eventListeners.push({ element, event, handler, options });
  }

  destroy() {
    // Clear timers
    this.loop.clear();
    this.resumeJob.clear();

    // Remove all event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];

    // Unregister from shared observers
    if (this.observerId) {
      sharedIntersectionObserver.unobserve(this.el);
    }
    if (this.visibilityId) {
      sharedVisibilityObserver.unregister(this.visibilityId);
    }

    // Remove live region if it exists
    if (this.live && this.live.parentNode) {
      this.live.parentNode.removeChild(this.live);
      this.live = null;
    }

    // Reset element classes and styles
    if (this.el) {
      this.el.classList.remove('auto-tabs-ready', 'auto-tabs-playing', 'auto-tabs-paused');
    }
    if (this.links) {
      this.links.forEach(l => {
        l.classList.remove('tab-anim');
        l.style.animationPlayState = '';
      });
    }

    // Clear references
    this.links = [];
    this.panes = [];
    this.el = null;
    this.observerId = null;
    this.visibilityId = null;
    this.io = null;
  }
}

export const AutoTabsModule = {
  instance: null,

  init() {
    const wrapper = document.querySelector(CONFIG.WRAPPER);
    if (!wrapper) return;
    this.instance = new AutoTabs(wrapper, CONFIG);
    wrapper.autoTabs = this.instance;
  },

  destroy() {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }
  },
};
