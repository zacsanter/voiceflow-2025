import { $, $$, debounce } from '../utils.js';
import { CONFIG } from '../config.js';

export const CTAModule = {
  init() {
    this.initQueryBuilder();
    this.initCustomCursor();
  },

  initQueryBuilder() {
    const ctaButton = $(CONFIG.selectors.ctaButton);
    if (!ctaButton) return;

    const heroInputWrappers = $$('.hero-input-wrapper');

    ctaButton.addEventListener('click', e => {
      e.preventDefault();

      const params = new URLSearchParams();

      heroInputWrappers.forEach((wrapper, i) => {
        const labelDiv = wrapper.querySelector('.hero-box-selector > div');
        if (!labelDiv) return;

        const value = labelDiv.textContent?.trim();
        if (value && CONFIG.cta.paramKeys[i]) {
          params.set(CONFIG.cta.paramKeys[i], value);
        }
      });

      window.location.href = `${CONFIG.cta.baseURL}?${params.toString()}`;
    });
  },

  initCustomCursor() {
    const ctaSection = $(CONFIG.selectors.ctaSection);
    if (!ctaSection) return;

    const cursorSprite = ctaSection.querySelector('.you-cursor');
    if (!cursorSprite) return;

    document.body.appendChild(cursorSprite);
    let isActive = false;

    const showCursor = () => {
      gsap.fromTo(
        cursorSprite,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' }
      );
    };

    const hideCursor = () => {
      gsap.to(cursorSprite, {
        opacity: 0,
        scale: 0.85,
        duration: 0.16,
        ease: 'power2.in',
      });
    };

    const handlePointerMove = e => {
      const rect = ctaSection.getBoundingClientRect();
      const isInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (isInside) {
        cursorSprite.style.left = `${e.clientX}px`;
        cursorSprite.style.top = `${e.clientY}px`;

        if (!isActive) {
          isActive = true;
          ctaSection.classList.add('hide-native-cursor');
          showCursor();
        }
      } else if (isActive) {
        isActive = false;
        ctaSection.classList.remove('hide-native-cursor');
        hideCursor();
      }
    };

    const handleScroll = debounce(() => {
      if (isActive) {
        isActive = false;
        ctaSection.classList.remove('hide-native-cursor');
        hideCursor();
      }
    }, 100);

    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
  },
};
