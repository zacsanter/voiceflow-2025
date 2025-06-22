import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'VoiceflowApp',
      fileName: 'app',
      formats: ['iife']
    },
    rollupOptions: {
      external: ['gsap', 'Splide'],
      output: {
        globals: {
          gsap: 'gsap',
          Splide: 'Splide'
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: false
  }
});