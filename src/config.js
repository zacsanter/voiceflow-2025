export const CONFIG = {
  animation: {
    tapDelay: 1500,
    tapStagger: 600,
    tapDur: 700,
    entrDur: 600,
    entrOffset: 60,
    wavyAmpl: 2.5,
    wavySpeed: 0.0018,
    pointerBias: 3,
    biasLerp: 0.16,
    fadeDur: 0.35,
    shiftPx: 4,
    ease: 'cubic-bezier(0.4,0,0.2,1)',
  },
  timing: {
    domRetryDelay: 100,
    webflowRenderDelay: 10,
    marqueeStartDelay: 10,
    cardTiltDuration: 0.25,
    cardTiltResetDuration: 0.45,
    observerThreshold: 0.25,
    visibilityThreshold: 0.1,
  },
  performance: {
    throttleAnimations: true,
    pauseOnHidden: true,
    useIntersectionObserver: true,
  },
  selectors: {
    pageWrapper: '.page-wrapper',
    heroSection: '.home_hero',
    heading: '.heading-style-h1',
    description: '.home_hero-description_new p',
    luckyCard: '.hero-lucky-card-wrapper',
    image: '.image-207',
    luckyBtn: '.hero-lucky-card-list_btn',
    ctaButton: '.hero-card-cta',
    ctaSection: '.newhome-cta_section',
    blurTargets: '.hero-cta-text',
  },
  colors: {
    voice: '#5b9fd7',
    customerSupport: '#56b365',
    zendesk: '#dc8879',
    openai: '#d6528a',
  },
  cta: {
    baseURL: 'https://creator.voiceflow.com/signup',
    paramKeys: ['modality', 'usecase', 'integration', 'provider'],
  },
};

export const SELECTOR_CURSOR_PAIRS = [
  { sel: '.voice', cur: '.braden-new', colour: CONFIG.colors.voice },
  { sel: '.customer-support', cur: '.connor-new', colour: CONFIG.colors.customerSupport },
  { sel: '.zendesk', cur: '.daniel-new', colour: CONFIG.colors.zendesk },
  { sel: '.openai', cur: '.jacklyn-new', colour: CONFIG.colors.openai },
];
