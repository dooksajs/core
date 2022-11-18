import path from 'path'
import fs from 'fs'
import { scriptDirectory, appDirectory } from '../utils/paths.js'
import { createServer } from 'vite'
import dsHtmlLoader from '../plugin/vite-plugin-ds-html-loader.js'

;(async () => {
  const configPath = path.join(appDirectory, 'ds.config.js')
  let dsConfig = '../utils/emptyExport'

  // check if absolute path exists
  if (fs.existsSync(configPath)) {
    dsConfig = configPath
  }

  const server = await createServer({
    root: path.resolve(scriptDirectory, 'entry', 'dev'),
    plugins: [
      dsHtmlLoader()
    ],
    resolve: {
      alias: {
        '@dooksa/plugin': path.resolve(appDirectory, 'src', 'index.js'),
        dsConfig
      }
    }
  })
  await server.listen()

  server.printUrls()
})()
