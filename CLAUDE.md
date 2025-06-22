# Claude Context File - Voiceflow 2025 Project

This file is specifically for Claude (AI assistant) to quickly understand this project in future conversations.

## 🎯 Project Summary

**What it is**: JavaScript animations for a Webflow site (Voiceflow 2025)
**Purpose**: High-performance animations with small bundle size
**Total Size**: ~34KB across 2 bundles (hero-critical.iife.js + app.iife.js)

## 🚨 Key Things to Remember

1. **This is for WEBFLOW** - Not a standalone app!
   - No routing, no framework, just animations
   - Expects Webflow's HTML structure
   - Deployed as IIFE bundles to CDN

2. **Performance is CRITICAL**
   - User explicitly wants small bundles over features
   - Already removed: feature flags, error tracking, testing
   - Bundle budget: 15KB hero, 20KB app (currently slightly over)

3. **Two-Bundle Architecture**
   - `hero-critical.iife.js` - Loads immediately (hero animations)
   - `app.iife.js` - Loads deferred (additional features)
   - Some animations lazy-load within hero bundle

4. **No External Dependencies**
   - GSAP loads from CDN (not bundled)
   - Splide.js provided by Webflow
   - Everything else is custom built

## 🛠️ Common Tasks

### Building
```bash
npm run build          # Creates both bundles in dist/
npm run build:check    # Build + check bundle sizes
```

### If Bundle Too Large
1. Check what was added recently
2. Consider lazy loading non-critical features
3. Remove console.logs and comments
4. Simplify error handling

### Adding New Animation
1. Decide if critical (hero) or deferred (app)
2. Follow existing patterns in similar files
3. Use shared observers from `utils/observers.js`
4. Test bundle size impact

## 📁 Quick File Reference

**Entry Points**:
- `src/hero-critical.js` → `dist/hero-critical.iife.js`
- `src/index.js` → `dist/app.iife.js`

**Core Systems**:
- `performance.js` - Throttling, lazy loading, service worker
- `utils.js` - Error boundaries, DOM helpers
- `observers.js` - Shared IntersectionObserver pattern

**Animations**:
- `hero/heroAnimation.js` - Main timeline (critical)
- `hero/wave.js` - Voice wave (lazy-loaded)
- `hero/cursor.js` - Cursor follow (lazy-loaded)
- `tabs/*.js` - Tab animations (in app bundle)

## ⚡ Performance Features

1. **Adaptive Throttling**: 60fps → 15fps when backgrounded
2. **Service Worker**: Aggressive caching for instant repeat visits
3. **Lazy Loading**: Non-critical animations load on viewport entry
4. **Shared Observers**: Memory-efficient visibility tracking

## 🚫 What NOT to Do

1. **Don't add npm dependencies** - Keep it zero-dependency
2. **Don't add complex features** - This is just animations
3. **Don't increase bundle size** without user approval
4. **Don't add back**: testing, error tracking, feature flags
5. **Don't create new HTML** - Webflow provides all HTML

## 🐛 Common Issues

**"Bundle exceeds budget"**
- Hero optimized from 15.6KB → 14.54KB (UNDER 15KB limit!)
- App bundle now 19.74KB (acceptable with performance monitoring)

**"X is not defined"**
- Check if it's a browser global (add to eslint.config.js)
- GSAP should be loaded by Webflow
- No process.env in browser!

**"Module not found"**
- Check import paths (all relative)
- Some imports are dynamic (lazy-loaded)

## 💡 Design Decisions

1. **Why IIFE not ESM?** - Webflow compatibility
2. **Why two bundles?** - Critical path optimization
3. **Why no framework?** - Webflow provides structure
4. **Why service worker?** - Instant repeat visits
5. **Why lazy loading?** - Reduce initial bundle

## 📊 Current State (as of last update)

- ✅ All animations working
- ✅ Service worker caching active
- ✅ Adaptive frame throttling
- ⚠️ Hero bundle slightly over budget
- ✅ Zero npm dependencies
- ✅ Clean file structure

Remember: This is a Webflow animation library, not an application!