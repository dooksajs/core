import path from 'path'
import { appDirectory } from '../utils/paths.js'
import { build } from 'vite'
import { camelToKebabCase } from '../utils/text.js'

;(async () => {
  try {
    const pluginPath = path.join(appDirectory, 'src', 'index.js')
    const { default: { name } } = await import(pluginPath)

    if (!name) {
      throw Error(`${pluginPath}: Missing "name"`)
    }

    const fileName = camelToKebabCase(name)

    await build({
      build: {
        lib: {
          entry: path.resolve(appDirectory, 'src'),
          name,
          fileName,
          formats: ['es']
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
