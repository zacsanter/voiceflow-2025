// No imports needed - uses document.querySelector directly

export const KHGlow = {
  init() {
    const wrap = document.querySelector('#key-highlights-tabs');
    const menu = wrap?.querySelector('.key-highlights-tabs_menu');
    const glow = document.querySelector('.key-highlights-active-glow');
    if (!wrap || !menu || !glow || !window.gsap) return;

    const links = [...menu.querySelectorAll('.key-highlights-tab_link')];
    const combos = ['', 'orchestration', 'hosting', 'analytics'];
    let lastIdx = -1;

    function slideGlow(idx) {
      if (idx === lastIdx || idx < 0 || idx >= links.length) return;
      lastIdx = idx;

      const menuRect = menu.getBoundingClientRect();
      const startX = glow.getBoundingClientRect().left - menuRect.left;

      glow.classList.remove('orchestration', 'hosting', 'analytics');
      if (combos[idx]) glow.classList.add(combos[idx]);

      requestAnimationFrame(() => {
        const endX = glow.getBoundingClientRect().left - menuRect.left;
        const delta = startX - endX;

        window.gsap.killTweensOf(glow);
        window.gsap.fromTo(glow, { x: delta }, { x: 0, duration: 0.7, ease: 'power2.out' });
      });
    }

    if (wrap.autoTabs && typeof wrap.autoTabs.activate === 'function') {
      const orig = wrap.autoTabs.activate.bind(wrap.autoTabs);
      wrap.autoTabs.activate = (i, fade = true) => {
        orig(i, fade);
        slideGlow(i);
      };
    }

    new MutationObserver(() =>
      slideGlow(links.findIndex(l => l.classList.contains('w--current')))
    ).observe(menu, { subtree: true, attributes: true, attributeFilter: ['class'] });

    slideGlow(links.findIndex(l => l.classList.contains('w--current')));
  },
};
