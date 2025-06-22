import { $, ErrorBoundary, Logger } from '../utils.js';

export const VoiceWaveAnimation = {
  async init() {
    const wrap = $('.voice-wave-bg');
    if (!wrap || !wrap.dataset.src) {
      Logger.warn('Voice wave background element or data-src not found', 'VoiceWaveAnimation');
      return;
    }

    // Use retry mechanism for network fetch with fallback
    const fetchWithFallback = async () => {
      const response = await fetch(wrap.dataset.src);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.text();
    };

    try {
      const svgText = await ErrorBoundary.withRetry(
        fetchWithFallback,
        3,
        1000,
        'VoiceWaveAnimation'
      );

      wrap.innerHTML = svgText;

      const svg = wrap.querySelector('svg');
      if (!svg) {
        Logger.warn('SVG element not found in fetched content', 'VoiceWaveAnimation');
        this.showFallback(wrap);
        return;
      }

      svg.setAttribute('preserveAspectRatio', 'none');

      // Wrap each operation in error boundaries
      ErrorBoundary.withFallback(
        () => this.removeMasks(svg),
        () => Logger.warn('Failed to remove masks', 'VoiceWaveAnimation'),
        'VoiceWaveAnimation'
      )();

      ErrorBoundary.withFallback(
        () => this.explodeMegaPaths(svg),
        () => Logger.warn('Failed to explode paths', 'VoiceWaveAnimation'),
        'VoiceWaveAnimation'
      )();

      ErrorBoundary.withFallback(
        () => this.animateDots(svg),
        () => Logger.warn('Failed to animate dots', 'VoiceWaveAnimation'),
        'VoiceWaveAnimation'
      )();
    } catch (error) {
      Logger.error('Failed to load voice wave animation', error, 'VoiceWaveAnimation');
      this.showFallback(wrap);
    }
  },

  showFallback(wrap) {
    // Show a simple fallback animation using CSS
    wrap.innerHTML = `
      <div class="voice-wave-fallback" style="
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, #5b9fd7 0%, #56b365 50%, #dc8879 100%);
        opacity: 0.3;
        animation: pulse 2s ease-in-out infinite;
      "></div>
    `;
    Logger.info('Showing fallback animation', 'VoiceWaveAnimation');
  },

  removeMasks(svg) {
    svg.querySelectorAll('[mask]').forEach(el => el.removeAttribute('mask'));
  },

  explodeMegaPaths(svg) {
    svg.querySelectorAll('path').forEach(path => {
      const d = path.getAttribute('d') || '';
      if (d.split('M').length < 5) return;

      const parent = path.parentNode;
      const colour = path.getAttribute('fill') || '#47525b';

      [...d.matchAll(/M([\d.]+)\s+([\d.]+)/g)].forEach(match => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', match[1]);
        circle.setAttribute('cy', match[2]);
        circle.setAttribute('r', '2.02');
        circle.setAttribute('fill', colour);
        parent.appendChild(circle);
      });

      path.remove();
    });
  },

  animateDots(svg) {
    svg.querySelectorAll('circle,rect,path').forEach(dot => {
      dot.classList.add('anim-dot');
      dot.style.setProperty('--dur', `${(1.4 + Math.random() * 2).toFixed(2)}s`);
      dot.style.setProperty('--delay', `${(Math.random() * 3).toFixed(2)}s`);
    });
  },
};
