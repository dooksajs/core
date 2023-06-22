import path from 'path'
import { appDirectory } from '../utils/paths.js'
import { build } from 'vite'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

;(async () => {
  await build({
    root: path.resolve(appDirectory, 'build'),
    build: {
      emptyOutDir: true,
      outDir: path.resolve(appDirectory, 'dist'),
      sourcemap: true
    },
    plugins: [
      wasm(),
      topLevelAwait()
    ],
    resolve: {
      alias: {
        '@dooksa/plugin': path.resolve(appDirectory, 'src', 'index.js')
      }
    }
  })
})()
