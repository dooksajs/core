import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'objectHash',
      // the proper extensions will be added
      fileName: 'object-hash'
    }
  }
})
