import path from 'path'
import fs from 'fs'
import { scriptDirectory, appDirectory } from '../utils/paths.js'
import { createServer } from 'vite'
import '../utils/getDependencies.js'
import '../utils/getTemplates.js'

;(async () => {
  const { default: { name } } = await import(path.join(appDirectory, 'ds.plugin.config.js'))
  const emptyExport = path.resolve(scriptDirectory, 'utils', 'emptyExport.js')
  let pluginDepPath = path.resolve(scriptDirectory, 'tmp', name + '-pluginDeps.js')
  let pluginTemplates = path.resolve(scriptDirectory, 'tmp', name + '-raw-templates.js')

  if (!fs.existsSync(pluginDepPath)) {
    pluginDepPath = emptyExport
  }

  if (!fs.existsSync(pluginTemplates)) {
    pluginTemplates = emptyExport
  }

  const server = await createServer({
    root: path.resolve(scriptDirectory, 'dev'),
    resolve: {
      alias: {
        '@dooksa/plugin': path.resolve(appDirectory, 'src', 'index.js'),
        '@dooksa/plugin-config': path.resolve(appDirectory, 'ds.plugin.config.js'),
        '@dooksa/plugin-dependencies': pluginDepPath,
        '@dooksa/plugin-templates': pluginTemplates
      }
    }
  })
  await server.listen()

  server.printUrls()
})()
