import { defineConfig } from 'vite'
import { resolve } from 'path'

/**
 * Vite build configuration for packaging the test helpers.
 *
 * This configuration builds `src/testUtils.js` as a small library in both
 * ESM and CJS formats. Playwright and Node built-ins are marked external so
 * they are not bundled into the library artifact.
 *
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/testUtils.js'),
      formats: ['es', 'cjs'],
      fileName: (format) => `testUtils.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: [
        /^@playwright\/test(?:\/.*)?$/, // don’t bundle Playwright
        'dotenv',
        /node:.*/,
      ],
      output: {
        exports: 'named'
      }
    }
  }
})