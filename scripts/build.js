import path from 'path'
import legacy from '@vitejs/plugin-legacy'
import { appDirectory } from '../utils/paths.js'
import { build } from 'vite'

console.log(path.resolve(appDirectory, 'dist'))

;(async () => {
  await build({
    root: path.resolve(appDirectory, 'build'),
    build: {
      emptyOutDir: true,
      outDir: path.resolve(appDirectory, 'dist'),
      sourcemap: true
    },
    plugins: [
      legacy({
        targets: ['defaults', 'not IE 11']
      })
    ],
    resolve: {
      alias: {
        '@dooksa/plugin': path.resolve(appDirectory, 'src', 'index.js')
      }
    }
  })
})()
