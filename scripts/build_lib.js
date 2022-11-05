import path from 'path'
import { appDirectory } from '../utils/paths.js'
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
          entry: path.resolve(appDirectory, 'src'),
          name,
          fileName
        },
        emptyOutDir: true,
        outDir: path.resolve(appDirectory, 'dist')
      },

      resolve: {
        alias: {
          '@dooksa/plugin': path.resolve(appDirectory, 'src', 'index.js')
        }
      }
    })
  } catch (e) {
    console.error(e)
  }
})()
