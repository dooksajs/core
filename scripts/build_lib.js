import path from 'path'
import legacy from '@vitejs/plugin-legacy'
import { appDirectory, scriptDirectory } from '../utils/paths.js'
import { build } from 'vite'

;(async () => {
  try {
    const pluginConfigPath = path.join(appDirectory, 'ds.plugin.config.js')
    const { default: { name, fileName } } = await import(pluginConfigPath)

    if (!name) {
      throw Error(`${pluginConfigPath}: Missing "name"`)
    }

    if (!fileName) {
      throw Error(`${pluginConfigPath}: Missing "fileName"`)
    }

    await build({
      build: {
        lib: {
          entry: path.resolve(appDirectory, 'src'),,
          name,
          fileName
        },
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
        alias:{
          '@dooksa/plugin': path.resolve(appDirectory, 'src', 'index.js')
        }
      }
    })
  } catch (e) {
    console.error(e)
  }
})()