import { resolve } from 'path'
import { existsSync } from 'fs'
import { scriptDirectory, appDirectory } from '../utils/paths.js'
import { createServer } from 'vite'
import dsHtmlLoader from '../plugin/vite-plugin-ds-html-loader.js'
import basicSsl from '@vitejs/plugin-basic-ssl'
const args = process.argv.slice(2)
const plugins = [basicSsl()]
const resolveConfig = {}
let root

if (args.includes('--lib')) {
  root = resolve(appDirectory, 'src')
} else {
  const configPath = resolve(appDirectory, 'ds.config.js')

  root = resolve(scriptDirectory, 'entry', 'dev')
  plugins.push(dsHtmlLoader)

  resolveConfig.alias = {
    '@dooksa/plugin': resolve(appDirectory, 'src', 'index.js'),
    dsConfig: resolve(scriptDirectory, 'utils', 'emptyExport')
  }

  // check if absolute path exists
  if (existsSync(configPath)) {
    resolveConfig.alias.dsConfig = configPath
  }
}

const server = await createServer({
  root,
  plugins,
  server: {
    https: true
  },
  resolve: resolveConfig
})

;(async () => {
  await server.listen()

  server.printUrls()
})()
