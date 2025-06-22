import { $, $$ } from '../utils.js';
import { CONFIG } from '../config.js';

export const LuckyButton = {
  init() {
    const luckyBtn = $(CONFIG.selectors.luckyBtn);
    if (!luckyBtn) return;

    luckyBtn.addEventListener('click', () => this.shuffleSelectors());
  },

  shuffleSelectors() {
    const labelDivs = $$('.hero-box-selector > div');
    const dropdowns = $$('.hero-selector-dropdown');

    if (!labelDivs.length || !dropdowns.length) return;

    labelDivs.forEach((labelDiv, i) => {
      const dropdown = dropdowns[i];
      if (!dropdown) return;

      const items = $$('.hero-dropdown-list-item', dropdown);
      const pool = items.map(el => el.dataset.value || el.textContent?.trim() || '');

      const nextValue = this.getNextValue(labelDiv, pool, i);
      this.animateLabel(labelDiv, nextValue);
    });
  },

  getNextValue(labelDiv, pool, index) {
    const currentValue = labelDiv.textContent?.trim() || '';

    if (index === 0) {
      // Toggle between voice and chat for first selector
      return currentValue.toLowerCase() === 'voice' ? 'chat' : 'voice';
    }

    // Random selection for other selectors
    const candidates = pool.filter(v => v.toLowerCase() !== currentValue.toLowerCase());
    return candidates.length
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : currentValue;
  },

  animateLabel(labelDiv, nextValue) {
    gsap
      .timeline()
      .to(labelDiv, {
        y: -CONFIG.animation.shiftPx,
        opacity: 0,
        duration: CONFIG.animation.fadeDur,
        ease: CONFIG.animation.ease,
      })
      .add(() => {
        labelDiv.textContent = nextValue;
      })
      .fromTo(
        labelDiv,
        { y: CONFIG.animation.shiftPx, opacity: 0 },
        { y: 0, opacity: 1, duration: CONFIG.animation.fadeDur, ease: 'power2.out' }
      );
  },
};
