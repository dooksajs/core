import path from 'path';
import fs from 'fs';
import { scriptDirectory, appDirectory } from '../utils/paths.js'
import { createServer } from 'vite'
import '../utils/getDependencies.js'

;(async () => {
  const { default: { name } } = await import(path.join(appDirectory, 'ds.plugin.config.js'))

  const alias = {
    '@dooksa/plugin': path.resolve(appDirectory, 'src', 'index.js'),
    '@dooksa/pluginConfig': path.resolve(appDirectory, 'ds.plugin.config.js')
  }

  const pluginDepPath = path.resolve(scriptDirectory, 'tmp', name + '-pluginDeps.js')
  
  if (fs.existsSync(pluginDepPath)) {
    alias['@dooksa/pluginDeps'] = pluginDepPath
  }

  const server = await createServer({
    root: path.resolve(scriptDirectory, 'template'),
    resolve: { alias }    
  })
  await server.listen()

  server.printUrls()
})()

// 'use strict'

// import { exec }  from 'child_process'
// import path, { join } from 'path';
// import fs from 'fs'
// import { parse } from 'node-html-parser'
// import { appDirectory } from '../utils/paths.js'
// import { createTemplate, createModifier, getAllFiles, storeTemplate, kebabToCamelCase, camelToKebabCase, importScript } from '../utils/createTemplate.js'

// let { default: { filename, templateDir } } = await import(path.join(appDirectory, 'ds.plugin.config.js'))

// templateDir = templateDir ? path.join(appDirectory, templateDir) : path.join(appDirectory, 'src/templates') 

// if (!fs.existsSync(templateDir)) {
//   console.log(`No templates found in "${templateDir}" directory`)
//   process.exit(0);
// }

// const { default: templateNames } = await import(path.join(templateDir, 'index.js'))
// let templateImport = ''
// let templateExport = ''
// let buildId = 0

// for (let i = 0; i < templateNames.length; i++) {
//   const templateName = templateNames[i]
//   const templatePath = path.join(templateDir, templateName)
//   const htmlRAW = fs.readFileSync(path.join(templatePath, 'index.html'), 'utf8')
//   const document = parse(htmlRAW, { lowerCaseTagName: false, comment: false })
//   const rootElement = document.querySelector('template').removeWhitespace()
//   const rootScript = document.querySelector('script').removeWhitespace()
//   const script = importScript(rootScript.innerText, templatePath)
//   const baseTemplate = createTemplate(rootElement)
  
//   if (script.modifiers) {
//     baseTemplate.modifiers = script.modifiers
//   }

//   // if (script.views) {
//   //   for (let )
//   //   const htmlRAW = fs.readFileSync(path.join(templatePath, 'index.html'), 'utf8')
//   //   const document = parse(htmlRAW, { lowerCaseTagName: false, comment: false })
//   //   const rootElement = document.querySelector('template').removeWhitespace()
//   //   const rootScript = document.querySelector('script').removeWhitespace()
//   //   const script = importScript(rootScript.innerText, templatePath)
//   // }

//   baseTemplate.id = script.id
//   baseTemplate.name = script.name
//   baseTemplate.description = script.description
//   baseTemplate.version = script.version
//   templateImport += `import ${script.id} from './${script.id}-template.js'\n`
//   templateExport += script.id + ','

//   storeTemplate('export default ' + JSON.stringify(baseTemplate, null, 2), path.resolve(appDirectory, 'dist', script.id + '-template.js'))
// }


// storeTemplate(templateImport + '\nexport default [' + templateExport.substring(0, templateExport.length - 1) + ']\n',  path.resolve(appDirectory, 'dist', 'templates.js'))
