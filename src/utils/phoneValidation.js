// Phone validation utility for test agent form
// Validates phone numbers and manages button state

import { $, Logger } from '../utils.js';

export const PhoneValidation = {
  /**
   * Initialize phone validation for test agent form
   */
  init() {
    const container = $('.test-agent_div');
    if (!container) {
      Logger.warn('Test agent div not found', 'PhoneValidation');
      return;
    }

    const phoneInput = container.querySelector('input[type="tel"], input[name*="phone"], input[placeholder*="phone" i]');
    const button = $('.test-agent_button');
    
    if (!phoneInput) {
      Logger.warn('Phone input not found in test agent form', 'PhoneValidation');
      return;
    }

    if (!button) {
      Logger.warn('Test agent button not found', 'PhoneValidation');
      return;
    }

    this.setupValidation(phoneInput, button);
    Logger.info('Phone validation initialized', 'PhoneValidation');
  },

  /**
   * Setup validation listeners and initial state
   */
  setupValidation(phoneInput, button) {
    // Set initial state - button disabled
    this.setButtonState(button, false);
    
    // Real-time validation on input
    phoneInput.addEventListener('input', (e) => {
      const isValid = this.validatePhone(e.target.value);
      this.setButtonState(button, isValid);
    });

    // Validation on blur for better UX
    phoneInput.addEventListener('blur', (e) => {
      const isValid = this.validatePhone(e.target.value);
      this.setButtonState(button, isValid);
    });

    // Prevent form submission if phone is invalid
    const form = phoneInput.closest('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        if (!this.validatePhone(phoneInput.value)) {
          e.preventDefault();
          Logger.warn('Form submission blocked - invalid phone number', 'PhoneValidation');
        }
      });
    }

    // Prevent button clicks if phone is invalid
    button.addEventListener('click', (e) => {
      if (!this.validatePhone(phoneInput.value)) {
        e.preventDefault();
        e.stopPropagation();
        Logger.warn('Button click blocked - invalid phone number', 'PhoneValidation');
      }
    });
  },

  /**
   * Validate phone number using multiple patterns
   * Supports US, UK, and common international formats
   */
  validatePhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    
    // Remove all non-digit characters for length check
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Must have at least 10 digits, max 15 (international standard)
    if (digitsOnly.length < 10 || digitsOnly.length > 15) return false;
    
    // Common phone number patterns
    const patterns = [
      // US formats
      /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
      // International with country code
      /^\+[1-9]\d{1,14}$/,
      // UK format
      /^\+?44[-.\s]?[1-9]\d{8,9}$/,
      // Generic international
      /^\+?[1-9]\d{7,14}$/,
      // Simple 10+ digit validation
      /^[+]?[\d\s\-()]{10,}$/
    ];
    
    return patterns.some(pattern => pattern.test(phone.trim()));
  },

  /**
   * Set button state and visual feedback
   */
  setButtonState(button, isValid) {
    if (isValid) {
      button.classList.add('active');
      button.disabled = false;
      button.style.pointerEvents = 'auto';
      button.style.opacity = '1';
    } else {
      button.classList.remove('active');
      button.disabled = true;
      button.style.pointerEvents = 'none';
    }
  }
};