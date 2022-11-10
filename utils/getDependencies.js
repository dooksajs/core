import { scriptDirectory, appDirectory } from '../utils/paths.js'
import path from 'path'
import fs from 'fs'

export default async (devDependencies) => {
  const depPath = path.join(scriptDirectory, 'tmp', 'ds-dependenies.js')
  let imports = ''
  let exports = ''

  if (devDependencies) {
    for (let i = 0; i < devDependencies.length; i++) {
      const dependency = devDependencies[i]
      let depPath = dependency.path
      let packageExists = true

      if (dependency.absolutePath) {
        depPath = path.resolve(appDirectory, dependency.path)

        // check if absolute path exists
        if (!fs.existsSync(depPath)) {
          packageExists = false
          console.log(depPath, 'development package could not be found')
        }
      }

      if (packageExists) {
        imports += `import ${dependency.name} from '${depPath}';\n`
        exports += `${dependency.name},`
      }
    }
  }

  await fs.writeFileSync(depPath, imports + '\n export default {' + exports + '}')

  return depPath
}
