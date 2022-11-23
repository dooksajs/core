import { resolve } from 'path'
import { existsSync } from 'fs'
import { scriptDirectory, appDirectory } from '../utils/paths.js'
import { createServer } from 'vite'
import dsHtmlLoader from '../plugin/vite-plugin-ds-html-loader.js'

;(async () => {
  const configPath = resolve(appDirectory, 'ds.config.js')
  let dsConfig = '../utils/emptyExport'

  // check if absolute path exists
  if (existsSync(configPath)) {
    dsConfig = configPath
  }

  const server = await createServer({
    root: resolve(scriptDirectory, 'entry', 'dev'),
    plugins: [
      dsHtmlLoader()
    ],
    resolve: {
      alias: {
        '@dooksa/plugin': resolve(appDirectory, 'src', 'index.js'),
        dsConfig
      }
    }
  })
  await server.listen()

  server.printUrls()
})()
