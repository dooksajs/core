import path from 'path'
import fs from 'fs'
import { scriptDirectory, appDirectory } from '../utils/paths.js'
import { createServer } from 'vite'
import '../utils/getDependencies.js'
import getTemplates from '../utils/getTemplates.js'
import dsHtmlLoader from '../plugin/vite-plugin-ds-html-loader.js'

;(async () => {
  let { default: { name, templateDir } } = await import(path.join(appDirectory, 'ds.plugin.config.js'))
  let pluginDepPath = path.resolve(scriptDirectory, 'tmp', name + '-pluginDeps.js')
  const emptyExport = path.resolve(scriptDirectory, 'utils', 'emptyExport.js')

  templateDir = templateDir ? path.join(appDirectory, templateDir) : path.join(appDirectory, 'src/templates')

  const dsTemplates = await getTemplates(templateDir)

  if (!fs.existsSync(pluginDepPath)) {
    pluginDepPath = emptyExport
  }
  console.log(dsTemplates)
  const server = await createServer({
    root: path.resolve(scriptDirectory, 'dev'),
    plugins: [
      dsHtmlLoader()
    ],
    resolve: {
      alias: {
        '@dooksa/plugin': path.resolve(appDirectory, 'src', 'index.js'),
        '@dooksa/plugin-config': path.resolve(appDirectory, 'ds.plugin.config.js'),
        '@dooksa/plugin-dependencies': pluginDepPath,
        dsTemplates
      }
    }
  })
  await server.listen()

  server.printUrls()
})()
