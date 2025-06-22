import { $ } from '../utils.js';
import { CONFIG } from '../config.js';
import { HeroAnimation } from './heroAnimation.js';
import { CursorAnimation } from './cursor.js';

export class HeroController {
  constructor() {
    this.modules = [HeroAnimation, CursorAnimation];
  }

  init() {
    // Make page visible immediately
    const pageWrapperArray = $(CONFIG.selectors.pageWrapper);
    if (pageWrapperArray && pageWrapperArray.length) {
      pageWrapperArray[0].style.opacity = '1';
    }

    // Initialize all modules
    this.modules.forEach(module => {
      try {
        module.init();
      } catch {
        // Silently handle initialization errors
      }
    });
  }
}
