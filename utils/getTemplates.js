import { scriptDirectory } from './paths.js'
import path from 'path'
import fs from 'fs'

export default async (templateDir) => {
  if (!fs.existsSync(templateDir)) {
    return
  }

  const entry = path.join(templateDir, 'index.js')

  if (!fs.existsSync(entry)) {
    return path.resolve(scriptDirectory, 'utils', 'emptyExport.js')
  }

  const { default: templatePaths } = await import(entry)
  const importPath = path.join(scriptDirectory, 'tmp', 'ds-templates.js')
  let templateImports = ''
  let templateExport = ''

  for (let i = 0; i < templatePaths.length; i++) {
    const templatePath = templatePaths[i]
    const templateFilePath = path.join(templateDir, templatePath)

    templateImports += `import dst_${i} from '${templateFilePath}' \n`
    templateExport += `dst_${i},`
  }

  try {
    await fs.writeFileSync(importPath, `${templateImports}\nexport default [ ${templateExport} ]`)
  } catch (error) {
    console.log(error)
  }

  return importPath
}
