import { defineConfig } from 'vite'
import { resolve } from 'path'

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