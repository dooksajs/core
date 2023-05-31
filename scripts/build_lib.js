import { resolve } from 'path'
import { existsSync } from 'fs'
import { appDirectory } from '../utils/paths.js'
import { build } from 'vite'
import { camelToKebabCase } from '../utils/text.js'

(async () => {
  try {
    const pluginPath = resolve(appDirectory, 'src', 'index.js')
    let { default: { name } } = await import(pluginPath)

    if (!name) {
      const configPath = resolve(appDirectory, 'ds.config.js')

      // check ds.config for library name
      if (existsSync(configPath)) {
        const dsConfig = await import(resolve(appDirectory, 'ds.config.js'))

        name = dsConfig.default.name

        if (!name) {
          throw Error(`Config file missing the "name" key - ${configPath}`)
        }
      } else {
        throw Error(`Missing "name" key, optionally, you can include the name inside ds.config.js ${pluginPath}`)
      }
    }

    const fileName = camelToKebabCase(name)

    await build({
      build: {
        lib: {
          entry: resolve(appDirectory, 'src'),
          name,
          fileName,
          formats: ['es']
        },
        emptyOutDir: true,
        outDir: resolve(appDirectory, 'dist')
      },
      resolve: {
        alias: {
          '@dooksa/plugin': resolve(appDirectory, 'src', 'index.js')
        }
      }
    })
  } catch (e) {
    console.error(e)
  }
})()
