import { $, $$, isReducedMotion } from '../utils.js';
import { CONFIG } from '../config.js';
import { CursorAnimation } from './cursor.js';
import { MarqueeModule } from './marquee.js';

export const HeroAnimation = {
  elements: {},
  timeline: null,

  init() {
    this.cacheElements();
    if (!this.elements.hero) return;

    this.setupHeadingAnimation();
    this.setupInitialStates();
    this.createTimeline();
    this.observeHero();
  },

  cacheElements() {
    this.elements = {
      hero: $(CONFIG.selectors.heroSection),
      heading: $(CONFIG.selectors.heading),
      description: $(CONFIG.selectors.description),
      luckyCard: $(CONFIG.selectors.luckyCard),
      image: $(CONFIG.selectors.image),
    };
  },

  setupHeadingAnimation() {
    const { heading } = this.elements;
    if (!heading) return;

    const text = heading.textContent?.trim() || '';
    const words = text.split(' ');

    heading.innerHTML = words
      .map((word, index) => {
        const chars = [...word].map(ch => `<span class="char">${ch}</span>`).join('');
        const space = index < words.length - 1 ? '<span class="char-space"> </span>' : '';
        return `<span class="word">${chars}</span>${space}`;
      })
      .join('');

    this.applyGradientToChars(heading);
  },

  applyGradientToChars(heading) {
    const computed = window.getComputedStyle(heading);
    const gradientImg = computed.backgroundImage;
    const headingRect = heading.getBoundingClientRect();
    const fullWidth = headingRect.width;

    heading.querySelectorAll('.char').forEach(span => {
      const charRect = span.getBoundingClientRect();
      const offsetX = charRect.left - headingRect.left;

      Object.assign(span.style, {
        backgroundImage: gradientImg,
        backgroundSize: `${fullWidth}px auto`,
        backgroundPosition: `-${offsetX}px 0px`,
        webkitBackgroundClip: 'text',
        backgroundClip: 'text',
        webkitTextFillColor: 'transparent',
        color: 'transparent',
        display: 'inline-block',
      });
    });
  },

  setupInitialStates() {
    const { heading, description, luckyCard, image } = this.elements;

    if (heading) {
      gsap.set('.heading-style-h1 .char', {
        opacity: 0,
        y: 30,
        filter: 'blur(8px)',
        scale: 0.95,
      });
    }

    if (description) {
      gsap.set(description, {
        opacity: 0,
        y: 0,
        filter: 'blur(6px)',
      });
    }

    if (luckyCard) {
      gsap.set(luckyCard, {
        opacity: 0,
        y: 3.5,
        scale: 1,
      });
    }

    if (image) {
      gsap.set(image, {
        opacity: 0,
        scale: 0.95,
      });
    }

    $$('.home_hero .cursor').forEach(cur => (cur.style.opacity = '0'));
  },

  createTimeline() {
    this.timeline = gsap.timeline({
      paused: true,
      defaults: { ease: 'power3.out' },
    });

    const { heading, description, luckyCard, image } = this.elements;

    // Headline animation
    if (heading) {
      this.timeline.addLabel('headline_in', 0).to(
        '.heading-style-h1 .char',
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          scale: 1,
          duration: 1,
          stagger: { each: 0.015, from: 'start' },
        },
        'headline_in'
      );
    }

    // Description animation
    if (description) {
      this.timeline.addLabel('description_in', 'headline_in+=.75').to(
        description,
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 2,
        },
        'description_in'
      );
    }

    // Box animation with tap stagger
    if (luckyCard) {
      this.timeline.addLabel('box_in', 'description_in+=0');

      if (!isReducedMotion()) {
        this.timeline.add(() => CursorAnimation.runTapStagger(), 'box_in');
      }

      this.timeline.to(
        luckyCard,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          ease: 'sine.inOut',
        },
        'box_in'
      );
    }

    // Image animation
    if (image) {
      this.timeline.addLabel('image207_in', 'box_in+=0.35').to(
        image,
        {
          opacity: 1,
          scale: 1,
          duration: 1.5,
          ease: 'sine.inOut',
        },
        'image207_in'
      );
    }

    // Cursor entrance and marquee start
    this.timeline.add(() => {
      const startMarquees = () => setTimeout(() => MarqueeModule.startAll(), 10);

      if (!isReducedMotion()) {
        CursorAnimation.runCursorEntrance(() => {
          CursorAnimation.enableMotion();
          startMarquees();
        });
      } else {
        startMarquees();
      }
    }, 'box_in+=0');
  },

  observeHero() {
    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          obs.disconnect();
          this.timeline.play();
        }
      },
      { threshold: CONFIG.timing.observerThreshold }
    );

    observer.observe(this.elements.hero);
  },
};
