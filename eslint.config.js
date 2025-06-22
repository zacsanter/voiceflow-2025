import js from '@eslint/js';
import unicorn from 'eslint-plugin-unicorn';
import prettier from 'eslint-config-prettier';

export default [
  // Base recommended configurations
  js.configs.recommended,
  prettier, // Must be last to override conflicting rules
  
  {
    plugins: {
      unicorn
    },
    
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        gsap: 'readonly',
        Splide: 'readonly',
        process: 'readonly',
        performance: 'readonly',
        URLSearchParams: 'readonly',
        IntersectionObserver: 'readonly',
        MutationObserver: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        requestIdleCallback: 'readonly',
        PerformanceObserver: 'readonly'
      }
    },

    rules: {
      // Enterprise-grade error prevention
      'no-console': ['warn', { allow: ['error', 'warn', 'info'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      
      
      
      // Code quality
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      'no-undef': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'prefer-destructuring': ['error', {
        array: false,
        object: true
      }],
      
      // Modern JavaScript best practices
      'unicorn/prefer-query-selector': 'error',
      'unicorn/prefer-modern-dom-apis': 'error',
      'unicorn/prefer-add-event-listener': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-optional-catch-binding': 'error',
      'unicorn/throw-new-error': 'error',
      
      // Error handling
      'unicorn/prefer-native-coercion-functions': 'error',
      'unicorn/error-message': 'error',
      
      // Performance
      'unicorn/no-for-loop': 'error',
      'unicorn/prefer-spread': 'error',
      'unicorn/prefer-set-has': 'error',
      
      // Consistency
      'unicorn/filename-case': ['error', { 
        case: 'camelCase',
        ignore: ['hero-critical.js'] // Build file exception
      }],
      'unicorn/no-null': 'off', // Allow null in DOM contexts
      'unicorn/prevent-abbreviations': 'off' // Allow common abbreviations
    },

    ignores: [
      'dist/**',
      'node_modules/**',
      '*.min.js',
      'debug-test.html',
      'test.html',
      'webflow-integration.html',
      'index.html'
    ]
  }
];