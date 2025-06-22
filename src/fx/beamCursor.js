export const BeamCursor = {
  eventListeners: [],

  init() {
    const beam = document.querySelector('.trusted-backed-overlay-blur');
    if (!beam || !beam.parentElement) return;

    const pointerMoveHandler = e => {
      const r = beam.getBoundingClientRect();
      const x = `${(((e.clientX - r.left) / r.width) * 100).toFixed(2)}%`;
      const y = `${(((e.clientY - r.top) / r.height) * 100).toFixed(2)}%`;
      beam.style.setProperty('--mx', x);
      beam.style.setProperty('--my', y);
    };

    beam.parentElement.addEventListener('pointermove', pointerMoveHandler);

    // Store event listener for cleanup
    this.eventListeners.push({
      element: beam.parentElement,
      event: 'pointermove',
      handler: pointerMoveHandler,
    });
  },

  destroy() {
    // Remove all event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  },
};
