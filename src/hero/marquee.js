import { $$ } from '../utils.js';

export const MarqueeModule = {
  instances: [],

  init() {
    $$('#logo-brand').forEach(holder => {
      const list = holder.querySelector('.hero-logo-list');
      if (!list) return;

      const splideRoot = this.createSplideStructure(list);
      const splide = this.mountSplide(splideRoot);

      if (splide) {
        this.instances.push(splide);
      }
    });
  },

  createSplideStructure(list) {
    const splideRoot = document.createElement('div');
    splideRoot.className = 'splide';

    const track = document.createElement('div');
    track.className = 'splide__track';

    const parent = list.parentNode;
    if (parent) {
      list.replaceWith(splideRoot);
    }

    track.appendChild(list);
    splideRoot.appendChild(track);

    return splideRoot;
  },

  mountSplide(splideRoot) {
    if (!window.Splide) return null;

    const options = {
      type: 'loop',
      arrows: false,
      pagination: false,
      autoWidth: true,
      drag: false,
      focus: 'center',
      direction: 'ltr',
      autoScroll: {
        autoStart: false,
        speed: 0.6,
      },
    };

    const splide = new window.Splide(splideRoot, options);

    if (window.splide?.Extensions?.AutoScroll) {
      splide.mount({ AutoScroll: window.splide.Extensions.AutoScroll });
    } else {
      splide.mount();
    }

    return splide;
  },

  startAll() {
    this.instances.forEach(this.startInstance);
  },

  startInstance(splide) {
    if (!splide.Components?.AutoScroll) return;

    const autoScroll = splide.Components.AutoScroll;
    if (autoScroll.start) {
      autoScroll.start();
    } else if (autoScroll.play) {
      autoScroll.play();
    }
  },

  destroy() {
    // Destroy all Splide instances
    this.instances.forEach(splide => {
      if (splide && splide.destroy) {
        splide.destroy();
      }
    });
    this.instances = [];
  },
};
