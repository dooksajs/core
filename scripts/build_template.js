'use strict'

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production'
process.env.NODE_ENV = 'production'

import { exec }  from 'child_process'
import path, { join } from 'path';
import fs from 'fs'
import webpack from 'webpack'
import { parse } from 'node-html-parser'
import { appDirectory } from '../utils/paths.js'
import { createTemplate, createModifier, getAllFiles, storeTemplate, kebabToCamelCase, camelToKebabCase, importScript } from '../utils/createTemplate.js'
import webpackConfig from '../webpack.prod.config.js'

let { default: { filename, templateDir } } = await import(path.join(appDirectory, 'ds.plugin.config.js'))

templateDir = templateDir ? path.join(appDirectory, templateDir) : path.join(appDirectory, 'src/templates') 

if (!fs.existsSync(templateDir)) {
  console.log(`No templates found in "${templateDir}" directory`)
  process.exit(0);
}

const { default: templateNames } = await import(path.join(templateDir, 'index.js'))
let templateImport = ''
let templateExport = ''
let buildId = 0

for (let i = 0; i < templateNames.length; i++) {
  const templateName = templateNames[i]
  const templatePath = path.join(templateDir, templateName)
  const htmlRAW = fs.readFileSync(path.join(templatePath, 'index.html'), 'utf8')
  const document = parse(htmlRAW, { lowerCaseTagName: false, comment: false })
  const rootElement = document.querySelector('template').removeWhitespace()
  const rootScript = document.querySelector('script').removeWhitespace()
  const script = importScript(rootScript.innerText, templatePath)
  const baseTemplate = createTemplate(rootElement)
  
  if (script.modifiers) {
    baseTemplate.modifiers = script.modifiers
  }

  // if (script.views) {
  //   for (let )
  //   const htmlRAW = fs.readFileSync(path.join(templatePath, 'index.html'), 'utf8')
  //   const document = parse(htmlRAW, { lowerCaseTagName: false, comment: false })
  //   const rootElement = document.querySelector('template').removeWhitespace()
  //   const rootScript = document.querySelector('script').removeWhitespace()
  //   const script = importScript(rootScript.innerText, templatePath)
  // }

  baseTemplate.id = script.id
  baseTemplate.name = script.name
  baseTemplate.description = script.description
  baseTemplate.version = script.version
  templateImport += `import ${script.id} from './${script.id}-template.js'\n`
  templateExport += script.id + ','

  storeTemplate('export default ' + JSON.stringify(baseTemplate, null, 2), path.resolve(appDirectory, 'dist', script.id + '-template.js'))
}


storeTemplate(templateImport + '\nexport default [' + templateExport.substring(0, templateExport.length - 1) + ']\n',  path.resolve(appDirectory, 'dist', 'templates.js'))
