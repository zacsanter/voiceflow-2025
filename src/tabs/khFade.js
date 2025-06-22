// No imports needed - uses document.querySelector directly

export const KHFade = {
  init() {
    const sel = '#key-highlights-tabs';
    const wrap = document.querySelector(sel);
    if (!wrap || !window.gsap) return;

    let currentImg = null;

    const cacheBox = (img, box) => {
      img.dataset.x = box.left + window.scrollX;
      img.dataset.y = box.top + window.scrollY;
      img.dataset.w = box.width;
      img.dataset.h = box.height;
    };

    const fadeIn = img => {
      if (!img) return;
      const b = img.getBoundingClientRect();
      cacheBox(img, b);

      window.gsap.set(img, { opacity: 0, y: 8, scale: 1, filter: 'blur(10px)' });
      window.gsap.to(img, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.7,
        ease: 'power2.out',
      });
    };

    const fadeOut = img => {
      if (!img) return;

      const x = parseFloat(img.dataset.x) || img.getBoundingClientRect().left + window.scrollX;
      const y = parseFloat(img.dataset.y) || img.getBoundingClientRect().top + window.scrollY;
      const w = parseFloat(img.dataset.w) || img.offsetWidth;
      const h = parseFloat(img.dataset.h) || img.offsetHeight;

      const ghost = img.cloneNode(true);
      Object.assign(ghost.style, {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`,
        margin: 0,
        pointerEvents: 'none',
        zIndex: 5,
      });
      document.body.appendChild(ghost);

      window.gsap.to(ghost, {
        opacity: 0,
        y: 0,
        scale: 1,
        filter: 'blur(10px)',
        duration: 0.7,
        ease: 'power2.in',
        onComplete: () => ghost.remove(),
      });
    };

    const swap = () =>
      requestAnimationFrame(() => {
        const pane = wrap.querySelector('.w-tab-pane.w--tab-active');
        const next = pane?.querySelector('.key-highlights_agent-img');
        if (next && next !== currentImg) {
          fadeOut(currentImg);
          fadeIn(next);
          currentImg = next;
        }
      });

    new MutationObserver(swap).observe(wrap, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    swap();
  },
};
