import { scriptDirectory, appDirectory } from '../utils/paths.js'
import { kebabToCamelCase } from '../utils/text.js'
import path from 'path'
import fs from 'fs'

;(async () => {
  const { default: { name, devDependencies } } = await import(path.resolve(appDirectory, 'ds.plugin.config.js'))

  const depPath = path.join(scriptDirectory, 'tmp', name + '-pluginDeps.js')
  let dependencies = 'export default {'

  if (devDependencies) {
    const depNames = []
    dependencies = ''

    for (let i = 0; i < devDependencies.length; i++) {
      const dependency = devDependencies[i]
      const name = dependency.split('/')
      const depPath = path.join(appDirectory, 'node_modules', dependency, 'src', 'index.js')
      const depImportName = kebabToCamelCase(name[name.length - 1])

      depNames.push(depImportName)

      dependencies += `import ${depImportName} from '${depPath}';\n`
    }

    dependencies += 'export default {'

    for (let i = 0; i < depNames.length; i++) {
      dependencies += depNames[i]
    }
  }

  await fs.writeFileSync(depPath, dependencies + '}')
})()
