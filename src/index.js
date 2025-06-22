// Non-critical modules - loaded with defer
import { CardTilt } from './fx/cardTilt.js';
import { BeamCursor } from './fx/beamCursor.js';
import { BlurOverlay } from './fx/blurOverlay.js';
import { AutoTabsModule } from './tabs/autoTabs.js';
import { KHFade } from './tabs/khFade.js';
import { KHGlow } from './tabs/khGlow.js';
import { LuckyButton } from './hero/luckyBtn.js';
import { CTAModule } from './hero/cta.js';
import { DropdownModule } from './hero/dropdown.js';
import { PhoneValidation } from './utils/phoneValidation.js';
import { safeInit } from './utils.js';
import { initPerformanceOptimizations } from './performance.js';

// Initialize full performance monitoring in app bundle
initPerformanceOptimizations();

// Wait for hero to be ready before initializing non-critical features
const initNonCritical = () => {
  // Initialize all non-critical modules with standardized error handling
  const modules = [
    { module: CardTilt, name: 'CardTilt' },
    { module: BeamCursor, name: 'BeamCursor' },
    { module: BlurOverlay, name: 'BlurOverlay' },
    { module: AutoTabsModule, name: 'AutoTabsModule' },
    { module: KHFade, name: 'KHFade' },
    { module: KHGlow, name: 'KHGlow' },
    { module: LuckyButton, name: 'LuckyButton' },
    { module: CTAModule, name: 'CTAModule' },
    { module: DropdownModule, name: 'DropdownModule' },
    { module: PhoneValidation, name: 'PhoneValidation' },
  ];

  modules.forEach(({ module, name }) => {
    safeInit(module, name);
  });
};

// Initialize when both hero and Webflow are ready
if (window.heroReady) {
  window.heroReady.then(() => {
    if (window.Webflow) {
      window.Webflow.push(initNonCritical);
    } else {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNonCritical);
      } else {
        initNonCritical();
      }
    }
  });
} else {
  // Fallback if hero-critical hasn't loaded
  if (window.Webflow) {
    window.Webflow.push(initNonCritical);
  } else {
    document.addEventListener('DOMContentLoaded', initNonCritical);
  }
}
