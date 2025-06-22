import { $$ } from '../utils.js';
import { CONFIG } from '../config.js';

export const DropdownModule = {
  elementsToBlur: null,
  dropdownConfigs: [],

  init() {
    this.elementsToBlur = $$(CONFIG.selectors.blurTargets);
    this.setupDropdowns();
    this.addEventListeners();
  },

  setupDropdowns() {
    const dropdowns = $$('.hero-selector-dropdown');

    this.dropdownConfigs = dropdowns
      .map((dd, idx) => {
        const config = this.createDropdownConfig(dd, idx);
        if (config) {
          this.setupAccessibility(config, idx);
          this.disableWebflowDropdown(dd);
        }
        return config;
      })
      .filter(Boolean);
  },

  createDropdownConfig(dropdown, _index) {
    const visibleToggle = dropdown.previousElementSibling;
    const menu = dropdown.querySelector('.hero-dropdown-list');
    const menuItems = menu ? $$('.hero-dropdown-list-item', menu) : [];

    if (!visibleToggle || !menu) return null;

    return { dropdown, visibleToggle, menu, menuItems };
  },

  setupAccessibility(config, index) {
    const { visibleToggle, menu, menuItems } = config;
    const baseId = `hero-dropdown-${index}`;

    // Setup IDs
    menu.id = menu.id || `${baseId}-menu`;
    visibleToggle.id = visibleToggle.id || `${baseId}-toggle`;

    // Setup toggle attributes
    Object.assign(visibleToggle, {
      role: 'button',
      tabIndex: '0',
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
      'aria-controls': menu.id,
    });

    // Setup menu attributes
    Object.assign(menu, {
      role: 'menu',
      'aria-labelledby': visibleToggle.id,
      tabIndex: '-1',
    });

    // Setup menu items
    menuItems.forEach(item => {
      item.setAttribute('role', 'menuitem');
      item.setAttribute('tabindex', '-1');
    });
  },

  disableWebflowDropdown(dropdown) {
    const wfToggle = dropdown.querySelector('.w-dropdown-toggle');
    if (wfToggle) {
      wfToggle.style.pointerEvents = 'none';
    }
  },

  toggleBlur(shouldBlur) {
    this.elementsToBlur.forEach(el => el.classList.toggle('is-blurred', shouldBlur));
  },

  closeAllDropdowns(exceptConfig = null) {
    this.dropdownConfigs.forEach(config => {
      if (exceptConfig && config.dropdown === exceptConfig.dropdown) return;

      config.dropdown.classList.remove('is-open');
      if (config.menu) config.menu.style.display = '';
      config.visibleToggle.setAttribute('aria-expanded', 'false');
    });
  },

  openDropdown(config) {
    this.closeAllDropdowns(config);
    config.dropdown.classList.add('is-open');
    if (config.menu) config.menu.style.display = 'flex';
    config.visibleToggle.setAttribute('aria-expanded', 'true');
    if (config.menuItems.length > 0) {
      config.menuItems[0].focus();
    }
  },

  addEventListeners() {
    // Click handling
    document.addEventListener('click', e => this.handleClick(e));

    // Keyboard handling
    this.dropdownConfigs.forEach(config => {
      this.addToggleKeyboardHandling(config);
      this.addMenuKeyboardHandling(config);
    });

    // Global escape key
    document.addEventListener('keydown', e => {
      if (
        (e.key === 'Escape' || e.key === 'Esc') &&
        this.dropdownConfigs.some(c => c.dropdown.classList.contains('is-open'))
      ) {
        this.closeAllDropdowns();
        this.toggleBlur(false);
      }
    });
  },

  handleClick(e) {
    const { target } = e;
    const clickedToggle = target.closest('.hero-box-selector');
    const clickedItem = target.closest('.hero-dropdown-list-item');

    if (clickedToggle) {
      this.handleToggleClick(clickedToggle);
    } else if (clickedItem) {
      this.handleItemClick(clickedItem);
    } else if (!target.closest('.hero-selector-dropdown')) {
      this.closeAllDropdowns();
      this.toggleBlur(false);
    }
  },

  handleToggleClick(toggle) {
    const config = this.dropdownConfigs.find(c => c.visibleToggle === toggle);
    if (!config) return;

    const willOpen = !config.dropdown.classList.contains('is-open');

    if (willOpen) {
      this.openDropdown(config);
    } else {
      this.closeAllDropdowns();
    }

    this.toggleBlur(willOpen);
  },

  handleItemClick(item) {
    const config = this.dropdownConfigs.find(c => c.menu.contains(item));
    if (!config) return;

    const displayDiv = config.visibleToggle.querySelector('div');
    if (displayDiv) {
      displayDiv.textContent = item.dataset.value || item.textContent?.trim() || '';
    }

    this.closeAllDropdowns();
    this.toggleBlur(false);
  },

  addToggleKeyboardHandling(config) {
    config.visibleToggle.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isOpen = config.visibleToggle.getAttribute('aria-expanded') === 'true';

        if (!isOpen) {
          this.openDropdown(config);
          this.toggleBlur(true);
        } else {
          this.closeAllDropdowns();
          this.toggleBlur(false);
        }
      }
    });
  },

  addMenuKeyboardHandling(config) {
    if (!config.menu) return;

    config.menu.addEventListener('keydown', e => {
      const { menuItems, visibleToggle } = config;
      if (!menuItems.length) return;

      const focusedIndex = menuItems.findIndex(item => item === document.activeElement);

      const keyHandlers = {
        Escape: () => {
          this.closeAllDropdowns();
          visibleToggle.focus();
          this.toggleBlur(false);
        },
        ArrowDown: () => {
          const nextIndex = (focusedIndex + 1) % menuItems.length;
          menuItems[nextIndex].focus();
        },
        ArrowUp: () => {
          const prevIndex = (focusedIndex - 1 + menuItems.length) % menuItems.length;
          menuItems[prevIndex].focus();
        },
        Home: () => menuItems[0]?.focus(),
        End: () => menuItems[menuItems.length - 1]?.focus(),
        Enter: () => {
          if (focusedIndex >= 0) {
            menuItems[focusedIndex].click();
          }
        },
        ' ': () => {
          if (focusedIndex >= 0) {
            menuItems[focusedIndex].click();
          }
        },
        Tab: () => {
          this.closeAllDropdowns();
          this.toggleBlur(false);
        },
      };

      const handler = keyHandlers[e.key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    });
  },
};
