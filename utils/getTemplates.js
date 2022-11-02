import { scriptDirectory, appDirectory } from './paths.js'
import path from 'path';
import fs from 'fs'

;(async () => {
  let { default: { name, templateDir } } = await import(path.join(appDirectory, 'ds.plugin.config.js'))

  templateDir = templateDir ? path.join(appDirectory, templateDir) : path.join(appDirectory, 'src/templates') 

  if (!fs.existsSync(templateDir)) {
    return
  }
  console.log(templateDir)
  const { default: templateNames } = await import(path.join(templateDir, 'index.js'))
  const templateFilePath = path.join(scriptDirectory, 'tmp', name +'-raw-templates.js')
  let templateExport = ''

  for (let i = 0; i < templateNames.length; i++) {
    const templateName = templateNames[i]
    const templatePath = path.join(templateDir, templateName)
    const htmlRAW = fs.readFileSync(path.join(templatePath, 'index.html'), 'utf8')

    templateExport += `{ name: '${templateName}', html: \`${htmlRAW}\` }, \n`
    // const document = parse(htmlRAW, { lowerCaseTagName: false, comment: false })
    // const rootElement = document.querySelector('template').removeWhitespace()
    // const rootScript = document.querySelector('script').removeWhitespace()
    // const script = importScript(rootScript.innerText, templatePath)
    // const baseTemplate = createTemplate(rootElement)
    
    // if (script.modifiers) {
    //   baseTemplate.modifiers = script.modifiers
    // }

    // if (script.views) {
    //   for (let )
    //   const htmlRAW = fs.readFileSync(path.join(templatePath, 'index.html'), 'utf8')
    //   const document = parse(htmlRAW, { lowerCaseTagName: false, comment: false })
    //   const rootElement = document.querySelector('template').removeWhitespace()
    //   const rootScript = document.querySelector('script').removeWhitespace()
    //   const script = importScript(rootScript.innerText, templatePath)
    // }

    // baseTemplate.id = script.id
    // baseTemplate.name = script.name
    // baseTemplate.description = script.description
    // baseTemplate.version = script.version
    // templateImport += `import ${script.id} from './${script.id}-template.js'\n`
    // templateExport += script.id + ','

    // storeTemplate('export default ' + JSON.stringify(baseTemplate, null, 2), path.resolve(appDirectory, 'dist', script.id + '-template.js'))
  }

  // storeTemplate(templateImport + '\nexport default [' + templateExport.substring(0, templateExport.length - 1) + ']\n',  path.resolve(appDirectory, 'dist', 'templates.js'))
  try {
    await fs.writeFileSync(templateFilePath, `export default [ ${templateExport} ]`)
  } catch (error) {
    console.log(error)
  }
})()