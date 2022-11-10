import path from 'path'
import { scriptDirectory, appDirectory } from '../utils/paths.js'
import { createServer } from 'vite'
import getTemplates from '../utils/getTemplates.js'
import getDependencies from '../utils/getDependencies.js'
import dsHtmlLoader from '../plugin/vite-plugin-ds-html-loader.js'

;(async () => {
  let { default: { templateDir, devDependencies } } = await import(path.join(appDirectory, 'ds.plugin.config.js'))

  templateDir = templateDir ? path.join(appDirectory, templateDir) : path.join(appDirectory, 'src/templates')

  const dsTemplates = await getTemplates(templateDir)
  const dsDevDependencies = await getDependencies(devDependencies)

  const server = await createServer({
    root: path.resolve(scriptDirectory, 'dev'),
    plugins: [
      dsHtmlLoader()
    ],
    resolve: {
      alias: {
        '@dooksa/plugin': path.resolve(appDirectory, 'src', 'index.js'),
        dsDependencies: dsDevDependencies,
        dsTemplates
      }
    }
  })
  await server.listen()

  server.printUrls()
})()
