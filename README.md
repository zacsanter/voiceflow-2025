# Voiceflow 2025 - Webflow Animation Bundle

A high-performance JavaScript animation system built specifically for the Voiceflow 2025 Webflow site. This project provides smooth, optimized animations with enterprise-grade reliability while maintaining small bundle sizes.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Check bundle sizes
npm run build:check
```

## 📦 Bundle Output

After building, you'll find two IIFE bundles in `dist/`:
- `hero-critical.iife.js` (~15KB) - Critical animations that load immediately
- `app.iife.js` (~18KB) - Additional features and animations

**Total bundle size: ~34KB** (highly optimized from original ~50KB+)

## 🏗️ Project Architecture

### Core Design Principles
1. **Performance First** - Every decision prioritizes loading speed and runtime performance
2. **Webflow Integration** - Built specifically to work with Webflow's architecture
3. **Progressive Enhancement** - Critical animations load first, extras lazy-load
4. **Small Bundle Size** - Aggressive optimization and code splitting

### Key Features
- **Adaptive Frame Rate** - 60fps when visible, 15fps when backgrounded
- **Service Worker Caching** - Near-instant repeat visits
- **Lazy Loading** - Non-critical animations load on-demand
- **Shared Observers** - Memory-efficient intersection/visibility observation
- **Error Boundaries** - Graceful fallbacks prevent crashes

## 📁 File Structure

```
src/
├── hero-critical.js      # Entry point for critical bundle
├── index.js             # Entry point for app bundle
├── config.js            # Centralized configuration
├── performance.js       # Performance optimizations & monitoring
├── utils.js            # Core utilities & error handling
├── utils/
│   └── observers.js    # Shared observer pattern
├── hero/               # Hero section animations
│   ├── heroAnimation.js # Main hero timeline (heading, description)
│   ├── wave.js         # Voice wave SVG animation (lazy-loaded)
│   ├── cursor.js       # Cursor follow animations (lazy-loaded)
│   ├── marquee.js      # Logo marquee animation
│   ├── cta.js          # CTA button interactions
│   ├── dropdown.js     # Dropdown menu animations
│   └── luckyBtn.js     # Lucky button animations
├── tabs/               # Tab section animations
│   ├── autoTabs.js     # Automatic tab switching
│   ├── khFade.js       # Ken Heron fade effect
│   └── khGlow.js       # Ken Heron glow effect
└── fx/                 # Additional effects
    ├── beamCursor.js   # Beam cursor effect
    └── cardTilt.js     # 3D card tilt effect
```

## 🔧 Build System

### Vite Configuration
- `vite.hero.config.js` - Builds hero-critical bundle
- `vite.app.config.js` - Builds app bundle

### Key Build Features
- **IIFE Format** - Self-contained bundles for Webflow
- **Tree Shaking** - Removes unused code
- **Minification** - Terser for smallest output
- **Source Maps** - For debugging

## 🎯 Performance Optimizations

### 1. Animation Throttling
```javascript
// Adaptive frame rate based on visibility
- 60fps when page is visible
- 15fps when tab is backgrounded
- Automatic pause/resume
```

### 2. Code Splitting
```javascript
// Critical animations load immediately
- Hero timeline
- Marquee

// Non-critical animations lazy-load
- Voice wave animation
- Cursor animations
```

### 3. Service Worker
- Aggressive caching of all JS bundles
- 7-day cache duration
- Stale-while-revalidate strategy
- Near-instant repeat visits

### 4. Resource Hints
- DNS prefetch for CDNs
- Preconnect to critical origins
- GSAP preloading

## 🛠️ Development

### Available Scripts
```bash
npm run build        # Build both bundles
npm run build:hero   # Build hero-critical only
npm run build:app    # Build app only
npm run lint         # Check code quality
npm run lint:fix     # Auto-fix issues
npm run format       # Format with Prettier
npm run budget       # Check bundle sizes
```

### Code Quality
- ESLint with Unicorn plugin for modern JS
- Prettier for consistent formatting
- Bundle size budgets (15KB hero, 20KB app)

## 🌐 Webflow Integration

### 1. Upload Built Files
Upload from `dist/` to Webflow:
- `hero-critical.iife.js`
- `app.iife.js`
- `/public/sw.js` (service worker)

### 2. Add to Webflow Head
```html
<!-- In site settings > Custom Code > Head -->
<script src="[your-cdn]/hero-critical.iife.js"></script>
```

### 3. Add to Webflow Footer
```html
<!-- In site settings > Custom Code > Footer -->
<script src="[your-cdn]/app.iife.js" defer></script>
```

### 4. Required HTML Structure
The animations expect these Webflow classes:
- `.page-wrapper` - Main page container
- `.home_hero` - Hero section
- `.heading-style-h1` - Main heading
- `.voice-wave-bg` - Voice wave container
- `.hero-logo-list` - Logo marquee
- And more (see `config.js`)

## ⚡ Core Components

### Hero Animation
- Character-by-character heading animation
- Gradient text effect preserved across characters
- Smooth entrance with blur and scale

### Voice Wave
- Fetches and animates SVG dynamically
- Fallback gradient on error
- Explodes paths into individual dots

### Cursor Animation
- Physics-based cursor following
- Smooth interpolation with bias
- Tap effects on keywords

### Marquee
- Continuous logo scrolling
- Splide.js integration
- Auto-start after hero loads

## 🔍 Performance Monitoring

The system includes Core Web Vitals monitoring:
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)

Check console in development for metrics.

## 🚨 Error Handling

- Global error boundaries prevent crashes
- Fallback UI for failed animations
- Retry logic for network requests
- Console logging in development only

## 📝 Important Notes

### Bundle Size
- Hero bundle is slightly over budget (15.6KB vs 15KB target)
- This is due to performance optimizations and error handling
- Still excellent for an animation-heavy site

### Browser Support
- Modern browsers only (ES2022)
- Service Worker requires HTTPS
- Intersection Observer required

### Dependencies
- GSAP loaded from CDN (not bundled)
- Splide.js expected to be loaded by Webflow
- No other runtime dependencies

## 🔄 Version History

**v1.0.0** - Current version
- Complete rewrite for performance
- Removed enterprise features (error tracking, feature flags)
- Added service worker caching
- Implemented code splitting
- Reduced bundle size by 30%

## 🤝 Contributing

When modifying animations:
1. Keep bundle sizes small
2. Test performance on low-end devices
3. Ensure Webflow compatibility
4. Follow existing code patterns
5. Run `npm run quality` before committing

## 📄 License

Proprietary - Voiceflow 2025

---

Built with ❤️ for blazing-fast Webflow animations